// Updated src/app/dashboard/page.tsx

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormEditing } from './hooks/useFormEditing'
import { useFormGeneration } from './hooks/useFormGeneration'

// CSS IMPORTS - Load in this specific order for proper precedence
import './dashboard.css'                           // Your existing base styles
import './styles/compact-chat-input.css'          // Your existing compact input styles  
import './styles/dashboard-chat-panel-fixes.css'  // Your existing chat panel fixes
import './styles/dashboard-critical.css'          // NEW: High-specificity overrides
import './styles/enhanced-form-preview.css'       // NEW: Enhanced form preview with publish

// Import the enhanced components
import EnhancedChatPanel from './components/EnhancedChatPanel'
import FormPreview from './components/EnhancedFormPreview'
import { FieldExtraction } from './types'

// Helper to convert base64 back to File - FIXED for PDF
const base64ToFile = (base64: string, filename: string, mimeType: string, isPDF = false): File => {
  if (isPDF) {
    // For PDFs, base64 is clean without data URL prefix
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new File([byteArray], filename, { type: mimeType })
  } else {
    // For images, base64 includes data URL prefix
    const byteCharacters = atob(base64.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new File([byteArray], filename, { type: mimeType })
  }
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-bg-animation">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="dashboard-particle" />
        ))}
      </div>
      <div className="dashboard-layout">
        <div className="chat-panel-enhanced">
          <div className="chat-header-compact">
            <h2>Loading Dashboard...</h2>
          </div>
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner" />
              <span>Initializing workspace...</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
          </div>
        </div>
        <div className="form-preview-panel">
          <div className="form-preview-header">
            <h1 className="form-preview-title">Form Preview</h1>
          </div>
          <div className="form-preview-container">
            <div className="form-preview-card">
              <div className="form-content">
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>⏳</div>
                  <div>Setting up your workspace...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Separate component that uses useSearchParams
