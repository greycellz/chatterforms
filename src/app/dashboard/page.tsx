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
    generateForm,
    publishForm,
    updateFormSchema
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
    getEffectiveFormSchema
  } = useFormEditing(formSchema)

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
      await generateForm(description, effectiveForm, true)
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
    }
  }

  const handlePublishForm = async () => {
    try {
      const effectiveForm = getEffectiveFormSchema()
      if (effectiveForm) {
        await publishForm(
          effectiveForm, 
          pendingChanges.submitButtonText || 'Submit Form'
        )
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
        submitButtonText={pendingChanges.submitButtonText || 'Submit Form'}
      />
    </div>
  )
}