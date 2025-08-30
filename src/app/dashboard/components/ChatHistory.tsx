import { useRef, useEffect, useState } from 'react'
// Import the CSS module
import styles from '../styles/ModernChatHistory.module.css'
import { FieldExtraction } from '../types'

// Helper function to truncate long URLs
const truncateUrl = (url: string, maxLength: number = 120): string => {
  if (url.length <= maxLength) return url
  
  // Try to keep the domain and truncate the path
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const path = urlObj.pathname + urlObj.search + urlObj.hash
    
    if (domain.length + 10 > maxLength) {
      // Domain is too long, just truncate the whole URL
      return url.substring(0, maxLength - 3) + '...'
    }
    
    // Keep domain and truncate path
    const availablePathLength = maxLength - domain.length - 3 // 3 for "..."
    if (path.length > availablePathLength) {
      return `${domain}...${path.substring(path.length - availablePathLength + 3)}`
    }
    
    return url
  } catch {
    // If URL parsing fails, just truncate
    return url.substring(0, maxLength - 3) + '...'
  }
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking' | 'processing' | 'file' | 'analysisAction' | 'fieldResults'
  content: string
  timestamp?: number
  metadata?: {
    duration?: number
    steps?: string[]
    isComplete?: boolean
    // New metadata for file messages
    fileType?: 'image' | 'pdf' | 'url'
    fileName?: string
    fileData?: string // base64 for images, URL for web pages
    isUpload?: boolean
    isAnalysisAction?: boolean
    // Field results metadata
    extractedFields?: FieldExtraction[]
    onGenerateForm?: () => void
  }
}

interface ChatHistoryProps {
  chatHistory: ChatMessage[]
  onAnalyzeImage?: (additionalContext?: string) => void
  onAnalyzePDF?: (file: File, additionalContext?: string, pageSelection?: { pages: number[], selectAll?: boolean }) => void
  onAnalyzeURL?: (url: string, additionalContext?: string) => void
  uploadedImage?: string | null
  uploadedPDF?: File | null
  uploadedURL?: string | null
  isAnalyzing?: boolean
  analysisComplete?: boolean
  onGenerateFormFromFields?: (fields: FieldExtraction[]) => void
  onResetAnalysis?: () => void
  isLoading?: boolean
  isFromLanding?: boolean // Add flag to prevent duplicate analysis actions
}

// Helper function to group consecutive messages by sender
const groupMessages = (messages: ChatMessage[]) => {
  const groups: Array<{ sender: string, messages: ChatMessage[], timestamp: number }> = []
  let currentGroup: ChatMessage[] = []
  let currentSender: string | null = null

  messages.forEach((message) => {
    if (message.role !== currentSender) {
      if (currentGroup.length > 0) {
        groups.push({ 
          sender: currentSender!, 
          messages: currentGroup,
          timestamp: currentGroup[0].timestamp || Date.now()
        })
      }
      currentGroup = [message]
      currentSender = message.role
    } else {
      currentGroup.push(message)
    }
  })

  if (currentGroup.length > 0) {
    groups.push({ 
      sender: currentSender!, 
      messages: currentGroup,
      timestamp: currentGroup[0].timestamp || Date.now()
    })
  }

  return groups
}

// Format timestamp for display (currently unused but kept for future use)
// const formatTimestamp = (timestamp: number) => {
//   const date = new Date(timestamp)
//   const now = new Date()
//   const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
//   
//   if (diffInHours < 1) {
//     const minutes = Math.floor(diffInHours * 60)
//     return minutes < 1 ? 'Just now' : `${minutes}m ago`
//   } else if (diffInHours < 24) {
//     return `${Math.floor(diffInHours)}h ago`
//   } else {
//     return date.toLocaleDateString()
//   }
// }

