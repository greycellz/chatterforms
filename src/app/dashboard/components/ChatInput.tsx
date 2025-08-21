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
  const [inputFocused, setInputFocused] = useState(false)

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

  // Determine if we should show the hero CTA
  const showHeroCTA = !formSchema && description.trim().length > 10 && !isLoading
  const showUpdateButton = formSchema && description.trim().length > 0 && !isLoading

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Main input with integrated upload - Hide during upload workflow */}
      {!uploadedImage && !uploadedPDF && !uploadedURL && !analysisComplete && (
        <>
          {/* Enhanced Input Card with better visual hierarchy */}
          <div className={`enhanced-input-card ${inputFocused ? 'focused' : ''} ${showHeroCTA ? 'ready-state' : ''}`}>
            <div className="input-wrapper">
              <textarea 
                ref={textareaRef}
                value={description}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={
                  formSchema 
                    ? "Describe what you'd like to change or add..."
                    : "Describe your form in detail - the more specific, the better the result..."
                }
                className="enhanced-textarea"
                style={{
                  minHeight: '48px',
                  maxHeight: '200px'
                }}
              />
              
              {/* Enhanced attachment button with better visual cues */}
              <button 
                type="button"
                className="enhanced-attach-btn" 
                onClick={handleAttachClick}
                disabled={isLoading}
                title="Upload image, PDF, or analyze URL"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                </svg>
                <span className="attach-label">Upload</span>
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

            {/* Input Progress Indicator */}
            {description.trim().length > 0 && !formSchema && (
              <div className="input-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min((description.trim().length / 50) * 100, 100)}%` 
                    }}
                  />
                </div>
                <span className="progress-text">
                  {description.trim().length < 10 
                    ? "Keep going... add more details" 
                    : description.trim().length < 30 
                      ? "Good! A bit more detail would help"
                      : "Perfect! Ready to generate"
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Enhanced hints with better visual hierarchy */}
          <div className="enhanced-input-hints">
            <div className="hint-chips">
              <div className="hint-chip">
                <span className="hint-icon">💬</span>
                <span>Describe your form</span>
              </div>
              <div className="hint-chip">
                <span className="hint-icon">📎</span>
                <span>Upload screenshots or PDFs</span>
              </div>
              <div className="hint-chip" onClick={() => setShowURLInput(true)}>
                <span className="hint-icon">🔗</span>
                <span>Analyze URLs</span>
              </div>
            </div>
            
            {/* Keyboard shortcut hint */}
            {(showHeroCTA || showUpdateButton) && (
              <div className="keyboard-hint">
                Press <kbd>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</kbd> + <kbd>Enter</kbd> to generate
              </div>
            )}
          </div>
        </>
      )}

      {/* HERO Call-to-Action Section */}
      {showHeroCTA && (
        <div className="hero-cta-section">
          <button 
            onClick={onGenerateForm}
            disabled={isLoading || !description.trim()}
            className="hero-cta-button"
          >
            <div className="hero-cta-content">
              <div className="cta-main">
                <span className="cta-icon">✨</span>
                <span className="cta-text">Generate My Form</span>
                <span className="cta-icon">✨</span>
              </div>
              <div className="cta-subtitle">
                AI will create your form in seconds
              </div>
            </div>
            <div className="cta-glow"></div>
          </button>
        </div>
      )}

      {/* Secondary Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Update Button for existing forms */}
        {showUpdateButton && (
          <button 
            onClick={onUpdateForm}
            disabled={isLoading}
            className="secondary-cta-button"
          >
            <div className="secondary-cta-content">
              {isLoading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Form</span>
                  <span className="update-hint">Apply these changes</span>
                </>
              )}
            </div>
          </button>
        )}

        {/* Save/Discard Changes Buttons */}
        {hasUnsavedChanges && (
          <div className="change-actions">
            <button 
              onClick={onSaveChanges}
              className="change-btn save"
            >
              <span>💾</span>
              <span>Save Changes</span>
            </button>
            <button 
              onClick={onDiscardChanges}
              className="change-btn discard"
            >
              <span>↩️</span>
              <span>Discard Changes</span>
            </button>
          </div>
        )}

        {/* Publish Button */}
        {formSchema && (
          <button 
            onClick={onPublishForm}
            disabled={isPublishing}
            className="publish-button"
          >
            <div className="publish-content">
              {isPublishing ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span className="publish-icon">🚀</span>
                  <span>{hasExistingForm ? 'Update Live Form' : 'Publish Form'}</span>
                </>
              )}
            </div>
          </button>
        )}

        {/* Published Form URL - Enhanced styling */}
        {formUrl && (
          <div className="published-status">
            <div className="status-header">
              <span className="status-icon">✅</span>
              <span className="status-title">
                {hasExistingForm && !publishedFormId ? 'Form Live!' : 'Published Successfully!'}
              </span>
            </div>
            <div className="status-url-container">
              <a 
                href={`/forms/${formUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="status-url-link"
              >
                <span className="url-text">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/forms/{formUrl}
                </span>
                <span className="external-icon">↗</span>
              </a>
            </div>
            {hasExistingForm && (
              <div className="status-note">
                Updates will automatically sync to this URL
              </div>
            )}
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="error-status">
            <div className="error-header">
              <span className="error-icon">⚠️</span>
              <span className="error-title">Something went wrong</span>
            </div>
            <div className="error-message">{error}</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-input-card {
          background: rgba(255, 255, 255, 0.97);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 8px 16px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .enhanced-input-card.focused {
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.15),
            0 12px 24px rgba(139, 92, 246, 0.1),
            0 0 0 1px rgba(139, 92, 246, 0.2);
          transform: translateY(-2px);
        }

        .enhanced-input-card.ready-state {
          border-color: rgba(34, 197, 94, 0.4);
          background: rgba(255, 255, 255, 0.98);
        }

        .enhanced-input-card.ready-state::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }

        .enhanced-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #1f2937;
          font-size: 16px;
          font-family: inherit;
          resize: none;
          line-height: 1.6;
          font-weight: 500;
          overflow-y: auto;
        }

        .enhanced-textarea::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .enhanced-attach-btn {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
        }

        .enhanced-attach-btn:hover {
          background: linear-gradient(135deg, #e5e7eb, #d1d5db);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .enhanced-attach-btn svg {
          width: 16px;
          height: 16px;
        }

        .attach-label {
          font-size: 13px;
        }

        .input-progress {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a855f7);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
        }

        .enhanced-input-hints {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .hint-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hint-chip {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hint-chip:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .hint-icon {
          font-size: 14px;
        }

        .keyboard-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .keyboard-hint kbd {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-family: monospace;
        }

        /* HERO CTA SECTION */
        .hero-cta-section {
          display: flex;
          justify-content: center;
          margin: 8px 0;
        }

        .hero-cta-button {
          background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
          border: none;
          border-radius: 16px;
          padding: 0;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 
            0 8px 32px rgba(30, 64, 175, 0.4),
            0 4px 16px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 320px;
        }

        .hero-cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 16px 48px rgba(30, 64, 175, 0.5),
            0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .hero-cta-button:active {
          transform: translateY(-1px);
        }

        .hero-cta-content {
          position: relative;
          z-index: 2;
          padding: 20px 24px;
          color: white;
          text-align: center;
        }

        .cta-main {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .cta-text {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .cta-icon {
          font-size: 16px;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.1) rotate(5deg); opacity: 0.8; }
        }

        .cta-subtitle {
          font-size: 12px;
          opacity: 0.9;
          font-weight: 500;
        }

        .cta-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.2) 50%, 
            transparent 100%);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .hero-cta-button:hover .cta-glow {
          left: 100%;
        }

        /* Secondary CTA */
        .secondary-cta-button {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
        }

        .secondary-cta-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .secondary-cta-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .update-hint {
          font-size: 11px;
          opacity: 0.8;
          font-weight: 400;
        }

        /* Change Actions */
        .change-actions {
          display: flex;
          gap: 8px;
        }

        .change-btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .change-btn.save {
          background: rgba(34, 197, 94, 0.15);
          color: rgba(34, 197, 94, 0.9);
          border: 1px solid rgba(34, 197, 94, 0.25);
        }

        .change-btn.discard {
          background: rgba(239, 68, 68, 0.15);
          color: rgba(239, 68, 68, 0.9);
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .change-btn:hover {
          transform: translateY(-1px);
        }

        /* Publish Button */
        .publish-button {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border: none;
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);
        }

        .publish-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
        }

        .publish-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .publish-icon {
          font-size: 16px;
        }

        /* Status Cards */
        .published-status {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 16px;
          backdrop-filter: blur(15px);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .status-icon {
          font-size: 16px;
        }

        .status-title {
          font-weight: 600;
          color: rgba(34, 197, 94, 0.9);
          font-size: 14px;
        }

        .status-url-container {
          margin-bottom: 8px;
        }

        .status-url-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.95);
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          transition: all 0.2s ease;
          word-break: break-all;
        }

        .status-url-link:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .external-icon {
          font-size: 12px;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .status-note {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
        }

        /* Error Status */
        .error-status {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 16px;
          backdrop-filter: blur(15px);
        }

        .error-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .error-icon {
          font-size: 16px;
        }

        .error-title {
          font-weight: 600;
          color: rgba(239, 68, 68, 0.9);
          font-size: 14px;
        }

        .error-message {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }

        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}