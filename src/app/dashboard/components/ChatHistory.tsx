import { useRef, useEffect, useState } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatHistoryProps {
  chatHistory: ChatMessage[]
}

export default function ChatHistory({ chatHistory }: ChatHistoryProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      // Always scroll to bottom when new messages arrive
      container.scrollTop = container.scrollHeight
      setIsAtBottom(true)
    }
  }, [chatHistory])

  // Check if user is at bottom of chat
  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const threshold = 50 // pixels from bottom
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold)
    }
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      setIsAtBottom(true)
    }
  }

  if (chatHistory.length === 0) {
    return (
      <div className="chat-history">
        <div className="status-card">
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>✨</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
            Start by describing your form or uploading a file
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '8px' }}>
            Your conversation will appear here
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-history-container">
      {/* Scrollable Messages Container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className="chat-history"
      >
        {chatHistory.map((message, idx) => (
          <div
            key={idx}
            className={`chat-message ${message.role}`}
          >
            <div className="chat-bubble">
              <div className="chat-role">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div className="chat-content">{message.content}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Scroll to Bottom Button - Only show when not at bottom and has messages */}
      {!isAtBottom && chatHistory.length > 3 && (
        <button
          onClick={scrollToBottom}
          className="dashboard-btn"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
          title="Scroll to bottom"
        >
          <svg 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  )
}