function DashboardContent() {
  const [description, setDescription] = useState('')
  const [hasProcessedLandingParams, setHasProcessedLandingParams] = useState(false)
  const [isFromLanding, setIsFromLanding] = useState(false)
  const [isStylingPanelOpen, setIsStylingPanelOpen] = useState(false)
  const searchParams = useSearchParams()

  // Enhanced hook with all functionality
  const {
    formSchema,
    isLoading,
    isPublishing,
    publishedFormId,
    error,
    chatHistory,
    customButtonText,
    uploadedImage,
    uploadedPDF,
    uploadedURL,
    extractedFields,
    isAnalyzing,
    analysisComplete,
    pdfPageSelection,
    generateForm,
    publishForm,
    updateFormSchema,
    updateButtonText,
    analyzeScreenshot,
    analyzePDF,
    analyzeURL,
    generateFormFromFields,
    handleImageUpload,
    handlePDFUpload,
    handleURLUpload,
    handlePageSelectionComplete,
    resetAnalysis
  } = useFormGeneration()

  const {
    editingField,
    pendingChanges,
    hasUnsavedChanges,
    editValue,
    setEditValue,
    startEditing,
    saveEdit,
    cancelEdit,
    saveChanges,
    discardChanges,
    toggleRequired,
    handleSizeChange,
    handleStylingChange,
    sizeConfig,
    stylingConfig,
    getEffectiveFormSchema
  } = useFormEditing(formSchema)

  // Process landing page parameters ONCE
  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered:', { 
      hasProcessedLandingParams, 
      searchParams: Object.fromEntries(searchParams.entries()),
      timestamp: Date.now() 
    })
    
    if (hasProcessedLandingParams) {
      console.log('⏭️ Skipping - already processed')
      return
    }

    const input = searchParams.get('input')
    const mode = searchParams.get('mode')
    const filename = searchParams.get('filename')
    const url = searchParams.get('url')
    
    console.log('📋 Processing landing params:', { input, mode, filename, url })
    
    // Mark as processed immediately to prevent loops
    setHasProcessedLandingParams(true)

    const processLandingInput = async () => {
      try {
        setIsFromLanding(true) // Mark that this is from landing page
        
        if (input) {
          // Text input flow - Skip chat history, generateForm will handle it
          console.log('Processing text input from landing:', input)
          setDescription(input)
          await generateForm(input, null, false)
          
        } else if (mode === 'url' && url) {
          // URL analysis flow - Skip chat history, analyzeURL will handle it
          console.log('Processing URL from landing:', url)
          await analyzeURL(url)
          
        } else if (mode && filename) {
          // File upload flow - Skip chat history, analysis functions will handle it
          const storedFile = sessionStorage.getItem('uploadedFile')
          if (storedFile) {
            const fileData = JSON.parse(storedFile)
            sessionStorage.removeItem('uploadedFile') // Clean up immediately
            
            console.log(`Processing ${mode} from landing:`, filename)
            
            if (mode === 'image') {
              handleImageUpload(fileData.data)
              await analyzeScreenshot(fileData.data)
            } else if (mode === 'pdf') {
              // Convert base64 back to File object with correct format
              const file = base64ToFile(fileData.data, fileData.name, fileData.type, fileData.isPDF)
              handlePDFUpload(file)
              await analyzePDF(file)
            }
          }
        }
        
        // Reset flag after processing
        setTimeout(() => setIsFromLanding(false), 1000)
        
      } catch (error) {
        console.error('Error processing landing input:', error)
        setIsFromLanding(false)
      }
    }

    // Only process if we have landing parameters
    if (input || mode) {
      processLandingInput()
    }
  }, [
    searchParams, 
    hasProcessedLandingParams
  ])

  // 🎯 NEW: Handle example selection from empty state
  const handleExampleSelect = async (examplePrompt: string) => {
    console.log('🎯 Example selected:', examplePrompt)
    
    try {
      console.log('📝 Setting description:', examplePrompt)
      // Set the description in the input
      setDescription(examplePrompt)
      
      console.log('⚡ Starting form generation...')
      // Automatically generate the form
      await generateForm(examplePrompt, null, false)
      
      console.log('✅ Form generation complete, clearing description')
      // Clear the description after successful generation
      setDescription('')
      
    } catch (error) {
      console.error('❌ Error generating form from example:', error)
      // Keep the description so user can try again or modify
    }
  }

  // Get the current effective button text (pending changes take priority)
  const getEffectiveButtonText = () => {
    return pendingChanges.submitButtonText || customButtonText
  }

  // Handler functions - Skip chat duplicates when coming from landing
  const handleGenerateForm = async () => {
    if (isFromLanding) return // Prevent manual generation when processing landing params
    
    try {
      await generateForm(description, null, false)
      // Clear pending changes after successful generation
      discardChanges()
      setDescription('')
    } catch {
      // Error is handled in the hook
    }
  }

  const handleUpdateForm = async () => {
    if (isFromLanding) return // Prevent manual update when processing landing params
    
    try {
      const effectiveForm = getEffectiveFormSchema()
      const currentButtonText = getEffectiveButtonText()
      
      // Pass the current button text to preserve it during update
      await generateForm(description, effectiveForm, true, currentButtonText)
      
      // Clear pending changes after successful generation
      discardChanges()
      setDescription('')
    } catch {
      // Error is handled in the hook
    }
  }

  const handleSaveChanges = () => {
    const updatedSchema = saveChanges()
    if (updatedSchema) {
      updateFormSchema(updatedSchema)
      
      // Also save the button text to the persistent state
      if (pendingChanges.submitButtonText) {
        updateButtonText(pendingChanges.submitButtonText)
      }
    }
  }

  // MOVED: Publish functionality to form preview
  const handlePublishForm = async () => {
    try {
      const effectiveForm = getEffectiveFormSchema()
      if (effectiveForm) {
        const effectiveButtonText = getEffectiveButtonText()
        await publishForm(effectiveForm, effectiveButtonText)
        
        // Save changes after successful publish
        handleSaveChanges()
      }
    } catch {
      // Error is handled in the hook
    }
  }

  // File analysis handlers - Skip duplicates when from landing
  const handleAnalyzeImage = async (additionalContext?: string) => {
    if (!uploadedImage || isFromLanding) return
    
    try {
      await analyzeScreenshot(uploadedImage, additionalContext)
    } catch {
      // Error is handled in the hook
    }
  }

  const handleAnalyzePDF = async (file: File, additionalContext?: string) => {
    if (isFromLanding) return
    
    try {
      await analyzePDF(file, additionalContext)
    } catch {
      // Error is handled in the hook
    }
  }

  const handleAnalyzeURL = async (url: string, additionalContext?: string) => {
    console.log('🎯 handleAnalyzeURL called:', { url, additionalContext, isFromLanding, timestamp: Date.now() })
    
    if (isFromLanding) {
      console.log('⏭️ Skipping handleAnalyzeURL - isFromLanding is true')
      return
    }
    
    try {
      await analyzeURL(url, additionalContext)
    } catch {
      // Error is handled in the hook
    }
  }

  const handleFieldsValidated = async (validatedFields: FieldExtraction[]) => {
    try {
      await generateFormFromFields(validatedFields)
      // Clear pending changes after successful generation
      discardChanges()
    } catch {
      // Error is handled in the hook
    }
  }

  return (
    <div className="dashboard-container">
      {/* Animated background particles */}
      <div className="dashboard-bg-animation">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="dashboard-particle" />
        ))}
      </div>

      <div className="dashboard-layout">
        {/* Use the Enhanced Chat Panel (REMOVED publish props) */}
        <EnhancedChatPanel
          description={description}
          onDescriptionChange={setDescription}
          formSchema={formSchema}
          isLoading={isLoading}
          onGenerateForm={handleGenerateForm}
          onUpdateForm={handleUpdateForm}
          chatHistory={chatHistory}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveChanges={handleSaveChanges}
          onDiscardChanges={discardChanges}
          error={error}
          
          // File analysis props
          uploadedImage={uploadedImage}
          uploadedPDF={uploadedPDF}
          uploadedURL={uploadedURL}
          extractedFields={extractedFields}
          isAnalyzing={isAnalyzing}
          analysisComplete={analysisComplete}
          onImageUpload={handleImageUpload}
          onPDFUpload={handlePDFUpload}
          onURLSubmit={handleURLUpload}
          onAnalyzeImage={handleAnalyzeImage}
          onAnalyzePDF={handleAnalyzePDF}
          onAnalyzeURL={handleAnalyzeURL}
          onFieldsValidated={handleFieldsValidated}
          onResetAnalysis={resetAnalysis}
          pdfPageSelection={pdfPageSelection}
          onPageSelectionComplete={handlePageSelectionComplete}
          onGenerateFormFromFields={generateFormFromFields}
          isFromLanding={isFromLanding}
        />

        {/* UPDATED: FormPreview with publish functionality */}
        <FormPreview
          formSchema={formSchema}
          effectiveFormSchema={getEffectiveFormSchema()}
          isLoading={isLoading}
          hasUnsavedChanges={hasUnsavedChanges}
          editingField={editingField}
          editValue={editValue}
          onEditValueChange={setEditValue}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onToggleRequired={toggleRequired}
          sizeConfig={sizeConfig}
          stylingConfig={stylingConfig}
          onSizeChange={handleSizeChange}
          onStylingChange={handleStylingChange}
          submitButtonText={getEffectiveButtonText()}
          onSaveChanges={handleSaveChanges}
          onDiscardChanges={discardChanges}
          onExampleSelect={handleExampleSelect}
          // NEW: Publish functionality moved here
          onPublishForm={handlePublishForm}
          isPublishing={isPublishing}
          publishedFormId={publishedFormId}
          // NEW: Styling panel state
          isStylingPanelOpen={isStylingPanelOpen}
          onStylingPanelToggle={setIsStylingPanelOpen}
          // NEW: Analysis state props
          isAnalyzing={isAnalyzing}
          analysisComplete={analysisComplete}
          onResetAnalysis={resetAnalysis}
          extractedFields={extractedFields}
          onGenerateFormFromFields={() => {
            if (extractedFields && extractedFields.length > 0) {
              generateFormFromFields(extractedFields)
            }
          }}
        />      
        </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}