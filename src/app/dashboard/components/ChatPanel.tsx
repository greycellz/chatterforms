import ChatHistory from './ChatHistory'
import FileUpload from './FileUpload'
import AnalysisReview from './AnalysisReview'
import ChatInput from './ChatInput'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormSchema {
  title: string
  fields: FormField[]
  formId?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface FieldExtraction {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'checkbox-group' | 'radio-with-other' | 'checkbox-with-other'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
}

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
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
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
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onImageUpload,
  onPDFUpload,
  onAnalyzeImage,
  onAnalyzePDF,
  onFieldsValidated,
  onResetAnalysis
}: ChatPanelProps) {
  return (
    <div className="w-1/3 bg-yellow-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Describe your form</h2>
      </div>
      
      {/* Chat History - Takes up available space */}
      <ChatHistory chatHistory={chatHistory} />
      
      {/* Analysis Review - Shows during screenshot/PDF workflow */}
      <AnalysisReview
        uploadedImage={uploadedImage}
        uploadedPDF={uploadedPDF}
        extractedFields={extractedFields}
        isAnalyzing={isAnalyzing}
        analysisComplete={analysisComplete}
        onAnalyzeImage={onAnalyzeImage}
        onAnalyzePDF={onAnalyzePDF}
        onFieldsValidated={onFieldsValidated}
        onResetAnalysis={onResetAnalysis}
      />
      
      {/* File Upload - Shows when no upload workflow active */}
      <FileUpload
        onImageUpload={onImageUpload}
        onPDFUpload={onPDFUpload}
        uploadedImage={uploadedImage}
        uploadedPDF={uploadedPDF}
        analysisComplete={analysisComplete}
      />
      
      {/* Chat Input - Always at bottom */}
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
        analysisComplete={analysisComplete}
      />
    </div>
  )
}