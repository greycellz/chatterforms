'use client'

import { useState } from 'react'
import { useFormEditing } from './hooks/useFormEditing'
import { useFormGeneration } from './hooks/useFormGeneration'
import ChatPanel from './components/ChatPanel'
import FormPreview from './components/FormPreview'
import { FieldExtraction } from './types'

export default function Dashboard() {
  const [description, setDescription] = useState('')

  // Enhanced hook with PDF functionality
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
    generateFormFromFields,
    handleImageUpload,
    handlePDFUpload,
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

  // Get the current effective button text (pending changes take priority)
  const getEffectiveButtonText = () => {
    return pendingChanges.submitButtonText || customButtonText
  }

  // Handler functions
  const handleGenerateForm = async () => {
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

  // File analysis handlers
  const handleAnalyzeImage = async (additionalContext?: string) => {
    if (!uploadedImage) return
    
    try {
      await analyzeScreenshot(uploadedImage, additionalContext)
    } catch {
      // Error is handled in the hook
    }
  }

  const handleAnalyzePDF = async (file: File, additionalContext?: string) => {
    try {
      await analyzePDF(file, additionalContext)
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
        extractedFields={extractedFields}
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        onImageUpload={handleImageUpload}
        onPDFUpload={handlePDFUpload}
        onAnalyzeImage={handleAnalyzeImage}
        onAnalyzePDF={handleAnalyzePDF}
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