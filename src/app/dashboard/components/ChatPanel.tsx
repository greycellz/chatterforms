import { useState, useRef, useEffect } from 'react'
import LoadingBubbles from './LoadingBubbles'

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
  
  // New props for screenshot functionality
  uploadedImage: string | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onImageUpload: (imageData: string) => void
  onAnalyzeImage: (additionalContext?: string) => void
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
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onImageUpload,
  onAnalyzeImage,
  onFieldsValidated,
  onResetAnalysis
}: ChatPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [additionalContext, setAdditionalContext] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Check if this form has been published before (has persistent URL)
  const hasExistingForm = formSchema?.formId || publishedFormId
  const formUrl = publishedFormId || formSchema?.formId

  // Auto-scroll to bottom when new messages arrive, but only if user was already at bottom
  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, isAtBottom])

  // Check if user is at bottom of chat
  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const threshold = 50 // pixels from bottom
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold)
    }
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      setIsAtBottom(true)
    }
  }

  // Handle keyboard shortcuts (Cmd+Enter or Ctrl+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (formSchema) {
        onUpdateForm()
      } else {
        onGenerateForm()
      }
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileData = e.target?.result as string
        if (file.type === 'application/pdf') {
          // TODO: Handle PDF upload
          console.log('PDF upload to be implemented')
        } else {
          onImageUpload(fileData)
        }
      }
      reader.readAsDataURL(file)
      setShowAttachMenu(false)
    }
  }

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="w-1/3 bg-yellow-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Describe your form</h2>
      </div>
      
      {/* Chat History - ChatGPT Style with Fixed Height */}
      {chatHistory.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Chat History</h3>
          </div>
          
          <div className="flex-1 relative">
            {/* Scrollable Messages Container */}
            <div 
              ref={chatContainerRef}
              onScroll={handleChatScroll}
              className="absolute inset-0 overflow-y-auto px-4 pb-2 space-y-3"
              style={{ scrollBehavior: 'smooth' }}
            >
              {chatHistory.map((message, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-sm shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-800 ml-4'
                      : 'bg-green-100 text-green-800 mr-4'
                  }`}
                >
                  <div className="font-medium text-xs mb-1 opacity-75">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div className="leading-relaxed">{message.content}</div>
                </div>
              ))}
            </div>
            
            {/* Scroll to Bottom Button - Only show when not at bottom */}
            {!isAtBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-800 z-10"
                title="Scroll to bottom"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Field Extraction Review */}
      {analysisComplete && extractedFields.length > 0 && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">🔍 Analysis Complete</h3>
            <button
              onClick={onResetAnalysis}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Start Over
            </button>
          </div>

          {/* Screenshot Thumbnail */}
          {uploadedImage && (
            <div className="text-center bg-white p-2 rounded-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImage}
                alt="Analyzed screenshot"
                className="max-w-full max-h-32 mx-auto rounded border-2 border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Analyzed screenshot</p>
            </div>
          )}

          {/* Enhanced field list */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📋 Extracted Fields ({extractedFields.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {extractedFields.map((field) => (
                <div key={field.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  <span className="font-medium">• {field.label}</span>
                  <span className="text-gray-500"> ({field.type})</span>
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {field.allowOther && <span className="text-blue-500 ml-1">+ Other</span>}
                  {field.options && (
                    <div className="text-xs text-gray-400 mt-1 ml-4">
                      Options: {field.options.slice(0, 3).join(', ')}
                      {field.options.length > 3 && ` +${field.options.length - 3} more`}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => onFieldsValidated(extractedFields)}
              className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
            >
              ✅ Generate Form ({extractedFields.length} fields)
            </button>
          </div>
        </div>
      )}

      {/* Analysis in progress */}
      {isAnalyzing && (
        <div className="p-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-lg animate-pulse">🔍</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-purple-700 font-medium">
                    Analyzing screenshot and extracting form fields...
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <div className="mt-1 text-xs text-purple-600">
                  AI is reading your image and identifying form fields...
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-purple-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full animate-pulse"
                style={{
                  width: '60%',
                  animation: 'progress 2s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Form generation/update loading - REMOVED, only show on preview side */}

      {/* Input section - Always at bottom */}
      <div className="p-4 space-y-4 border-t border-gray-200 bg-yellow-50">
        {/* Additional context for uploaded files */}
        {uploadedImage && !analysisComplete && !isAnalyzing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional context (optional):
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g., This is a medical intake form, make phone required..."
              className="w-full h-20 p-3 text-sm bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
            />
            
            <button
              onClick={() => onAnalyzeImage(additionalContext)}
              disabled={isAnalyzing}
              className="w-full mt-3 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
            >
              🔍 Analyze File
            </button>
          </div>
        )}

        {/* Main textarea with keyboard shortcut support */}
        {!uploadedImage && !analysisComplete && (
          <div className="space-y-2">
            <textarea 
              ref={textareaRef}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                formSchema 
                  ? "Add a gender field after date of birth with dropdown options male, female..."
                  : "I need a patient intake form with contact info, insurance details..."
              }
              className="w-full h-32 p-4 bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 shadow-sm"
            />
            <p className="text-xs text-gray-500">
              Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'} + Enter to submit
            </p>
          </div>
        )}

        {/* Enhanced Attachment Button with descriptive text */}
        {!uploadedImage && !analysisComplete && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center transition-colors group"
                title="Attach file"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Attachment Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg py-2 min-w-max z-50">
                  <button
                    onClick={() => triggerFileInput('image/*')}
                    className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Attach Form Screenshot</span>
                  </button>
                  <button
                    onClick={() => triggerFileInput('application/pdf')}
                    className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Attach PDF to Convert</span>
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
            
            {/* Descriptive text */}
            <div className="flex-1">
              <p className="text-sm text-gray-600 leading-tight">
                Upload images or documents to instantly convert to forms 🎉
              </p>
            </div>
          </div>
        )}

        {/* Generate/Update Button */}
        {(!uploadedImage && !analysisComplete) && (
          <button 
            onClick={formSchema ? onUpdateForm : onGenerateForm}
            disabled={isLoading || !description.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {isLoading ? 'Processing...' : (formSchema ? 'Update Form' : 'Generate Form')}
          </button>
        )}

        {/* Save/Discard Changes Buttons */}
        {hasUnsavedChanges && (
          <div className="flex gap-2">
            <button 
              onClick={onSaveChanges}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Save Changes
            </button>
            <button 
              onClick={onDiscardChanges}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Discard
            </button>
          </div>
        )}

        {formSchema && (
          <button 
            onClick={onPublishForm}
            disabled={isPublishing}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : (hasExistingForm ? 'Update Published Form' : 'Publish Form')}
          </button>
        )}

        {formUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              {hasExistingForm && !publishedFormId ? 'Form Previously Published!' : 'Form Published!'}
            </p>
            <p className="text-xs text-green-600 mb-2">
              {hasExistingForm && !publishedFormId ? 'Existing form URL:' : 'Share this link:'}
            </p>
            <a 
              href={`/forms/${formUrl}`}
              target="_blank"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {typeof window !== 'undefined' ? window.location.origin : ''}/forms/{formUrl}
            </a>
            {hasExistingForm && (
              <p className="text-xs text-green-500 mt-2">
                ✅ Updates will use the same URL
              </p>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}