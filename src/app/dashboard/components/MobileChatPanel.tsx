import React, { useState, useEffect, useRef } from 'react'
import styles from '../styles/MobileChatPanel.module.css'
import { ChatMessage, FieldExtraction } from '../types'
import MobileFormPreviewModal from './MobileFormPreviewModal'

// Thinking message component with animation
const ThinkingMessage = ({ steps, timestamp, type }: { steps?: string[], timestamp?: number, type?: string }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const interval = setInterval(() => {
      setElapsed(Date.now() - (timestamp || Date.now()))
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % (steps?.length || 1))
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [steps, timestamp, isClient])

  // Determine title based on type
  const getTitle = () => {
    switch (type) {
      case 'image':
        return 'Analyzing Image...'
      case 'url':
        return 'Analyzing URL...'
      case 'pdf':
      default:
        return 'Analyzing PDF...'
    }
  }

  return (
    <div className={styles.thinkingMessage}>
      <div className={styles.thinkingSpinner}>
        <div className={styles.spinnerDot}></div>
        <div className={styles.spinnerDot}></div>
        <div className={styles.spinnerDot}></div>
      </div>
      <div className={styles.thinkingContent}>
        <div className={styles.thinkingTitle}>{getTitle()}</div>
        {steps && steps[currentStep] && (
          <div className={styles.thinkingStep}>{steps[currentStep]}</div>
        )}
        {isClient && (
          <div className={styles.thinkingTime}>{Math.round(elapsed / 1000)}s</div>
        )}
      </div>
    </div>
  )
}

