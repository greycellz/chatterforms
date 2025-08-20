import { useRef, useEffect, useState } from 'react'
// Import the CSS module
import styles from '../styles/ModernChatHistory.module.css'

interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking' | 'processing'
  content: string
  timestamp?: number
  metadata?: {
    duration?: number
    steps?: string[]
    isComplete?: boolean
  }
}

interface ChatHistoryProps {
  chatHistory: ChatMessage[]
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

// Format timestamp for display
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60)
    return minutes < 1 ? 'Just now' : `${minutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Thinking message component
const ThinkingMessage = ({ duration, steps }: { duration?: number, steps?: string[] }) => (
  <div className={styles.modernThinkingMessage}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <div style={{ fontSize: '16px' }}>💭</div>
      <span className={styles.modernThinkingText}>
        {duration ? `Thought for ${duration} seconds` : 'Thinking...'}
      </span>
    </div>
    
    {steps && steps.length > 0 && (
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '6px' }}>
          Plan:
        </div>
        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.4' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', flexShrink: 0 }}>•</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

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

// Add this after the formatTimestamp function (around line 60)

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

export default function ChatHistory({ chatHistory }: ChatHistoryProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

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

  if (chatHistory.length === 0) {
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

  const messageGroups = groupMessages(chatHistory)

  return (
    <div className={styles.modernChatContainer}>
      {/* Full-height scrollable messages container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className={styles.modernChatScroll}
      >
        <div className={styles.modernChatMessages}>
          {messageGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`${styles.modernMessageGroup} ${group.sender === 'user' ? styles.userGroup : styles.assistantGroup}`}
            >
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
                      />
                    ) : message.role === 'processing' ? (
                      <ProcessingMessage content={message.content} />
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