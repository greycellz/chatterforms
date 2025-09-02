import React, { useState } from 'react'
import ChatHistory from './ChatHistory'
import AnalysisReview from './AnalysisReview'
import CompactChatInput from './CompactChatInput'
import { FormSchema, ChatMessage, FieldExtraction, PDFPageSelectionResponse } from '../types'
import { useUser } from '@/contexts'

// Import the styles
//import '../styles/compact-chat-input.css'

interface EnhancedChatPanelProps {
  description: string
  onDescriptionChange: (value: string) => void
  formSchema: FormSchema | null
  isLoading: boolean
  onGenerateForm: () => void
  onUpdateForm: () => void
  chatHistory: ChatMessage[]
  hasUnsavedChanges: boolean
  onSaveChanges: () => void
  onDiscardChanges: () => void
  // REMOVED: onPublishForm, isPublishing, publishedFormId (moved to form preview)
  error: string
  
  // File upload functionality props
  uploadedImage: string | null
  uploadedPDF: File | null
  uploadedURL: string | null
  extractedFields: FieldExtraction[]
  isAnalyzing: boolean
  analysisComplete: boolean
  onImageUpload: (imageData: string) => void
  onPDFUpload: (file: File) => void
  onURLSubmit: (url: string) => void
  onAnalyzeImage: (additionalContext?: string) => void
  onAnalyzePDF: (file: File, additionalContext?: string, pageSelection?: { pages: number[], selectAll?: boolean }) => void
  onAnalyzeURL: (url: string, additionalContext?: string) => void
  onFieldsValidated: (fields: FieldExtraction[]) => void
  onResetAnalysis: () => void
  
  // PDF page selection props
  pdfPageSelection?: PDFPageSelectionResponse | null
  onPageSelectionComplete?: (pageSelection: { pages: number[], selectAll?: boolean }) => void
  
  // Form generation from fields
  onGenerateFormFromFields?: (fields: FieldExtraction[]) => void
  
  // Landing page flag to prevent duplicate analysis actions
  isFromLanding?: boolean
}