// Field results message component
const FieldResultsMessage = ({ 
  extractedFields, 
  onGenerateForm, 
  isLoading,
  onGenerateFormFromFields
}: { 
  extractedFields: FieldExtraction[]
  onGenerateForm: () => void
  isLoading: boolean
  onGenerateFormFromFields?: (fields: FieldExtraction[]) => void
}) => {
  return (
    <div className={styles.fieldResultsMessage}>
      <div className={styles.fieldResultsHeader}>
        <div className={styles.fieldResultsIcon}>✅</div>
        <div className={styles.fieldResultsTitle}>Field extraction complete</div>
      </div>
      
      <div className={styles.fieldResultsContent}>
        <div className={styles.fieldResultsSummary}>
          Extracted {extractedFields.length} fields from your document
        </div>
        
        <div className={styles.fieldResultsList}>
          {extractedFields.slice(0, 3).map((field, index) => (
            <div key={index} className={styles.fieldResultItem}>
              <span className={styles.fieldLabel}>{field.label}</span>
              <span className={styles.fieldType}>({field.type})</span>
              {field.required && <span className={styles.fieldRequired}>*</span>}
            </div>
          ))}
          {extractedFields.length > 3 && (
            <div className={styles.fieldResultMore}>
              +{extractedFields.length - 3} more fields
            </div>
          )}
        </div>
        
        <button
          onClick={() => onGenerateFormFromFields ? onGenerateFormFromFields(extractedFields) : onGenerateForm()}
          disabled={isLoading}
          className={styles.generateFormButton}
        >
          {isLoading ? (
            <>
              <span className={styles.buttonSpinner}>⚡</span>
              Generating form...
            </>
          ) : (
            <>
              <span className={styles.buttonIcon}>🚀</span>
              Generate Form
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// File message component
const FileMessage = ({ message }: { message: ChatMessage }) => {
  const isPDF = message.metadata?.fileType === 'pdf'
  const isURL = message.metadata?.fileType === 'url'
  
  // Truncate URL for display
  const truncateURL = (url: string) => {
    if (url.length > 40) {
      return url.substring(0, 37) + '...'
    }
    return url
  }
  
  const displayText = isURL && message.metadata?.fileName 
    ? truncateURL(message.metadata.fileName)
    : message.metadata?.fileName || message.content
  
  return (
    <div className={styles.fileMessage}>
      <div className={styles.fileIcon}>
        {isPDF ? '📄' : isURL ? '🔗' : '📎'}
      </div>
      <div className={styles.fileContent}>
        <div className={styles.fileName}>
          {isPDF ? 'PDF uploaded' : isURL ? 'URL uploaded' : 'File uploaded'}
        </div>
        <div className={styles.fileName} title={message.metadata?.fileName || message.content}>
          {displayText}
        </div>
      </div>
    </div>
  )
}

interface FormSchema {
  id?: string
  title: string
  fields: FormField[]
  styling?: {
    backgroundColor?: string
    fontFamily?: string
    fontSize?: string
    color?: string
    borderRadius?: string
    padding?: string
    margin?: string
  }
}

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: string[]
  confidence?: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
  additionalContext?: string
}

interface MobileChatPanelProps {
  chatHistory: ChatMessage[]
  description: string
  onDescriptionChange: (value: string) => void
  onGenerateForm: () => void
  onUpdateForm: () => void
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onAnalyzeURL: (url: string, additionalContext?: string) => void
  isLoading: boolean
  formSchema: FormSchema | null
  publishedFormId?: string
  error: string
  onPublishForm: () => void
  isPublishing: boolean
  hasUnsavedChanges?: boolean
  onCustomizeForm: () => void
  onGenerateFormFromFields?: (fields: FieldExtraction[]) => void
}

export default function MobileChatPanel({
  chatHistory,
  description,
  onDescriptionChange,
  onGenerateForm,
  onUpdateForm,
  onImageUpload,
  onPDFUpload,
  onAnalyzeURL,
  isLoading,
  formSchema,
  publishedFormId,
  error,
  onPublishForm,
  isPublishing,
  hasUnsavedChanges = false,
  onCustomizeForm,
  onGenerateFormFromFields
}: MobileChatPanelProps) {
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showURLInput, setShowURLInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const chatHistoryRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [description])

  // Auto-scroll to bottom when form is generated or new messages added
  useEffect(() => {
    if (chatHistoryRef.current) {
      setTimeout(() => {
        chatHistoryRef.current?.scrollTo({
          top: chatHistoryRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [formSchema, chatHistory.length])

  // Handle click outside popup and workspace menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
      
      // Close workspace menu if clicking outside
      if (showWorkspaceMenu) {
        const target = event.target as Node
        const workspaceMenu = document.querySelector('[data-workspace-menu]')
        const headerDropdown = document.querySelector('[data-header-dropdown]')
        
        if (workspaceMenu && !workspaceMenu.contains(target) && 
            headerDropdown && !headerDropdown.contains(target)) {
          setShowWorkspaceMenu(false)
        }
      }
    }

    if (showPopup || showWorkspaceMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopup, showWorkspaceMenu])

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
      // Clear the file input so the same file can be selected again
      e.target.value = ''
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
    // Show form preview button if we have any form data AND not currently loading
    if (formSchema && !isLoading && (publishedFormId || formSchema.id || formSchema.title || formSchema.fields)) {
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
              {publishedFormId ? 'Preview Your Form' : 'Preview Your Form'}
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
        <button 
          className={styles.headerDropdown}
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          data-header-dropdown
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        
        {/* Workspace Dropdown Menu */}
        {showWorkspaceMenu && (
          <div className={styles.workspaceMenu} data-workspace-menu>
            <button 
              className={styles.menuItem}
              onClick={() => {
                console.log('🏠 Landing Page button clicked')
                window.location.href = '/'
                setShowWorkspaceMenu(false)
              }}
            >
              <span className={styles.menuIcon}>🏠</span>
              <span className={styles.menuText}>Landing Page</span>
            </button>
            <button 
              className={styles.menuItem}
              onClick={() => {
                console.log('📄 New Form button clicked')
                window.location.href = '/dashboard'
                setShowWorkspaceMenu(false)
              }}
            >
              <span className={styles.menuIcon}>📄</span>
              <span className={styles.menuText}>New Form</span>
            </button>
          </div>
        )}
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
          
          <div 
            ref={chatHistoryRef}
            className={`${styles.chatHistoryContent} ${isChatExpanded ? styles.expanded : ''}`}
          >
            {(isChatExpanded ? chatHistory : recentMessages).map((message, index) => (
              <div key={index} className={styles.chatMessage}>
                <div className={styles.chatRole}>
                  {message.role === 'user' ? 'YOU' : 'CHATTERFORMS AI'}
                </div>
                <div className={`${styles.chatBubble} ${message.role === 'user' ? styles.user : styles.assistant}`}>
                  <div className={styles.chatContent}>
                    {message.role === 'thinking' ? (
                      <ThinkingMessage 
                        steps={message.metadata?.steps} 
                        timestamp={message.timestamp}
                        type={message.metadata?.type}
                      />
                    ) : message.role === 'fieldResults' ? (
                      <FieldResultsMessage 
                        extractedFields={message.metadata?.extractedFields || []}
                        onGenerateForm={onGenerateForm}
                        isLoading={isLoading}
                        onGenerateFormFromFields={onGenerateFormFromFields}
                      />
                    ) : message.role === 'file' ? (
                      <FileMessage message={message} />
                    ) : (
                      message.content
                    )}
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
          <div className={styles.plusButtonContainer}>
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
      </div>

      {/* Quick Actions - Original layout */}
      <div className={styles.quickActionsSection}>
        <div className={styles.quickActionsContainer}>
          {/* Generate/Update Actions */}
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
          
          {/* Templates Button */}
          {/* TODO: Implement template browsing - commented out for now
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
          */}
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

      {/* Plus Button Popup - Positioned like landing page */}
      {showPopup && (
        <div className={styles.popupMenu} ref={popupRef}>
          <button 
            className={styles.menuItem}
            onClick={() => {
              setShowURLInput(true)
              setShowPopup(false)
            }}
          >
            <span className={styles.menuIcon}>🔗</span>
            <span className={styles.menuText}>Clone from URL</span>
          </button>
          <button 
            className={styles.menuItem}
            onClick={() => {
              fileInputRef.current?.click()
              setShowPopup(false)
            }}
          >
            <span className={styles.menuIcon}>📎</span>
            <span className={styles.menuText}>Upload PDF/Image</span>
          </button>
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
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  )
}
