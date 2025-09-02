// Updated src/app/dashboard/page.tsx

'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
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
import MobileChatPanel from './components/MobileChatPanel'
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
  const processedLandingParamsRef = useRef(false) // Add ref for immediate access
  const [isStylingPanelOpen, setIsStylingPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()

  // Detect mobile screen sizes (client-side only)
  useEffect(() => {
    setIsClient(true)
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

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
    getEffectiveFormSchema,
    markAsPublished
  } = useFormEditing(formSchema)



  // Process landing page parameters ONCE
  useEffect(() => {
    const input = searchParams.get('input')
    const mode = searchParams.get('mode')
    const filename = searchParams.get('filename')
    const url = searchParams.get('url')
    const formId = searchParams.get('formId')
    
    // Check multiple safeguards to prevent HMR re-runs
    const sessionProcessed = sessionStorage.getItem('landingParamsProcessed')
    const sessionTimestamp = sessionStorage.getItem('landingParamsTimestamp')
    const currentParams = JSON.stringify({ input, mode, filename, url, formId })
    const lastProcessedParams = sessionStorage.getItem('lastProcessedParams')
    
    // Check if session storage has expired (5 minutes)
    const sessionAge = sessionTimestamp ? Date.now() - parseInt(sessionTimestamp) : 0
    const sessionExpired = sessionAge > 5 * 60 * 1000 // 5 minutes
    
    // Clear session storage if expired or if we have new parameters
    if (sessionExpired || (sessionProcessed && lastProcessedParams && lastProcessedParams !== currentParams)) {
      sessionStorage.removeItem('landingParamsProcessed')
      sessionStorage.removeItem('lastProcessedParams')
      sessionStorage.removeItem('landingParamsTimestamp')
    }
    
    if (hasProcessedLandingParams || processedLandingParamsRef.current || (sessionProcessed && lastProcessedParams === currentParams && !sessionExpired)) {
      return
    }
    
    // Mark as processed immediately to prevent loops (state, ref, and session)
    setHasProcessedLandingParams(true)
    processedLandingParamsRef.current = true
    sessionStorage.setItem('landingParamsProcessed', 'true')
    sessionStorage.setItem('lastProcessedParams', currentParams)
    sessionStorage.setItem('landingParamsTimestamp', Date.now().toString())

    const processLandingInput = async () => {
      try {
        setIsFromLanding(true) // Mark that this is from landing page
        
        if (input) {
          // Text input flow - Skip chat history, generateForm will handle it
          setDescription(input)
          await generateForm(input, null, false)
          
        } else if (mode === 'url' && url) {
          // URL analysis flow - Skip chat history, analyzeURL will handle it
          await handleAnalyzeURL(url)
          
        } else if (mode && filename) {
          // File upload flow - Skip chat history, analysis functions will handle it
          const storedFile = sessionStorage.getItem('uploadedFile')
          if (storedFile) {
            const fileData = JSON.parse(storedFile)
            sessionStorage.removeItem('uploadedFile') // Clean up immediately
            
            if (mode === 'image') {
              handleImageUpload(fileData.data)
              // analyzeScreenshot is automatically called by handleImageUpload
            } else if (mode === 'pdf') {
              // Convert base64 back to File object with correct format
              const file = base64ToFile(fileData.data, fileData.name, fileData.type, fileData.isPDF)
              handlePDFUpload(file)
              // analyzePDF is automatically called by handlePDFUpload
            }
          }
        }
        
        // Reset flag after processing (increased delay to prevent race conditions)
        setTimeout(() => {
          setIsFromLanding(false)
        }, 3000)
        
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

  // 🎯 NEW: Handle form loading from workspace
  useEffect(() => {
    const formId = searchParams.get('formId')
    
    if (formId) {
      loadExistingForm(formId)
    }
  }, [searchParams])

  // 🎯 NEW: Function to load existing form data
  const loadExistingForm = async (formId: string) => {
    try {
      console.log('🔄 Loading existing form:', formId)
      
      // Get the API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://my-poppler-api-production.up.railway.app'
      
      // Fetch form data from backend
      const response = await fetch(`${apiUrl}/api/forms/${formId}`)
      
      if (response.ok) {
        const formData = await response.json()
        console.log('✅ Form data loaded:', formData)
        
        // Load form into the dashboard state
        if (formData.form) {
          console.log('🔍 Form data structure:', formData.form)
          
          // Transform backend data to FormSchema format
          let schema = null
          
          if (formData.form.schema) {
            // Backend has a schema field
            schema = {
              title: formData.form.schema.title || formData.form.title || 'Untitled Form',
              fields: formData.form.schema.fields || [],
              formId: formData.form.form_id || formData.form.formId
            }
            console.log('✅ Form schema extracted from schema field')
          } else if (formData.form.fields) {
            // Backend has fields directly
            schema = {
              title: formData.form.title || 'Untitled Form',
              fields: formData.form.fields,
              formId: formData.form.form_id || formData.form.formId
            }
            console.log('✅ Form schema created from fields')
          } else if (formData.form.structure) {
            // Backend has structure field
            schema = {
              title: formData.form.structure.title || formData.form.title || 'Untitled Form',
              fields: formData.form.structure.fields || [],
              formId: formData.form.form_id || formData.form.formId
            }
            console.log('✅ Form schema created from structure')
          }
          
          if (schema) {
            console.log('🔍 Transformed schema:', schema)
            updateFormSchema(schema)
            console.log('✅ Form schema updated in state')
          } else {
            console.error('❌ Could not create schema from form data')
          }
          
          // Update button text if available
          if (formData.form.submitButtonText) {
            updateButtonText(formData.form.submitButtonText)
            console.log('✅ Submit button text updated')
          }
          
          console.log('✅ Form loaded successfully into dashboard')
        }
      } else {
        console.error('❌ Failed to load form:', response.status)
      }
    } catch (error) {
      console.error('❌ Error loading form:', error)
    }
  }

  // 🎯 NEW: Handle example selection from empty state
  const handleExampleSelect = async (examplePrompt: string) => {
    
    try {
      // Set the description in the input
      setDescription(examplePrompt)
      
      // Automatically generate the form
      await generateForm(examplePrompt, null, false)
      
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
      
      // Don't clear pending changes after AI update - let user publish the changes
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
      console.log('📝 handlePublishForm called - Pre-state:', {
        publishedFormId,
        hasUnsavedChanges
      })

      const effectiveForm = getEffectiveFormSchema()
      if (effectiveForm) {
        const effectiveButtonText = getEffectiveButtonText()
        
        // Include styling configuration in the form schema before publishing
        const formWithStyling = {
          ...effectiveForm,
          styling: {
            globalFontSize: sizeConfig.globalFontSize,
            fieldSizes: sizeConfig.fieldSizes,
            fontFamily: stylingConfig.fontFamily,
            fontColor: stylingConfig.fontColor,
            backgroundColor: stylingConfig.backgroundColor,
            buttonColor: stylingConfig.buttonColor
          }
        }
        
        await publishForm(formWithStyling, effectiveButtonText, () => {
          console.log('📝 onPublished callback executing - Pre-callback state:', {
            publishedFormId,
            hasUnsavedChanges
          })

          // Save changes after successful publish
          handleSaveChanges()
          
          // Mark form as published to clear unsaved changes flag
          // Use setTimeout to ensure this happens after all state updates
          setTimeout(() => {
            markAsPublished()
          }, 0)

          console.log('📝 onPublished callback completed - Post-callback state:', {
            publishedFormId,
            hasUnsavedChanges: false // Should be false after markAsPublished
          })
        })
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
                            {/* Conditional Layout - Mobile, iPad, or Desktop */}
                    {isClient && isMobile ? (
                      <MobileChatPanel
                        chatHistory={chatHistory}
                        description={description}
                        onDescriptionChange={setDescription}
                        onGenerateForm={handleGenerateForm}
                        onUpdateForm={handleUpdateForm}
                        onImageUpload={handleImageUpload}
                        onPDFUpload={handlePDFUpload}
                        onAnalyzeURL={handleAnalyzeURL}
                        isLoading={isLoading}
                        formSchema={formSchema}
                        error={error}
                        onPublishForm={handlePublishForm}
                        isPublishing={isPublishing}
                        publishedFormId={publishedFormId || undefined}
                        hasUnsavedChanges={hasUnsavedChanges}
                        onCustomizeForm={() => setIsStylingPanelOpen(true)}
                        onGenerateFormFromFields={generateFormFromFields}
                      />
                    ) : isClient ? (
          <>
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

            {/* Form Preview - Only show on desktop */}
            {console.log('🔍 Dashboard rendering FormPreview with formSchema:', formSchema)}
            <FormPreview
              formSchema={formSchema}
              effectiveFormSchema={getEffectiveFormSchema()}
              // Debug logging
              key={`form-preview-${formSchema ? 'with-schema' : 'no-schema'}`}
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
          </>
        ) : null}
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