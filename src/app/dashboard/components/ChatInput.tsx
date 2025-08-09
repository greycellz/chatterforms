import { useRef, useState } from 'react'

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
  uploadedURL: string | null
  analysisComplete: boolean
  
  // File upload functions
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onURLSubmit: (url: string) => void
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
  uploadedURL,
  analysisComplete,
  onImageUpload,
  onPDFUpload,
  onURLSubmit
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showURLInput, setShowURLInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')

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

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    onDescriptionChange(textarea.value)
    
    // Auto-resize
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  // File upload handlers
  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      if (file.type === 'application/pdf') {
        onPDFUpload(file)
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const fileData = e.target?.result as string
          onImageUpload(fileData)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please upload an image (PNG, JPG, GIF) or PDF file.')
      }
    }
  }

  const handleURLSubmit = () => {
    if (urlValue.trim()) {
      onURLSubmit(urlValue.trim())
      setUrlValue('')
      setShowURLInput(false)
    }
  }

  const handleURLKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleURLSubmit()
    }
  }

  // URL Input state
  if (showURLInput) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0
          }}>
            🔗 Enter Form URL
          </h3>
          <button
            onClick={() => {
              setShowURLInput(false)
              setUrlValue('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cancel
          </button>
        </div>
        
        <div className="input-card">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyPress={handleURLKeyPress}
            placeholder="https://forms.google.com/d/xyz... or https://typeform.com/..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#1f2937',
              fontSize: '16px',
              fontFamily: 'inherit',
              padding: 0
            }}
            autoFocus
          />
        </div>
        
        <button
          onClick={handleURLSubmit}
          disabled={!urlValue.trim()}
          className="dashboard-btn primary"
          style={{ width: '100%' }}
        >
          <div className="button-content">
            Analyze Form URL
          </div>
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main input with integrated upload - Hide during upload workflow */}
      {!uploadedImage && !uploadedPDF && !uploadedURL && !analysisComplete && (
        <>
          <div className="input-card">
            <div className="input-wrapper">
              <textarea 
                ref={textareaRef}
                value={description}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  formSchema 
                    ? "Add a gender field after date of birth with dropdown options male, female..."
                    : "I need a patient intake form with contact info, insurance details..."
                }
                className="chat-textarea"
                style={{
                  minHeight: '32px',
                  maxHeight: '200px'
                }}
              />
              
              <button 
                type="button"
                className="attach-btn" 
                onClick={handleAttachClick}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                </svg>
              </button>
              
              {/* Hidden file input */}
              <input 
                ref={fileInputRef}
                type="file" 
                style={{ display: 'none' }}
                accept="image/*,.pdf" 
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          {/* Hints outside the input card */}
          <div className="input-hints">
            <div className="input-hints-text">
              💬 Describe your form • 📎 Upload screenshots or PDFs •{' '}
              <button onClick={() => setShowURLInput(true)}>
                🔗 Analyze URLs
              </button>
            </div>
          </div>
        </>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Generate/Update Button - Use secondary for Update Form */}
        {(!uploadedImage && !uploadedPDF && !uploadedURL && !analysisComplete) && (
          <button 
            onClick={formSchema ? onUpdateForm : onGenerateForm}
            disabled={isLoading || !description.trim()}
            className={`dashboard-btn ${formSchema ? 'secondary' : 'primary'} ${isLoading || !description.trim() ? 'disabled' : ''}`}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {formSchema ? (
              // Secondary styling for Update Form
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isLoading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Update Form</span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter
                    </span>
                  </>
                )}
              </div>
            ) : (
              // Primary styling for Generate Form
              <div className="button-content">
                {isLoading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Generate Form</span>
                    <span className="shortcut-hint">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter
                    </span>
                  </>
                )}
              </div>
            )}
          </button>
        )}

        {/* Save/Discard Changes Buttons */}
        {hasUnsavedChanges && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onSaveChanges}
              className="dashboard-btn"
              style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
            >
              ✅ Save Changes
            </button>
            <button 
              onClick={onDiscardChanges}
              className="dashboard-btn"
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                fontSize: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.25)'
              }}
            >
              ❌ Discard
            </button>
          </div>
        )}

        {/* Publish Button */}
        {formSchema && (
          <button 
            onClick={onPublishForm}
            disabled={isPublishing}
            className={`dashboard-btn primary ${isPublishing ? 'disabled' : ''}`}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isPublishing ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                Publishing...
              </>
            ) : (
              <>
                🚀 {hasExistingForm ? 'Update Published Form' : 'Publish Form'}
              </>
            )}
          </button>
        )}

        {/* Published Form URL - Enhanced styling */}
        {formUrl && (
          <div className="status-card success">
            <div className="status-title">
              ✅ {hasExistingForm && !publishedFormId ? 'Form Previously Published!' : 'Form Published!'}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '12px'
            }}>
              {hasExistingForm && !publishedFormId ? 'Existing form URL:' : 'Share this link:'}
            </div>
            <a 
              href={`/forms/${formUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="status-url"
            >
              {typeof window !== 'undefined' ? window.location.origin : ''}/forms/{formUrl}
            </a>
            {hasExistingForm && (
              <div className="status-note">
                ✅ Updates will use the same URL
              </div>
            )}
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="status-card error">
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(239, 68, 68, 0.9)',
              marginBottom: '4px'
            }}>
              ❌ Error
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.4
            }}>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}