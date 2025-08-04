import { useState, useRef } from 'react'

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
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
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
  const [additionalContext, setAdditionalContext] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // Check if this form has been published before (has persistent URL)
  const hasExistingForm = formSchema?.formId || publishedFormId
  const formUrl = publishedFormId || formSchema?.formId

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        onImageUpload(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle file input click
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-1/3 bg-yellow-50 border-r border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Describe your form</h2>
      
      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Chat History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chatHistory.map((message, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <span className="font-medium">
                  {message.role === 'user' ? 'You: ' : 'AI: '}
                </span>
                {message.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshot Upload Section */}
      {!formSchema && !analysisComplete && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📷 Upload Screenshot</h3>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : uploadedImage
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {uploadedImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImage}
                  alt="Uploaded screenshot"
                  className="max-w-full max-h-32 mx-auto rounded border"
                />
                <p className="text-sm text-green-600">✅ Screenshot uploaded</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onResetAnalysis()
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-gray-400 text-2xl">📷</div>
                <p className="text-sm text-gray-600">
                  Drag & drop a screenshot or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports JPG, PNG, WebP
                </p>
              </div>
            )}
          </div>

          {/* Additional Context Input */}
          {uploadedImage && !isAnalyzing && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Additional context (optional):
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="e.g., This is a medical intake form, make phone required..."
                className="w-full h-16 p-2 text-sm bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={() => onAnalyzeImage(additionalContext)}
                disabled={isAnalyzing}
                className="w-full mt-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {isAnalyzing ? '🔍 Analyzing Screenshot...' : '🔍 Analyze Screenshot'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Field Extraction Review */}
      {analysisComplete && extractedFields.length > 0 && (
        <div className="mb-4 space-y-4">
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
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImage}
                alt="Analyzed screenshot"
                className="max-w-full max-h-24 mx-auto rounded border shadow-sm"
              />
            </div>
          )}

          {/* Simple field list for now */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📋 Extracted Fields ({extractedFields.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {extractedFields.map((field) => (
                <div key={field.id} className="text-sm text-gray-600">
                  • {field.label} ({field.type}){field.required ? ' *' : ''}
                </div>
              ))}
            </div>
            <button
              onClick={() => onFieldsValidated(extractedFields)}
              className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              ✅ Generate Form ({extractedFields.length} fields)
            </button>
          </div>
        </div>
      )}

      {/* Original Input Section - Show when no screenshot analysis or form exists */}
      {(!uploadedImage || formSchema) && (
        <div className="space-y-4 flex-1 flex flex-col justify-end">
          <textarea 
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={
              formSchema 
                ? "Add a gender field after date of birth with dropdown options male, female..."
                : "I need a patient intake form with contact info, insurance details..."
            }
            className="w-full h-32 p-3 bg-white text-black border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button 
            onClick={formSchema ? onUpdateForm : onGenerateForm}
            disabled={isLoading || !description.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (formSchema ? 'Update Form' : 'Generate Form')}
          </button>

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
      )}
    </div>
  )
}