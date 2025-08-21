import ChatHistory from './ChatHistory'
import AnalysisReview from './AnalysisReview'
import CompactChatInput from './CompactChatInput'
import { FormSchema, ChatMessage, FieldExtraction, PDFPageSelectionResponse } from '../types'

// Import the styles
//import '../styles/compact-chat-input.css'

interface EnhancedChatPanelProps {
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
  // REMOVED: onPublishForm, isPublishing, publishedFormId (moved to form preview)
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
  
  // Form generation from fields
  onGenerateFormFromFields?: (fields: FieldExtraction[]) => void
}

export default function EnhancedChatPanel({
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
  // REMOVED: onPublishForm, isPublishing, publishedFormId
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
  onPageSelectionComplete,
  onGenerateFormFromFields
}: EnhancedChatPanelProps) {
  return (
    <div className="chat-panel-enhanced">
      {/* Compact Header */}
      <div className="chat-header-compact">
        <h2>Describe your form</h2>
      </div>
      
      {/* Chat History - Takes up available space with proper scrolling */}
      <div className="chat-content-area">
                        <ChatHistory
                  chatHistory={chatHistory}
                  // Pass analysis functions to ChatHistory for inline actions
                  onAnalyzeImage={onAnalyzeImage}
                  onAnalyzePDF={onAnalyzePDF}
                  onAnalyzeURL={onAnalyzeURL}
                  uploadedImage={uploadedImage}
                  uploadedPDF={uploadedPDF}
                  uploadedURL={uploadedURL}
                  isAnalyzing={isAnalyzing}
                  analysisComplete={analysisComplete}
                  onGenerateFormFromFields={onGenerateFormFromFields}
                  onResetAnalysis={onResetAnalysis}
                  isLoading={isLoading}
                />
      </div>
      
      {/* Compact Chat Input - Always at bottom */}
      <div className="chat-input-area">
        <CompactChatInput
          description={description}
          onDescriptionChange={onDescriptionChange}
          formSchema={formSchema}
          isLoading={isLoading}
          onGenerateForm={onGenerateForm}
          onUpdateForm={onUpdateForm}
          // REMOVED: onPublishForm, isPublishing, publishedFormId (moved to form preview)
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

      <style jsx>{`
        /* Main Panel Layout - Fixed Height Containers */
        .chat-panel-enhanced {
          width: 33.333%;
          background: rgba(255, 255, 255, 0.08);
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .chat-panel-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }

        /* Compact Header - Reduced height */
        .chat-header-compact {
          padding: 20px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        .chat-header-compact h2 {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .chat-header-compact::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 100%);
        }

        /* Chat Content Area - Flexible height with proper scrolling */
        .chat-content-area {
          flex: 1;
          position: relative;
          z-index: 2;
          min-height: 0; /* Critical for flex scrolling */
          overflow: hidden;
        }

        /* Compact Input Area - Reduced height */
        .chat-input-area {
          position: relative;
          z-index: 10;
          flex-shrink: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .chat-panel-enhanced {
            width: 100%;
            height: 40vh;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          }

          .chat-header-compact {
            padding: 16px 20px 12px;
          }

          .chat-header-compact h2 {
            font-size: 18px;
          }
        }

        @media (max-width: 768px) {
          .chat-header-compact {
            padding: 12px 16px 10px;
          }

          .chat-header-compact h2 {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}