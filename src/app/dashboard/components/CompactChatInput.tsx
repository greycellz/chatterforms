import { useRef, useState } from 'react'
import '../styles/compact-chat-input.css'

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

interface CompactChatInputProps {
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

export default function CompactChatInput({
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
}: CompactChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showURLInput, setShowURLInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  // Check if this form has been published before
  const hasExistingForm = formSchema?.formId || publishedFormId
  const formUrl = publishedFormId || formSchema?.formId

  // Handle keyboard shortcuts
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

  // Auto-resize textarea (compact version)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    onDescriptionChange(textarea.value)
    
    // Auto-resize with smaller max height
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`
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

  // URL Input state
  if (showURLInput) {
    return (
      <div className="compact-input-container">
        <div className="url-input-section">
          <div className="url-header">
            <span className="url-title">🔗 Enter Form URL</span>
            <button
              onClick={() => {
                setShowURLInput(false)
                setUrlValue('')
              }}
              className="url-cancel"
            >
              Cancel
            </button>
          </div>
          
          <div className="url-input-card">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleURLSubmit()}
              placeholder="https://forms.google.com/..."
              className="url-input"
              autoFocus
            />
          </div>
          
          <button
            onClick={handleURLSubmit}
            disabled={!urlValue.trim()}
            className="url-submit-btn"
          >
            Analyze Form URL
          </button>
        </div>
      </div>
    )
  }

  // Hide during upload workflow
  if (uploadedImage || uploadedPDF || uploadedURL || analysisComplete) {
    return null
  }

  const showGenerateButton = !formSchema && description.trim().length > 10 && !isLoading
  const showUpdateButton = formSchema && description.trim().length > 0 && !isLoading

  return (
    <div className="compact-input-container">
      {/* Main Input Section */}
      <div className="compact-input-card">
        <div className="input-row">
          <textarea 
            ref={textareaRef}
            value={description}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              formSchema 
                ? "Describe what you'd like to change..."
                : "Describe your form..."
            }
            className="compact-textarea"
            rows={1}
          />
          
          <button 
            type="button"
            className="compact-attach-btn" 
            onClick={handleAttachClick}
            disabled={isLoading}
            title="Upload image, PDF, or analyze URL"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
            </svg>
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            style={{ display: 'none' }}
            accept="image/*,.pdf" 
            onChange={handleFileChange}
          />
        </div>

        {/* Quick Action Buttons Row */}
        <div className="action-buttons-row">
          <div className="quick-actions">
            <button
              onClick={() => setShowURLInput(true)}
              className="quick-action-btn"
            >
              🔗 URL
            </button>
          </div>
          
          {/* Main Action Button */}
          {showGenerateButton && (
            <button 
              onClick={onGenerateForm}
              disabled={isLoading}
              className="generate-btn"
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>✨ Generate</>
              )}
            </button>
          )}
          
          {showUpdateButton && (
            <button 
              onClick={onUpdateForm}
              disabled={isLoading}
              className="update-btn"
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>⚡ Update</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status Actions */}
      {(hasUnsavedChanges || formSchema) && (
        <div className="status-actions">
          {hasUnsavedChanges && (
            <div className="change-actions">
              <button onClick={onSaveChanges} className="save-btn">
                💾 Save
              </button>
              <button onClick={onDiscardChanges} className="discard-btn">
                ↩️ Discard
              </button>
            </div>
          )}

          {formSchema && (
            <button 
              onClick={onPublishForm}
              disabled={isPublishing}
              className="publish-btn"
            >
              {isPublishing ? (
                <>
                  <div className="loading-spinner" />
                  Publishing...
                </>
              ) : (
                <>🚀 {hasExistingForm ? 'Update Live' : 'Publish'}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Form URL Display */}
      {formUrl && (
        <div className="form-url-display">
          <div className="url-status">
            <span className="status-icon">✅</span>
            <span className="status-text">Live at:</span>
          </div>
          <a 
            href={`/forms/${formUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="form-url-link"
          >
            /forms/{formUrl} ↗
          </a>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="error-display">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
    </div>
  )
}