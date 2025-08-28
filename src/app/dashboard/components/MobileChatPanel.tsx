import React, { useState, useRef, useEffect } from 'react'
import styles from '../styles/MobileChatPanel.module.css'
import { ChatMessage } from '../types'
import MobileFormPreviewModal from './MobileFormPreviewModal'

interface MobileChatPanelProps {
  chatHistory: ChatMessage[]
  description: string
  onDescriptionChange: (value: string) => void
  onGenerateForm: () => void
  onUpdateForm: () => void
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onURLSubmit: (url: string) => void
  onAnalyzeURL: (url: string, additionalContext?: string) => void
  isLoading: boolean
  formSchema: any
  publishedFormId?: string
  error: string
  onPublishForm: () => void
  isPublishing: boolean
  onCustomizeForm: () => void
}

export default function MobileChatPanel({
  chatHistory,
  description,
  onDescriptionChange,
  onGenerateForm,
  onUpdateForm,
  onImageUpload,
  onPDFUpload,
  onURLSubmit,
  onAnalyzeURL,
  isLoading,
  formSchema,
  publishedFormId,
  error,
  onPublishForm,
  isPublishing,
  onCustomizeForm
}: MobileChatPanelProps) {
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showURLInput, setShowURLInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [description])

  // Handle click outside popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopup])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPopup(false)
        setShowURLInput(false)
      }
    }

    if (showPopup || showURLInput) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showPopup, showURLInput])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  // File upload handlers
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
      }
      
      setShowPopup(false)
    }
  }

  const handleURLSubmit = () => {
    if (urlValue.trim()) {
      onAnalyzeURL(urlValue.trim())
      setUrlValue('')
      setShowURLInput(false)
    }
  }

  // Get recent messages for compact view
  const recentMessages = chatHistory.slice(-3) // Show last 3 messages
  const hasMoreMessages = chatHistory.length > 3

  // Function to render form preview button if form is generated
  const renderFormPreviewButton = () => {
    // Show form preview button if we have any form data
    if (formSchema && (publishedFormId || formSchema.id || formSchema.title || formSchema.fields)) {
      return (
        <div className={styles.formLinkContainer}>
          <button
            onClick={() => setShowFormModal(true)}
            className={styles.formLink}
          >
            <span className={styles.formLinkIcon}>
              <img 
                src="/orange-arrow.png" 
                alt="Preview" 
                style={{ width: '48px', height: '48px' }}
              />
            </span>
            <span className={styles.formLinkText}>
              {publishedFormId ? 'View Your Form' : 'Preview Your Form'}
            </span>
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <div className={styles.mobileChatPanel}>
      {/* Compact Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <img 
              src="/chatterforms-bubble-transparent.gif" 
              alt="Bubble animation" 
              style={{ width: '16px', height: '16px' }}
            />
          </div>
          <h2 className={styles.headerTitle}>Create New Form</h2>
        </div>
        <button className={styles.headerDropdown}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Chat History Section - Only show if there are messages */}
      {chatHistory.length > 0 && (
        <div className={styles.chatHistorySection}>
          <div className={styles.chatHistoryHeader}>
            <h3 className={styles.chatHistoryTitle}>
              ✨ Chat History
            </h3>
            {hasMoreMessages && (
              <button 
                className={styles.chatHistoryToggle}
                onClick={() => setIsChatExpanded(!isChatExpanded)}
              >
                {isChatExpanded ? 'Collapse' : `Show ${chatHistory.length - 3} more`}
              </button>
            )}
          </div>
          
          <div className={`${styles.chatHistoryContent} ${isChatExpanded ? styles.expanded : ''}`}>
            {(isChatExpanded ? chatHistory : recentMessages).map((message, index) => (
              <div key={index} className={styles.chatMessage}>
                <div className={styles.chatRole}>
                  {message.role === 'user' ? 'YOU' : 'CHATTERFORMS AI'}
                </div>
                <div className={`${styles.chatBubble} ${message.role === 'user' ? styles.user : styles.assistant}`}>
                  <div className={styles.chatContent}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Show loading message when generating form */}
            {isLoading && (
              <div className={styles.chatMessage}>
                <div className={styles.chatRole}>
                  CHATTERFORMS AI
                </div>
                <div className={`${styles.chatBubble} ${styles.assistant}`}>
                  <div className={styles.chatContent}>
                    <div className={styles.loadingMessage}>
                      <span className={styles.loadingSpinner}>⚡</span>
                      Generating your form...
                    </div>
                  </div>
                </div>
              </div>
            )}
            
                                    {/* Form Preview Button - Show when form is generated */}
                        {renderFormPreviewButton()}
          </div>
        </div>
      )}

      {/* Welcome Message - Show when no chat history */}
      {chatHistory.length === 0 && (
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeMessage}>
            <div className={styles.welcomeIcon}>✨</div>
            <div className={styles.welcomeText}>
              Start by describing your form or using the quick actions below
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className={styles.inputSection}>
        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            className={styles.inputField}
            placeholder="Describe your form in detail..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={styles.plusButton}
            onClick={() => setShowPopup(!showPopup)}
            disabled={isLoading}
            title="More options"
          >
            {showPopup ? '×' : '+'}
          </button>
        </div>
      </div>

      {/* Quick Actions - Streamlined single action */}
      <div className={styles.quickActionsSection}>
        <div className={styles.quickActionsContainer}>
          {description.trim() && !formSchema && (
            <button 
              className={styles.quickActionButton}
              onClick={onGenerateForm}
              disabled={isLoading}
            >
              <span className={styles.quickActionIcon}>⚡</span>
              Generate Form
            </button>
          )}
          {description.trim() && formSchema && (
            <button 
              className={styles.quickActionButton}
              onClick={onUpdateForm}
              disabled={isLoading}
            >
              <span className={styles.quickActionIcon}>🔄</span>
              Update Form
            </button>
          )}
          <button 
            className={styles.quickActionButton}
            onClick={() => {
              // TODO: Implement template browsing - for now, just show a placeholder
              console.log('Templates clicked - implement template browsing')
            }}
            disabled={isLoading}
          >
            <span className={styles.quickActionIcon}>✨</span>
            Templates
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* URL Input Popup */}
      {showURLInput && (
        <div className={styles.urlInputSection}>
          <div className={styles.inputContainer}>
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleURLSubmit()}
              placeholder="https://forms.google.com/d/xyz..."
              className={styles.inputField}
              autoFocus
            />
            <button
              className={styles.plusButton}
              onClick={handleURLSubmit}
              disabled={!urlValue.trim()}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Plus Button Popup */}
      {showPopup && (
        <div className={styles.inputSection} ref={popupRef}>
          <div className={styles.quickActionsContainer}>
            <button 
              className={styles.quickActionButton}
              onClick={() => {
                setShowURLInput(true)
                setShowPopup(false)
              }}
            >
              <span className={styles.quickActionIcon}>🔗</span>
              Clone from URL
            </button>
            <button 
              className={styles.quickActionButton}
              onClick={() => {
                fileInputRef.current?.click()
                setShowPopup(false)
              }}
            >
              <span className={styles.quickActionIcon}>📎</span>
              Upload PDF/Image
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBubble}>
            <div className={styles.errorContent}>
              ❌ {error}
            </div>
          </div>
        </div>
      )}

      {/* Form Preview Modal */}
      <MobileFormPreviewModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        formSchema={formSchema}
        onPublish={onPublishForm}
        onCustomize={onCustomizeForm}
        isPublishing={isPublishing}
        publishedFormId={publishedFormId}
      />
    </div>
  )
}
