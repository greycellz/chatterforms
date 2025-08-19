// TEST COMPONENT - Replace your current ChatPanel temporarily
// This will help us confirm the component is being used

import { ChatMessage } from '../types'

interface TestChatPanelProps {
  chatHistory: ChatMessage[]
  description: string
  onDescriptionChange: (value: string) => void
  onGenerateForm: () => void
}

export default function TestChatPanel({ 
  chatHistory, 
  description, 
  onDescriptionChange, 
  onGenerateForm 
}: TestChatPanelProps) {
  console.log('🧪 TestChatPanel rendering:', { 
    chatHistoryLength: chatHistory.length,
    description 
  })

  return (
    <div style={{
      width: '33.333%',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', // RED for visibility
      border: '3px solid yellow', // YELLOW border for visibility
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid white', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>🧪 TEST CHAT PANEL WORKING!</h2>
        <p>Chat messages: {chatHistory.length}</p>
      </div>
      
      {/* Chat History */}
      <div style={{ 
        flex: 1, 
        background: 'rgba(0,0,0,0.3)', 
        padding: '15px', 
        borderRadius: '10px',
        marginBottom: '20px',
        overflow: 'auto'
      }}>
        <h3>Chat History ({chatHistory.length} messages):</h3>
        {chatHistory.length === 0 ? (
          <p>No messages yet - this confirms the component is working!</p>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} style={{ 
              margin: '10px 0', 
              padding: '10px', 
              background: msg.role === 'user' ? '#4287f5' : '#42f554',
              borderRadius: '8px',
              color: 'black'
            }}>
              <strong>{msg.role}:</strong> {msg.content}
            </div>
          ))
        )}
      </div>
      
      {/* Input */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Test input - type here..."
          style={{
            width: '100%',
            height: '60px',
            marginBottom: '10px',
            padding: '10px',
            borderRadius: '5px',
            border: 'none',
            fontSize: '16px'
          }}
        />
        <button
          onClick={onGenerateForm}
          disabled={!description.trim()}
          style={{
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🧪 TEST GENERATE BUTTON
        </button>
      </div>
    </div>
  )
}