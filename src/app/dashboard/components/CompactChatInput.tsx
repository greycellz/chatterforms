import { useRef, useState } from 'react'
// Import CSS Modules instead of regular CSS
import styles from '../styles/CompactChatInput.module.css'

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
  // REMOVED: onPublishForm, isPublishing, publishedFormId (moved to form preview)
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
  const [showSecondaryActions, setShowSecondaryActions] = useState(false)

  // Smart placeholder based on context
  const getSmartPlaceholder = () => {
    if (analysisComplete && !formSchema) {
      return "Review the extracted fields above, then describe any changes you'd like..."
    }
    if (formSchema) {
      return "What would you like to change or add to your form?"
    }
    return "Describe your form in detail - the more specific, the better..."
  }

  // Contextual hints based on input state
  const getContextualHints = () => {
    if (analysisComplete && !formSchema) {
      return "💡 Review the extracted fields above, then describe any modifications you'd like"
    }
    if (description.length < 10) {
      return "💡 Be specific about your form requirements for better results"
    }
    if (description.length > 50 && !formSchema) {
      return "✅ Perfect! Your description is detailed enough to generate a great form"
    }
    if (formSchema && description.length > 10) {
      return "⚡ Ready to apply these changes to your form"
    }
    return null
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (description.trim()) {
        if (formSchema) {
          onUpdateForm()
        } else {
          onGenerateForm()
        }
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
    setShowSecondaryActions(false)
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
      <div className={styles.compactInputContainer}>
        <div className={styles.urlInputSection}>
          <div className={styles.urlHeader}>
            <span className={styles.urlTitle}>🔗 Analyze Form URL</span>
            <button
              onClick={() => {
                setShowURLInput(false)
                setUrlValue('')
              }}
              className={styles.urlCancel}
            >
              Cancel
            </button>
          </div>
          
          <div className={styles.urlInputCard}>
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleURLSubmit()}
              placeholder="https://forms.google.com/d/xyz... or any form URL"
              className={styles.urlInput}
              autoFocus
            />
          </div>
          
          <button
            onClick={handleURLSubmit}
            disabled={!urlValue.trim()}
            className={styles.urlSubmitBtn}
          >
            Analyze URL
          </button>
        </div>
      </div>
    )
  }

  // Hide during upload workflow (but show after analysis is complete)
  if ((uploadedImage || uploadedPDF || uploadedURL) && !analysisComplete) {
    return null
  }

  const canTakeAction = description.trim().length > 0 && !isLoading
  const showGenerateButton = !formSchema && canTakeAction
  const showUpdateButton = formSchema && canTakeAction

  return (
    <div className={styles.compactInputContainer}>
      {/* Primary Input Section - Always visible and prominent */}
      <div className={styles.primaryInputSection}>
        <div className={styles.compactInputCard}>
          <div className={styles.inputRow}>
            <textarea 
              ref={textareaRef}
              value={description}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={getSmartPlaceholder()}
              className={styles.compactTextarea}
              rows={1}
            />
            
            {/* Primary Action Button - Only show when ready */}
            {canTakeAction && (
              <button 
                onClick={formSchema ? onUpdateForm : onGenerateForm}
                disabled={isLoading}
                className={styles.primaryActionBtn}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner} />
                ) : formSchema ? (
                  <>⚡ Update</>
                ) : (
                  <>✨ Generate</>
                )}
              </button>
            )}
          </div>
          
          {/* Contextual hints */}
          {getContextualHints() && (
            <div className={styles.smartHints}>
              <span className={styles.hintText}>{getContextualHints()}</span>
            </div>
          )}
        </div>
        
        {/* Keyboard shortcut hint */}
        {canTakeAction && (
          <div className={styles.keyboardHint}>
            Press <kbd>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</kbd> + <kbd>Enter</kbd> to {formSchema ? 'update' : 'generate'}
          </div>
        )}
      </div>

      {/* Secondary Actions - Cleaner organization (REMOVED publish action) */}
      <div className={styles.secondaryActions}>
        <button 
          onClick={() => setShowSecondaryActions(!showSecondaryActions)}
          className={styles.toggleActionsBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
          More options
        </button>
        
        {showSecondaryActions && (
          <div className={styles.actionsPanel}>
            <button
              onClick={() => {
                setShowURLInput(true)
                setShowSecondaryActions(false)
              }}
              className={styles.actionItem}
            >
              <span className={styles.actionIcon}>🔗</span>
              <span>Analyze URL</span>
            </button>
            
            <button
              onClick={handleAttachClick}
              className={styles.actionItem}
            >
              <span className={styles.actionIcon}>📎</span>
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        style={{ display: 'none' }}
        accept="image/*,.pdf" 
        onChange={handleFileChange}
      />

      {/* Error Display */}
      {error && (
        <div className={styles.errorDisplay}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}
    </div>
  )
}