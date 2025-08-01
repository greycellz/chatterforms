'use client'

import { useState } from 'react'
import { useFormEditing } from './hooks/useFormEditing'
import { useFormGeneration } from './hooks/useFormGeneration'
import ChatPanel from './components/ChatPanel'
import FormPreview from './components/FormPreview'

export default function Dashboard() {
  const [description, setDescription] = useState('')

  // Custom hooks for clean separation of concerns
  const {
    formSchema,
    isLoading,
    isPublishing,
    publishedFormId,
    error,
    chatHistory,
    customButtonText,
    generateForm,
    publishForm,
    updateFormSchema,
    updateButtonText
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
        submitButtonText={getEffectiveButtonText()}
      />
    </div>
  )
}