// Thinking message component with real-time elapsed time
const ThinkingMessage = ({ steps, timestamp }: { duration?: number, steps?: string[], timestamp?: number }) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (!timestamp || !isClient) return
    
    const updateElapsed = () => {
      const elapsed = Math.round((Date.now() - timestamp) / 1000)
      setElapsedTime(elapsed)
    }
    
    // Update immediately
    updateElapsed()
    
    // Update every second
    const interval = setInterval(updateElapsed, 1000)
    
    return () => clearInterval(interval)
  }, [timestamp, isClient])
  
  return (
    <div className={styles.modernThinkingMessage}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px' }}>💭</div>
        <span className={styles.modernThinkingText}>
          {isClient && elapsedTime > 0 ? `Analyzing... (${elapsedTime}s)` : 'Analyzing...'}
        </span>
      </div>
      
      {steps && steps.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
            Processing steps:
          </div>
          {steps.map((step, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.5' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', flexShrink: 0 }}>•</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Processing message component
const ProcessingMessage = ({ content }: { content: string }) => (
  <div className={styles.modernProcessingMessage}>
    <div style={{ display: 'flex', gap: '4px' }}>
      <div style={{ width: '6px', height: '6px', background: 'rgba(139, 92, 246, 0.8)', borderRadius: '50%', animation: 'processingPulse 1.4s ease-in-out infinite' }}></div>
      <div style={{ width: '6px', height: '6px', background: 'rgba(139, 92, 246, 0.8)', borderRadius: '50%', animation: 'processingPulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }}></div>
      <div style={{ width: '6px', height: '6px', background: 'rgba(139, 92, 246, 0.8)', borderRadius: '50%', animation: 'processingPulse 1.4s ease-in-out infinite', animationDelay: '0.4s' }}></div>
    </div>
    <span className={styles.modernProcessingText}>{content}</span>
  </div>
)

// File message component
const FileMessage = ({ fileType, fileName, fileData, isUpload }: { 
  fileType?: 'image' | 'pdf' | 'url', 
  fileName?: string, 
  fileData?: string,
  isUpload?: boolean 
}) => (
  <div className={styles.modernFileMessage}>
    <div className={styles.modernFileHeader}>
      <div className={styles.modernFileIcon}>
        {fileType === 'pdf' ? '📄' : fileType === 'url' ? '🔗' : '🖼️'}
      </div>
      <div className={styles.modernFileInfo}>
        <div className={styles.modernFileName}>
          {isUpload ? `${fileType === 'pdf' ? 'PDF' : fileType === 'url' ? 'URL' : 'Image'} uploaded` : fileName}
        </div>
        <div className={styles.modernFileStatus}>
          {isUpload ? 'Ready for analysis' : 'Processing...'}
        </div>
      </div>
    </div>
    
    {/* Show image preview for uploaded images */}
    {fileType === 'image' && fileData && (
      <div className={styles.modernImagePreview}>
        <img 
          src={fileData} 
          alt="Uploaded screenshot" 
          className={styles.modernPreviewImage}
        />
      </div>
    )}
    
    {/* URL preview removed to prevent layout issues - user already knows what URL they uploaded */}
  </div>
)

// Analysis action component
const AnalysisAction = ({ fileType, onAnalyze, additionalContext, onContextChange, onDismiss }: {
  fileType?: 'image' | 'pdf' | 'url',
  onAnalyze: () => void,
  additionalContext: string,
  onContextChange: (value: string) => void,
  onDismiss?: () => void
}) => (
  <div className={styles.modernAnalysisAction}>
    <div className={styles.modernAnalysisHeader}>
      <div className={styles.modernAnalysisIcon}>🔍</div>
      <div className={styles.modernAnalysisText}>
        Ready to analyze {fileType === 'pdf' ? 'PDF' : fileType === 'url' ? 'URL' : 'image'}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={styles.modernDismissBtn}
          title="Cancel analysis"
        >
          ✕
        </button>
      )}
    </div>
    
    <div className={styles.modernContextInput}>
      <label className={styles.modernContextLabel}>
        Additional context (optional):
      </label>
      <textarea
        value={additionalContext}
        onChange={(e) => onContextChange(e.target.value)}
        placeholder={
          fileType === 'pdf' 
            ? "e.g., This is a medical intake form, focus on patient information section..."
            : fileType === 'url'
              ? "e.g., This is a contact form, make email required..."
              : "e.g., This is a medical intake form, make phone required..."
        }
        className={styles.modernContextTextarea}
      />
    </div>
    
    <button
      onClick={onAnalyze}
      className={styles.modernAnalyzeButton}
    >
      {fileType === 'pdf' ? '📄 Analyze PDF' : fileType === 'url' ? '🔗 Analyze URL' : '🔍 Analyze Image'}
    </button>
  </div>
)

// Field Results component
const FieldResults = ({ extractedFields, onGenerateForm, isLoading }: { 
  extractedFields?: FieldExtraction[], 
  onGenerateForm?: () => void,
  isLoading?: boolean
}) => {
  if (!extractedFields || extractedFields.length === 0) return null

  return (
    <div className={styles.modernFieldResults}>
      <div className={styles.modernFieldResultsHeader}>
        <div className={styles.modernFieldResultsIcon}>✅</div>
        <div className={styles.modernFieldResultsTitle}>
          Analysis Complete
        </div>
      </div>
      
      <div className={styles.modernFieldList}>
        <div className={styles.modernFieldListHeader}>
          Extracted Fields ({extractedFields.length})
        </div>
        <div className={styles.modernFieldItems}>
          {extractedFields.map((field, index) => (
            <div key={field.id || index} className={styles.modernFieldItem}>
              <div className={styles.modernFieldCheck}>✅</div>
              <div className={styles.modernFieldInfo}>
                <div className={styles.modernFieldLabel}>
                  {field.label}
                </div>
                <div className={styles.modernFieldMeta}>
                  {field.type} • {Math.round((field.confidence || 0.95) * 100)}%
                  {field.options && field.options.length > 0 && (
                    <span className={styles.modernFieldOptions}>
                      • Options: {field.options.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={onGenerateForm}
        disabled={isLoading}
        className={`${styles.modernGenerateFormBtn} ${isLoading ? styles.modernGenerateFormBtnLoading : ''}`}
      >
        {isLoading ? (
          <>
            <div className={styles.modernLoadingSpinner} />
            Generating Form...
          </>
        ) : (
          <>
            <span className={styles.modernGenerateIcon}>✅</span>
            Generate Form ({extractedFields.length} fields)
          </>
        )}
      </button>
    </div>
  )
}

// Real-time timestamp component that updates automatically
const RealTimeTimestamp = ({ timestamp }: { timestamp: number }) => {
  const [displayTime, setDisplayTime] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      const now = Date.now()
      const diffInSeconds = Math.floor((now - timestamp) / 1000)
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      const diffInHours = Math.floor(diffInMinutes / 60)
      
      if (diffInSeconds < 30) {
        setDisplayTime('Just now')
      } else if (diffInSeconds < 60) {
        setDisplayTime(`${diffInSeconds}s ago`)
      } else if (diffInMinutes < 60) {
        setDisplayTime(`${diffInMinutes}m ago`)
      } else if (diffInHours < 24) {
        setDisplayTime(`${diffInHours}h ago`)
      } else {
        // Show actual time for older messages
        const date = new Date(timestamp)
        setDisplayTime(date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }))
      }
    }
    
    // Update immediately
    updateTime()
    
    // Set up interval to update every 30 seconds
    const interval = setInterval(updateTime, 30000)
    
    return () => clearInterval(interval)
  }, [timestamp])
  
  return (
    <div className={styles.modernMessageTimestamp}>
      {displayTime}
    </div>
  )
}

export default function ChatHistory({ 
  chatHistory, 
  onAnalyzeImage,
  onAnalyzePDF,
  onAnalyzeURL,
  uploadedImage,
  uploadedPDF,
  uploadedURL,
  isAnalyzing,
  analysisComplete,
  onGenerateFormFromFields,
  onResetAnalysis,
  isLoading,
  isFromLanding
}: ChatHistoryProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [additionalContext, setAdditionalContext] = useState('')

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (chatContainerRef.current && shouldAutoScroll) {
      const container = chatContainerRef.current
      container.scrollTop = container.scrollHeight
      setIsAtBottom(true)
    }
  }, [chatHistory, shouldAutoScroll])

  // Check if user is at bottom of chat and handle scroll behavior
  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const threshold = 100 // pixels from bottom
      const nearBottom = scrollHeight - scrollTop - clientHeight < threshold
      
      setIsAtBottom(nearBottom)
      setShouldAutoScroll(nearBottom)
    }
  }

  // Manual scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
      setIsAtBottom(true)
      setShouldAutoScroll(true)
    }
  }

  // Check if we should show analysis action
  // Don't show if coming from landing page to prevent duplicates
  const shouldShowAnalysisAction = (uploadedImage || uploadedPDF || uploadedURL) && !isAnalyzing && !analysisComplete && !isFromLanding

  if (chatHistory.length === 0 && !shouldShowAnalysisAction) {
    return (
      <div className={styles.modernChatEmpty}>
        <div className={styles.modernStatusCard}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
            Start by describing your form
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.4' }}>
            Your conversation will appear here
          </div>
        </div>
      </div>
    )
  }

  // Add analysis action message if needed
  const allMessages = [...chatHistory]
  if (shouldShowAnalysisAction) {
    const fileType = uploadedPDF ? 'pdf' : uploadedURL ? 'url' : 'image'
    allMessages.push({
      role: 'analysisAction',
      content: additionalContext,
      timestamp: Date.now(),
      metadata: {
        fileType,
        isAnalysisAction: true
      }
    })
  }
  
  const allMessageGroups = groupMessages(allMessages)

  return (
    <div className={styles.modernChatContainer}>
      {/* Full-height scrollable messages container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className={styles.modernChatScroll}
      >
        <div className={styles.modernChatMessages}>
          {allMessageGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`${styles.modernMessageGroup} ${group.sender === 'user' ? styles.userGroup : styles.assistantGroup}`}
            >
              {/* Sender Label */}
              <div className={styles.modernSenderLabel}>
                {group.sender === 'user' ? 'You' : 'Chatterforms AI'}
              </div>
              
              {group.messages.map((message, messageIndex) => (
                <div
                  key={messageIndex}
                  className={`${styles.modernChatMessage} ${message.role}`}
                >
                  <div className={styles.modernMessageContent}>
                    {message.role === 'thinking' ? (
                      <ThinkingMessage 
                        duration={message.metadata?.duration}
                        steps={message.metadata?.steps}
                        timestamp={message.timestamp}
                      />
                    ) : message.role === 'processing' ? (
                      <ProcessingMessage content={message.content} />
                    ) : message.role === 'file' ? (
                      <FileMessage 
                        fileType={message.metadata?.fileType}
                        fileName={message.metadata?.fileName}
                        fileData={message.metadata?.fileData}
                        isUpload={message.metadata?.isUpload}
                      />
                                                              ) : message.role === 'analysisAction' ? (
                       <AnalysisAction 
                         fileType={message.metadata?.fileType}
                         onAnalyze={() => {
                           if (uploadedPDF && onAnalyzePDF) {
                             onAnalyzePDF(uploadedPDF, additionalContext)
                           } else if (uploadedURL && onAnalyzeURL) {
                             onAnalyzeURL(uploadedURL, additionalContext)
                           } else if (uploadedImage && onAnalyzeImage) {
                             onAnalyzeImage(additionalContext)
                           }
                         }}
                         additionalContext={additionalContext}
                         onContextChange={setAdditionalContext}
                         onDismiss={onResetAnalysis}
                       />
                     ) : message.role === 'fieldResults' ? (
                       <FieldResults 
                         extractedFields={message.metadata?.extractedFields}
                         onGenerateForm={() => {
                           if (message.metadata?.extractedFields && onGenerateFormFromFields) {
                             onGenerateFormFromFields(message.metadata.extractedFields)
                           }
                         }}
                         isLoading={isLoading}
                       />
                     ) : (
                      <>
                        <div className={styles.modernMessageText}>{message.content}</div>
                        {messageIndex === group.messages.length - 1 && (
                          <RealTimeTimestamp timestamp={message.timestamp || Date.now()} />
                        )}                      
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Show loading message when generating form */}
        {isLoading && (
          <div className={`${styles.modernMessageGroup} ${styles.assistantGroup}`}>
            <div className={styles.modernSenderLabel}>
              Chatterforms AI
            </div>
            <div className={`${styles.modernChatMessage} assistant`}>
              <div className={styles.modernMessageContent}>
                <div className={styles.loadingMessage}>
                  <span className={styles.loadingSpinner}>⚡</span>
                  Generating your form...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scroll to Bottom Button - Show when not at bottom */}
      {!isAtBottom && chatHistory.length > 3 && (
        <button
          onClick={scrollToBottom}
          className={styles.modernScrollBtn}
          title="Scroll to bottom"
        >
          <svg 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span style={{ fontSize: '11px' }}>New messages</span>
        </button>
      )}
    </div>
  )
}