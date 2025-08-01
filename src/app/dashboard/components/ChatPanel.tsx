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
  }
  
  interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
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
    error
  }: ChatPanelProps) {
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
  
        {/* Input section */}
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
              {isPublishing ? 'Publishing...' : 'Publish Form'}
            </button>
          )}
  
          {publishedFormId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Form Published!</p>
              <p className="text-xs text-green-600 mb-2">Share this link:</p>
              <a 
                href={`/forms/${publishedFormId}`}
                target="_blank"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {typeof window !== 'undefined' ? window.location.origin : ''}/forms/{publishedFormId}
              </a>
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