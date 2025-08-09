'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormEditing } from './hooks/useFormEditing'
import { useFormGeneration } from './hooks/useFormGeneration'
import ChatPanel from './components/ChatPanel'
import FormPreview from './components/FormPreview'
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

export default function Dashboard() {
  const [description, setDescription] = useState('')
  const [hasProcessedLandingParams, setHasProcessedLandingParams] = useState(false)
  const [isFromLanding, setIsFromLanding] = useState(false) // NEW: Track if this is from landing
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
    if (hasProcessedLandingParams) return

    const input = searchParams.get('input')
    const mode = searchParams.get('mode')
    const filename = searchParams.get('filename')
    const url = searchParams.get('url')
    
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
          handleURLUpload(url)
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
    hasProcessedLandingParams,
    generateForm,
    analyzeURL,
    analyzeScreenshot,
    analyzePDF,
    handleImageUpload,
    handlePDFUpload,
    handleURLUpload
  ])

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
    if (isFromLanding) return
    
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
    <div className="h-screen flex">
      <ChatPanel
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
        onPublishForm={handlePublishForm}
        isPublishing={isPublishing}
        publishedFormId={publishedFormId}
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
      />

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
      />
    </div>
  )
}