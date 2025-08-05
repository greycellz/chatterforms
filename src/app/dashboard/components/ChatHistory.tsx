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

  // Auto-scroll to bottom when new messages arrive, but only if user was already at bottom
  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, isAtBottom])

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
    return null
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Chat History</h3>
      </div>
      
      <div className="flex-1 relative">
        {/* Scrollable Messages Container */}
        <div 
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="absolute inset-0 overflow-y-auto px-4 pb-2 space-y-3"
          style={{ scrollBehavior: 'smooth' }}
        >
          {chatHistory.map((message, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-100 text-blue-800 ml-4'
                  : 'bg-green-100 text-green-800 mr-4'
              }`}
            >
              <div className="font-medium text-xs mb-1 opacity-75">
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className="leading-relaxed">{message.content}</div>
            </div>
          ))}
        </div>
        
        {/* Scroll to Bottom Button - Only show when not at bottom */}
        {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-gray-800 z-10"
            title="Scroll to bottom"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}