import ChatHistory from './ChatHistory'
import AnalysisReview from './AnalysisReview'
import ChatInput from './ChatInput'
import { FormSchema, ChatMessage, FieldExtraction, PDFPageSelectionResponse } from '../types'

interface ChatPanelProps {
  description: string
  onDescriptionChange: (value: string) => void
  formSchema: FormSchema | null
  isLoading: boolean
  onGenerateForm: () => void
  onUpdateForm: () => void
  chatHistory: ChatMessage[]
  hasUnsavedChanges: boolean
  onSaveChanges: () => void
  onDiscardChanges: () => void
  onPublishForm: () => void
  isPublishing: boolean
  publishedFormId: string | null
  error: string
  
  // File upload functionality props
  uploadedImage: string | null
  uploadedPDF: File | null
  uploadedURL: string | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onURLSubmit: (url: string) => void
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string, pageSelection?: { pages: number[], selectAll?: boolean }) => void
  onAnalyzeURL: (url: string, additionalContext?: string) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
  
  // PDF page selection props
  pdfPageSelection?: PDFPageSelectionResponse | null
  onPageSelectionComplete?: (pageSelection: { pages: number[], selectAll?: boolean }) => void
}

export default function ChatPanel({
  description,
  onDescriptionChange,
  formSchema,
  isLoading,
  onGenerateForm,
  onUpdateForm,
  chatHistory,
  hasUnsavedChanges,
  onSaveChanges,
  onDiscardChanges,
  onPublishForm,
  isPublishing,
  publishedFormId,
  error,
  uploadedImage,
  uploadedPDF,
  uploadedURL,
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onImageUpload,
  onPDFUpload,
  onURLSubmit,
  onAnalyzeImage,
  onAnalyzePDF,
  onAnalyzeURL,
  onFieldsValidated,
  onResetAnalysis,
  pdfPageSelection,
  onPageSelectionComplete
}: ChatPanelProps) {
  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <h2>Describe your form</h2>
      </div>
      
      {/* Chat History - Takes up available space */}
      <div className="chat-history-container">
        <ChatHistory chatHistory={chatHistory} />
      </div>
      
      {/* Analysis Review - Shows during screenshot/PDF/URL workflow */}
      <AnalysisReview
        uploadedImage={uploadedImage}
        uploadedPDF={uploadedPDF}
        uploadedURL={uploadedURL}
        extractedFields={extractedFields}
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        onAnalyzeImage={onAnalyzeImage}
        onAnalyzePDF={onAnalyzePDF}
        onAnalyzeURL={onAnalyzeURL}
        onFieldsValidated={onFieldsValidated}
        onResetAnalysis={onResetAnalysis}
        pdfPageSelection={pdfPageSelection}
        onPageSelectionComplete={onPageSelectionComplete}
      />
      
      {/* Chat Input with integrated upload - Always at bottom */}
      <div className="chat-input-container">
        <ChatInput
          description={description}
          onDescriptionChange={onDescriptionChange}
          formSchema={formSchema}
          isLoading={isLoading}
          onGenerateForm={onGenerateForm}
          onUpdateForm={onUpdateForm}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveChanges={onSaveChanges}
          onDiscardChanges={onDiscardChanges}
          onPublishForm={onPublishForm}
          isPublishing={isPublishing}
          publishedFormId={publishedFormId}
          error={error}
          uploadedImage={uploadedImage}
          uploadedPDF={uploadedPDF}
          uploadedURL={uploadedURL}
          analysisComplete={analysisComplete}
          onImageUpload={onImageUpload}
          onPDFUpload={onPDFUpload}
          onURLSubmit={onURLSubmit}
        />
      </div>
    </div>
  )
}