export default function EnhancedChatPanel({
  description,
  onDescriptionChange,
  formSchema,
  isLoading,
  onGenerateForm,
  onUpdateForm,
  chatHistory,
  hasUnsavedChanges,
  onSaveChanges,
  onDiscardChanges,
  // REMOVED: onPublishForm, isPublishing, publishedFormId
  error,
  uploadedImage,
  uploadedPDF,
  uploadedURL,
  extractedFields,
  isAnalyzing,
  analysisComplete,
  onImageUpload,
  onPDFUpload,
  onURLSubmit,
  onAnalyzeImage,
  onAnalyzePDF,
  onAnalyzeURL,
  onFieldsValidated,
  onResetAnalysis,
  pdfPageSelection,
  onPageSelectionComplete,
  onGenerateFormFromFields,
  isFromLanding
}: EnhancedChatPanelProps) {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const { isAuthenticated, user } = useUser()
  
  // Close menu when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (!target.closest('.workspace-header') && !target.closest('.workspace-menu')) {
      setShowWorkspaceMenu(false)
    }
  }
  
  // Add click outside listener
  React.useEffect(() => {
    if (showWorkspaceMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showWorkspaceMenu])
  
  return (
    <div className="chat-panel-enhanced">
      {/* Workspace Header with Bubble GIF + Form Name + Dropdown */}
      <div className="chat-header-compact">
        <div className="workspace-header">
          <div className="workspace-icon">
            <img 
              src="/chatterforms-bubble-transparent.gif" 
              alt="Bubble animation" 
              style={{
                width: '24px',
                height: '24px',
                verticalAlign: 'middle'
              }}
            />
          </div>
          <div className="workspace-name">
            <span className="form-name">Create New Form</span>
            <button className="dropdown-arrow" onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Workspace Dropdown Menu */}
        {showWorkspaceMenu && (
          <div className="workspace-menu">
            <button className="menu-item" onClick={() => window.location.href = '/'}>
              <span className="menu-icon">🏠</span>
              <span className="menu-text">Back to Landing</span>
            </button>
            <button className="menu-item" onClick={() => {
              if (isAuthenticated && user) {
                // If authenticated, create new form with authenticated user
                console.log('🔑 Creating new form for authenticated user:', user.id)
                // Clear current form and reset to creation mode
                window.location.href = '/dashboard?mode=create&userId=' + user.id
              } else {
                // If not authenticated, go to landing page for anonymous creation
                console.log('👤 User not authenticated, redirecting to landing page')
                window.location.href = '/'
              }
              setShowWorkspaceMenu(false)
            }}>
              <span className="menu-icon">📄</span>
              <span className="menu-text">New Form</span>
              {isAuthenticated && (
                <span className="auth-indicator">🔒</span>
              )}
            </button>
            <div className="menu-divider"></div>
            <button className="menu-item disabled">
              <span className="menu-icon">📁</span>
              <span className="menu-text">My Forms</span>
              <span className="coming-soon">Coming Soon</span>
            </button>
            <button className="menu-item disabled">
              <span className="menu-icon">⚙️</span>
              <span className="menu-text">Settings</span>
              <span className="coming-soon">Coming Soon</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Chat History - Takes up available space with proper scrolling */}
      <div className="chat-content-area">
                        <ChatHistory
                  chatHistory={chatHistory}
                  // Pass analysis functions to ChatHistory for inline actions
                  onAnalyzeImage={onAnalyzeImage}
                  onAnalyzePDF={onAnalyzePDF}
                  onAnalyzeURL={onAnalyzeURL}
                  uploadedImage={uploadedImage}
                  uploadedPDF={uploadedPDF}
                  uploadedURL={uploadedURL}
                  isAnalyzing={isAnalyzing}
                  analysisComplete={analysisComplete}
                  onGenerateFormFromFields={onGenerateFormFromFields}
                  onResetAnalysis={onResetAnalysis}
                  isLoading={isLoading}
                  isFromLanding={isFromLanding}
                />
      </div>
      
      {/* Compact Chat Input - Always at bottom */}
      <div className="chat-input-area">
        <CompactChatInput
          description={description}
          onDescriptionChange={onDescriptionChange}
          formSchema={formSchema}
          isLoading={isLoading}
          onGenerateForm={onGenerateForm}
          onUpdateForm={onUpdateForm}
          // REMOVED: onPublishForm, isPublishing, publishedFormId (moved to form preview)
          error={error}
          uploadedImage={uploadedImage}
          uploadedPDF={uploadedPDF}
          uploadedURL={uploadedURL}
          analysisComplete={analysisComplete}
          onImageUpload={onImageUpload}
          onPDFUpload={onPDFUpload}
          onURLSubmit={onURLSubmit}
          onAnalyzeURL={onAnalyzeURL}
        />
      </div>

      <style jsx>{`
        /* Main Panel Layout - Fixed Height Containers */
        .chat-panel-enhanced {
          width: 33.333%;
          background: rgba(255, 255, 255, 0.08);
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .chat-panel-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }

        /* Compact Header - Reduced height */
        .chat-header-compact {
          padding: 20px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          position: relative !important;
          z-index: 99998 !important;
          flex-shrink: 0;
        }

        .workspace-header {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        
        .workspace-header:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .workspace-icon {
          flex-shrink: 0;
        }
        
        .workspace-name {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        
        .form-name {
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.01em;
        }
        
        .dropdown-arrow {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dropdown-arrow:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .chat-panel-enhanced .chat-header-compact .workspace-menu {
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          width: 50% !important;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          border-radius: 12px !important;
          padding: 8px !important;
          margin-top: 8px !important;
          z-index: 99999 !important;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3) !important;
          animation: slideDown 0.2s ease !important;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          text-align: left;
          font-size: 14px;
          font-weight: 500;
        }
        
        .menu-item:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .menu-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .menu-icon {
          font-size: 16px;
          flex-shrink: 0;
          width: 20px;
          text-align: center;
        }
        
        .menu-text {
          flex: 1;
        }
        
        .coming-soon {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 8px 0;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header-compact::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 100%);
        }

        /* Chat Content Area - Flexible height with proper scrolling */
        .chat-content-area {
          flex: 1;
          position: relative;
          z-index: 2;
          min-height: 0; /* Critical for flex scrolling */
          overflow: hidden;
        }

        /* Compact Input Area - Reduced height */
        .chat-input-area {
          position: relative;
          z-index: 10;
          flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .chat-panel-enhanced {
            width: 100%;
            height: 40vh;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          }

          .chat-header-compact {
            padding: 16px 20px 12px;
          }

          .chat-header-compact h2 {
            font-size: 18px;
          }
        }

        @media (max-width: 768px) {
          .chat-header-compact {
            padding: 12px 16px 10px;
          }

          .chat-header-compact h2 {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}