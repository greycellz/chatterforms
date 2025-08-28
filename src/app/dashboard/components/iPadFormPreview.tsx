import React from 'react'
import EnhancedFormPreview from './EnhancedFormPreview'
import { SizeConfig, StylingConfig, SizeType } from '../components/SizeUtilities'
import { FieldExtraction } from '../types'

interface FormSchema {
  id?: string
  title?: string
  fields?: Array<{
    id: string
    type: string
    label: string
    placeholder?: string
    required?: boolean
  }>
}

interface IPadFormPreviewProps {
  formSchema: FormSchema | null
  effectiveFormSchema: FormSchema | null
  isLoading: boolean
  hasUnsavedChanges: boolean
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'title' | 'label' | 'placeholder' | 'options' | 'submitButton', fieldId?: string, fieldIndex?: number, optionIndex?: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleRequired: (fieldId: string, required: boolean) => void
  sizeConfig: SizeConfig
  stylingConfig: StylingConfig
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
  onStylingChange: (config: Partial<StylingConfig>) => void
  submitButtonText: string
  onSaveChanges: () => void
  onDiscardChanges: () => void
  onPublishForm: () => void
  isPublishing: boolean
  publishedFormId: string | null
  onExampleSelect?: (example: string) => void
  isStylingPanelOpen?: boolean
  onStylingPanelToggle?: (isOpen: boolean) => void
  isAnalyzing?: boolean
  analysisComplete?: boolean
  onResetAnalysis?: () => void
  extractedFields?: FieldExtraction[]
  onGenerateFormFromFields?: () => void
}

export default function IPadFormPreview({
  formSchema,
  effectiveFormSchema,
  isLoading,
  hasUnsavedChanges,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleRequired,
  sizeConfig,
  stylingConfig,
  onSizeChange,
  onStylingChange,
  submitButtonText,
  onSaveChanges,
  onDiscardChanges,
  onPublishForm,
  isPublishing,
  publishedFormId,
  onExampleSelect,
  isStylingPanelOpen,
  onStylingPanelToggle,
  isAnalyzing,
  analysisComplete,
  onResetAnalysis,
  extractedFields,
  onGenerateFormFromFields
}: IPadFormPreviewProps) {
  return (
    <div style={{
      width: '55%',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <EnhancedFormPreview
        formSchema={formSchema}
        effectiveFormSchema={effectiveFormSchema}
        isLoading={isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        editingField={editingField}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onStartEditing={onStartEditing}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onToggleRequired={onToggleRequired}
        sizeConfig={sizeConfig}
        stylingConfig={stylingConfig}
        onSizeChange={onSizeChange}
        onStylingChange={onStylingChange}
        submitButtonText={submitButtonText}
        onSaveChanges={onSaveChanges}
        onDiscardChanges={onDiscardChanges}
        onPublishForm={onPublishForm}
        isPublishing={isPublishing}
        publishedFormId={publishedFormId}
        onExampleSelect={onExampleSelect}
        isStylingPanelOpen={isStylingPanelOpen}
        onStylingPanelToggle={onStylingPanelToggle}
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        onResetAnalysis={onResetAnalysis}
        extractedFields={extractedFields}
        onGenerateFormFromFields={onGenerateFormFromFields}
      />
    </div>
  )
}
