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
      <div className="chat-history-empty">
        <div className="status-card">
          <div className="status-icon">✨</div>
          <div className="status-title">
            Start by describing your form or uploading a file
          </div>
          <div className="status-subtitle">
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
        className="chat-history-scroll"
      >
        <div className="chat-messages">
          {chatHistory.map((message, idx) => (
            <div
              key={idx}
              className={`chat-message ${message.role}`}
            >
              <div className="message-content">
                <div className="message-role">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll to Bottom Button - Show when not at bottom */}
      {!isAtBottom && chatHistory.length > 2 && (
        <button
          onClick={scrollToBottom}
          className="scroll-to-bottom-btn"
          title="Scroll to bottom"
        >
          <svg 
            width="20" 
            height="20" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="new-messages-text">New messages</span>
        </button>
      )}

      <style jsx>{`
        /* Container Layout - Critical for proper scrolling */
        .chat-history-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0; /* Critical: allows flex child to shrink */
          position: relative;
          overflow: hidden;
        }

        .chat-history-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px 28px;
          scroll-behavior: smooth;
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: min-content;
        }

        /* Empty State */
        .chat-history-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 28px;
        }

        .status-card {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          backdrop-filter: blur(15px);
          max-width: 300px;
        }

        .status-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .status-title {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .status-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.4;
        }

        /* Message Bubbles - Lovable-style with larger fonts */
        .chat-message {
          display: flex;
          margin-bottom: 4px;
          animation: messageSlideIn 0.3s ease-out;
        }

        .chat-message.user {
          justify-content: flex-end;
        }

        .chat-message.assistant {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          min-width: 120px;
        }

        /* User Messages - Blue theme like Lovable */
        .chat-message.user .message-content {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          border-radius: 18px 18px 4px 18px;
          padding: 12px 16px;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.25);
        }

        /* Assistant Messages - Light theme with subtle background */
        .chat-message.assistant .message-content {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 18px 18px 18px 4px;
          padding: 12px 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }

        .message-role {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        /* Larger font size like Lovable */
        .message-text {
          font-size: 16px;
          line-height: 1.5;
          font-weight: 500;
          word-wrap: break-word;
        }

        /* Scroll to Bottom Button */
        .scroll-to-bottom-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(37, 99, 235, 0.95);
          color: white;
          border: none;
          border-radius: 24px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 600;
          z-index: 10;
        }

        .scroll-to-bottom-btn:hover {
          background: rgba(37, 99, 235, 1);
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(37, 99, 235, 0.5);
        }

        .new-messages-text {
          font-size: 13px;
        }

        /* Custom Scrollbar */
        .chat-history-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .chat-history-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .chat-history-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .chat-history-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Animations */
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .chat-history-scroll {
            padding: 16px 20px;
          }

          .chat-messages {
            gap: 12px;
          }

          .message-content {
            max-width: 85%;
          }

          .message-text {
            font-size: 15px;
          }

          .scroll-to-bottom-btn {
            bottom: 16px;
            right: 16px;
            padding: 10px 14px;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .chat-message.user .message-content {
            background: #1e40af;
            border: 2px solid #ffffff;
          }

          .chat-message.assistant .message-content {
            background: rgba(255, 255, 255, 0.95);
            color: #000000;
            border: 2px solid rgba(255, 255, 255, 0.8);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .chat-history-scroll {
            scroll-behavior: auto;
          }

          .messageSlideIn,
          .scroll-to-bottom-btn {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}