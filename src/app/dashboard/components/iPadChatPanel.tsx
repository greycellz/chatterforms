import React from 'react'
import EnhancedChatPanel from './EnhancedChatPanel'
import { ChatMessage, FieldExtraction, PDFPageSelectionResponse } from '../types'

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

interface IPadChatPanelProps {
  chatHistory: ChatMessage[]
  description: string
  onDescriptionChange: (value: string) => void
  onGenerateForm: () => void
  onUpdateForm: () => void
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  isLoading: boolean
  formSchema: FormSchema | null
  error: string
  hasUnsavedChanges: boolean
  onSaveChanges: () => void
  onDiscardChanges: () => void
  uploadedImage: string | null
  uploadedPDF: File | null
  uploadedURL: string | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onURLSubmit: (url: string) => void
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string, pageSelection?: { pages: number[], selectAll?: boolean }) => void
  onAnalyzeURL: (url: string, additionalContext?: string) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
  pdfPageSelection?: PDFPageSelectionResponse | null
  onPageSelectionComplete?: (pageSelection: { pages: number[], selectAll?: boolean }) => void
  onGenerateFormFromFields?: (fields: FieldExtraction[]) => void
  isFromLanding?: boolean
}

export default function IPadChatPanel({
  chatHistory,
  description,
  onDescriptionChange,
  onGenerateForm,
  onUpdateForm,
  onImageUpload,
  onPDFUpload,
  isLoading,
  formSchema,
  error,
  hasUnsavedChanges,
  onSaveChanges,
  onDiscardChanges,
  uploadedImage,
  uploadedPDF,
  uploadedURL,
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onURLSubmit,
  onAnalyzeImage,
  onAnalyzePDF,
  onAnalyzeURL,
  onFieldsValidated,
  onResetAnalysis,
  pdfPageSelection,
  onPageSelectionComplete,
  onGenerateFormFromFields,
  isFromLanding
}: IPadChatPanelProps) {
  return (
    <div style={{
      width: '45%',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <EnhancedChatPanel
        description={description}
        onDescriptionChange={onDescriptionChange}
        formSchema={formSchema}
        isLoading={isLoading}
        onGenerateForm={onGenerateForm}
        onUpdateForm={onUpdateForm}
        chatHistory={chatHistory}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveChanges={onSaveChanges}
        onDiscardChanges={onDiscardChanges}
        error={error}
        uploadedImage={uploadedImage}
        uploadedPDF={uploadedPDF}
        uploadedURL={uploadedURL}
        extractedFields={extractedFields}
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        onImageUpload={onImageUpload}
        onPDFUpload={onPDFUpload}
        onURLSubmit={onURLSubmit}
        onAnalyzeImage={onAnalyzeImage}
        onAnalyzePDF={onAnalyzePDF}
        onAnalyzeURL={onAnalyzeURL}
        onFieldsValidated={onFieldsValidated}
        onResetAnalysis={onResetAnalysis}
        pdfPageSelection={pdfPageSelection}
        onPageSelectionComplete={onPageSelectionComplete}
        onGenerateFormFromFields={onGenerateFormFromFields}
        isFromLanding={isFromLanding}
      />
    </div>
  )
}
