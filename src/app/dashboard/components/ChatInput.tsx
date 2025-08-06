import { useRef } from 'react'

interface FormSchema {
  title: string
  fields: Array<{
    id: string
    type: string
    label: string
    required: boolean
    placeholder?: string
    options?: string[]
  }>
  formId?: string
}

interface ChatInputProps {
  description: string
  onDescriptionChange: (value: string) => void
  formSchema: FormSchema | null
  isLoading: boolean
  onGenerateForm: () => void
  onUpdateForm: () => void
  hasUnsavedChanges: boolean
  onSaveChanges: () => void
  onDiscardChanges: () => void
  onPublishForm: () => void
  isPublishing: boolean
  publishedFormId: string | null
  error: string
  
  // Hide input when in upload workflow
  uploadedImage: string | null
  uploadedPDF: File | null
  analysisComplete: boolean
}

export default function ChatInput({
  description,
  onDescriptionChange,
  formSchema,
  isLoading,
  onGenerateForm,
  onUpdateForm,
  hasUnsavedChanges,
  onSaveChanges,
  onDiscardChanges,
  onPublishForm,
  isPublishing,
  publishedFormId,
  error,
  uploadedImage,
  uploadedPDF,
  analysisComplete
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if this form has been published before (has persistent URL)
  const hasExistingForm = formSchema?.formId || publishedFormId
  const formUrl = publishedFormId || formSchema?.formId

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

  return (
    <div className="p-4 space-y-4 border-t border-gray-200 bg-yellow-50">
      {/* Main textarea with keyboard shortcut support - Hide during upload workflow */}
      {!uploadedImage && !uploadedPDF && !analysisComplete && (
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

      {/* Generate/Update Button */}
      {(!uploadedImage && !uploadedPDF && !analysisComplete) && (
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

      {/* Publish Button */}
      {formSchema && (
        <button 
          onClick={onPublishForm}
          disabled={isPublishing}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing...' : (hasExistingForm ? 'Update Published Form' : 'Publish Form')}
        </button>
      )}

      {/* Published Form URL */}
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
      
      {/* Error Display */}
      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
    </div>
  )
}