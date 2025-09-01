// src/app/dashboard/components/EnhancedFormPreview.tsx
import { useState } from 'react'
import { useUser } from '@/contexts'
import FormHeader from './FormHeader'
import FieldList from './FieldList'
import SubmitButtonEditor from './SubmitButtonEditor'
import EnhancedEmptyState from './EnhancedEmptyState'
import { SizeType, SizeConfig, StylingConfig } from '../components/SizeUtilities'
import { FieldExtraction } from '../types'
import styles from './LoadingAnimation.module.css'

// Using CSS modules to override external CSS conflicts

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
}

interface FormSchema {
  title: string
  fields: FormField[]
  formId?: string // Add formId to schema
}

interface FormPreviewProps {
  formSchema: FormSchema | null
  effectiveFormSchema: FormSchema | null
  isLoading: boolean
  hasUnsavedChanges: boolean
  
  // Editing props
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'title' | 'label' | 'placeholder' | 'options' | 'submitButton', fieldId?: string, fieldIndex?: number, optionIndex?: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleRequired: (fieldId: string, required: boolean) => void
  sizeConfig: SizeConfig
  stylingConfig: StylingConfig
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
  onStylingChange: (config: Partial<StylingConfig>) => void
  
  // Submit button text
  submitButtonText: string

  // Enhanced props for save/discard functionality
  onSaveChanges: () => void
  onDiscardChanges: () => void

  // NEW: Publish functionality props
  onPublishForm: () => void
  isPublishing: boolean
  publishedFormId: string | null

  // Example selection prop
  onExampleSelect?: (example: string) => void
  
  // Styling panel state
  isStylingPanelOpen?: boolean
  onStylingPanelToggle?: (isOpen: boolean) => void
  
  // Analysis state props
  isAnalyzing?: boolean
  analysisComplete?: boolean
  onResetAnalysis?: () => void
  extractedFields?: FieldExtraction[]
  onGenerateFormFromFields?: () => void
}

// Analysis progress component for when upload/URL analysis is happening
const AnalysisProgressState = ({ 
  stylingConfig, 
  onResetAnalysis 
}: { 
  stylingConfig: StylingConfig
  onResetAnalysis?: () => void 
}) => (
  <div 
    style={{
      background: stylingConfig.backgroundColor,
      fontFamily: stylingConfig.fontFamily,
      color: stylingConfig.fontColor,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Analysis Progress Animation */}
    <div style={{ textAlign: 'center', maxWidth: '600px' }}>
      {/* Progress Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 32px',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      
      {/* Title */}
      <h2 style={{
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Analyzing your content...
      </h2>
      
      {/* Description */}
      <p style={{
        fontSize: '18px',
        opacity: '0.8',
        marginBottom: '48px',
        lineHeight: '1.6'
      }}>
        We&apos;re extracting form fields from your upload. This usually takes 10-20 seconds.
      </p>
      
      {/* Progress Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '48px'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#8B5CF6',
              animation: `bounce 1.4s ease-in-out infinite both`,
              animationDelay: `${i * 0.16}s`
            }}
          />
        ))}
      </div>
      
      {/* Template Option */}
      <div style={{
        padding: '24px',
        background: 'rgba(139, 92, 246, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '16px',
        marginTop: '32px'
      }}>
        <p style={{
          fontSize: '16px',
          marginBottom: '16px',
          opacity: '0.9'
        }}>
          Want to use a template instead?
        </p>
        <button
          onClick={onResetAnalysis}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Start with a template
        </button>
      </div>
    </div>
    
    <style jsx>{`
      @keyframes pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.05);
          opacity: 0.8;
        }
      }
      
      @keyframes bounce {
        0%, 80%, 100% { 
          transform: scale(0);
        }
        40% { 
          transform: scale(1);
        }
      }
    `}</style>
  </div>
)

// Enhanced loading form animation with purple theme and improved UX
const EnhancedLoadingFormAnimation = ({ stylingConfig }: { stylingConfig: StylingConfig }) => (
  <div 
    className="enhanced-loading-container"
    style={{ 
      background: stylingConfig.backgroundColor,
      fontFamily: stylingConfig.fontFamily,
      color: stylingConfig.fontColor
    }}
  >
    <div className="loading-content">
      {/* Vertical stacked layout */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* Top: Creating... */}
        <div>
          <div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Creating your form...</h3>
            <p style={{ 
              fontSize: '16px',
              opacity: '0.8',
              margin: '0',
              color: stylingConfig.fontColor 
            }}>
            AI is analyzing your requirements
          </p>
        </div>
      </div>
      
        {/* Middle: Understanding requirements... */}
        <div>
          <div className={styles.loadingAnimationVerticalProgressSteps}>
            <div className={`${styles.progressStepItem} ${styles.completed}`}>
              <div className={`${styles.stepDot} ${styles.stepDotCompleted}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <span>Understanding requirements</span>
            </div>
            <div className={`${styles.progressStepItem} ${styles.active}`}>
              <div className={`${styles.stepDot} ${styles.stepDotActive}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
          </div>
              <span>Generating fields</span>
            </div>
            <div className={`${styles.progressStepItem} ${styles.pending}`} style={{ color: stylingConfig.fontColor }}>
              <div className={`${styles.stepDot} ${styles.stepDotPending}`} style={{ color: stylingConfig.fontColor }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                </svg>
          </div>
              <span>Applying styling</span>
            </div>
          </div>
          
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
            <div className={styles.progressGlow} />
          </div>
        </div>
      </div>
      
      {/* Progressive form preview with contained animations */}
      <div className="animated-form-preview">
        <div className="form-title-animated" />
        
        <div className="form-fields-animated">
          {[1, 2, 3, 4].map((_, index) => (
            <div 
              key={index}
              className="form-field-animated"
              style={{
                animationDelay: `${index * 2500}ms`
              }}
            >
              <div className="field-label-animated" />
              <div className="field-input-animated" />
            </div>
          ))}
        </div>
        
        <div 
          className="form-button-animated"
          style={{
            animationDelay: '10000ms'
          }}
        />
      </div>
    </div>

    <style jsx>{`
      .loading-content {
        max-width: 600px;
        width: 100%;
      }

      .vertical-layout {
        display: flex;
        flex-direction: column;
        gap: 40px;
        align-items: center;
        width: 100%;
      }

      .loading-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0;
      }

      .loading-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #9333ea, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .loading-subtitle {
        font-size: 16px;
        opacity: 0.8;
        margin: 0;
      }

      .progress-section {
        margin-bottom: 40px;
      }

      .progress-steps-vertical {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 30px;
      }

      .progress-step-vertical {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 14px;
        font-weight: 500;
        color: ${stylingConfig.fontColor};
        opacity: 0.4;
        transition: all 0.4s ease;
      }

      .progress-step-vertical.completed {
        opacity: 1;
        color: #10b981;
      }

      .progress-step-vertical.active {
        opacity: 1;
        color: #9333ea;
        transform: scale(1.02);
      }



      .step-dot {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f3f4f6;
        border: 2px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s ease;
        position: relative;
      }

      .step-dot.completed {
        background: #10b981;
        border-color: #10b981;
        color: white;
        animation: checkmarkBounce 0.6s ease-out;
      }

      .step-dot.active {
        background: #9333ea;
        border-color: #9333ea;
        color: white;
        animation: thinkingPulse 2s ease-in-out infinite;
        box-shadow: 0 0 20px rgba(147, 51, 234, 0.4);
      }

      .progress-bar {
        height: 8px;
        background: #f3f4f6;
        border-radius: 4px;
        overflow: hidden;
        margin: 0 auto;
        max-width: 400px;
        position: relative;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #9333ea, #7c3aed, #9333ea);
        border-radius: 4px;
        animation: progressFlow 18s ease-in-out infinite;
        position: relative;
        animation: thinkingPulse 3s ease-in-out infinite;
      }

      .progress-glow {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: glowFlow 2s ease-in-out infinite;
      }

      .animated-form-preview {
        display: flex;
        flex-direction: column;
        gap: 28px;
        align-items: center;
        max-width: 450px;
        margin: 0 auto;
        overflow: hidden;
        position: relative;
      }

      .form-title-animated {
        width: 240px;
        height: 36px;
        background: linear-gradient(90deg, #9333ea20, #7c3aed20, #9333ea20);
        border-radius: 8px;
        animation: formBuild 4s ease-in-out infinite;
        border: 1px solid rgba(147, 51, 234, 0.2);
      }

      .form-fields-animated {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .form-field-animated {
        animation: fieldAppear 1.5s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
        width: 100%;
        max-width: 100%;
      }

      .field-label-animated {
        width: 140px;
        height: 18px;
        background: linear-gradient(90deg, #9333ea15, #7c3aed15);
        border-radius: 4px;
        margin-bottom: 10px;
        animation: formBuild 4s ease-in-out infinite;
        border: 1px solid rgba(147, 51, 234, 0.1);
      }

      .field-input-animated {
        width: 100%;
        height: 44px;
        background: linear-gradient(90deg, #f8fafc, #f1f5f9);
        border: 2px solid rgba(147, 51, 234, 0.2);
        border-radius: 8px;
        animation: formBuild 4s ease-in-out infinite;
        position: relative;
        overflow: hidden;
        max-width: 100%;
        box-sizing: border-box;
      }

      .field-input-animated::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.1), transparent);
        animation: shimmerFlow 4s ease-in-out infinite;
      }

      .form-button-animated {
        width: 160px;
        height: 48px;
        background: linear-gradient(135deg, #9333ea, #7c3aed);
        border-radius: 8px;
        animation: buttonPulse 4s ease-in-out infinite;
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
      }

      @keyframes thinkingPulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }



      @keyframes checkmarkBounce {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      @keyframes progressFlow {
        0% { width: 0%; }
        30% { width: 40%; }
        70% { width: 85%; }
        100% { width: 100%; }
      }

      @keyframes glowFlow {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes fieldAppear {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes formBuild {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }

      @keyframes shimmerFlow {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes buttonPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3); }
        50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(147, 51, 234, 0.5); }
      }
    `}</style>
  </div>
)

// IMPROVED: Publish Section Component - Simple & Clean
const PublishSection = ({
  formSchema,
  hasUnsavedChanges,
  isPublishing,
  publishedFormId,
  onPublishForm,
  isAnonymous
}: {
  formSchema: FormSchema | null
  hasUnsavedChanges: boolean
  isPublishing: boolean
  publishedFormId: string | null
  onPublishForm: () => void
  isAnonymous: boolean
}) => {
  const [copySuccess, setCopySuccess] = useState(false)

  if (!formSchema) return null

  // Determine the current publication state
  const currentFormId = publishedFormId || formSchema.formId
  const isPublished = !!currentFormId
  const needsUpdate = isPublished && hasUnsavedChanges

  // Copy URL to clipboard
  const handleCopyURL = async () => {
    if (currentFormId) {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/forms/${currentFormId}`)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  // Enhanced status logic - simplified
  const getStatusText = () => {
    if (!isPublished) return 'Draft'
    if (needsUpdate) return 'Live • Update pending'
    return 'Live • Up to date'
  }

  const getStatusColor = () => {
    if (!isPublished) return '#6b7280'
    if (needsUpdate) return '#f59e0b'
    return '#059669'
  }

  return (
    <div className="simple-publish-section">
      {/* Status & Action */}
      <div className="publish-header">
        <div className="status-text" style={{ color: getStatusColor() }}>
          {needsUpdate ? '⚡' : isPublished ? '✅' : '📝'} {getStatusText()}
        </div>
      </div>

      {/* Compact Publish Button */}
      {isAnonymous ? (
        <button
          onClick={() => {
            // Show authentication prompt
            alert('Please sign up or sign in to publish your forms. Your forms will be saved when you create an account.')
          }}
          className="compact-publish-btn auth-required"
          title="Sign up or sign in to publish your forms"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Sign Up to Publish</span>
        </button>
      ) : (
        <button
          onClick={onPublishForm}
          disabled={isPublishing}
          className={`compact-publish-btn ${needsUpdate ? 'update-mode' : 'publish-mode'}`}
          title={needsUpdate ? 'Update the live form with your changes' : 'Publish your form to make it live'}
        >
          {isPublishing ? (
            <>
              <div className="publish-spinner" />
              <span>Publishing...</span>
            </>
          ) : needsUpdate ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              <span>Update Live</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
              <span>{isPublished ? 'Republish' : 'Publish'}</span>
            </>
          )}
        </button>
      )}

      {/* Compact Form URL Display */}
      {currentFormId && (
        <div className="compact-url-section">
          <div className="url-display">
            <div className="url-content">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <span className="url-text">/forms/{currentFormId}</span>
            </div>
            
            <div className="url-actions">
              <button
                onClick={handleCopyURL}
                className={`url-action-btn ${copySuccess ? 'success' : ''}`}
                title="Copy URL"
              >
                {copySuccess ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </button>
              
              <a 
                href={`/forms/${currentFormId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="url-action-btn"
                title="Open form"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 7h10v10"/>
                  <path d="M7 17L17 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FormPreview({
  formSchema,
  effectiveFormSchema,
  isLoading,
  hasUnsavedChanges,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleRequired,
  sizeConfig,
  stylingConfig,
  onSizeChange,
  onStylingChange,
  submitButtonText,
  onSaveChanges,
  onDiscardChanges,
  onPublishForm,
  isPublishing,
  publishedFormId,
  onExampleSelect,
  isStylingPanelOpen,
  onStylingPanelToggle,
  isAnalyzing,
  analysisComplete,
  onResetAnalysis,
  extractedFields,
  onGenerateFormFromFields
}: FormPreviewProps) {
  const { isAuthenticated, isAnonymous } = useUser()
  
  // Handle individual radio option editing
  const handleRadioOptionEdit = (fieldId: string, optionIndex: number) => {
    const fieldIndex = effectiveFormSchema?.fields.findIndex(f => f.id === fieldId) ?? -1
    onStartEditing('options', fieldId, fieldIndex, optionIndex)
  }

  return (
    <div className="enhanced-form-preview-panel">
      {/* Compact Header with Progress Tracker on Same Line */}
      <div className="enhanced-form-preview-header">
        <div className="header-main-content">
          <div className="header-left">
            <h1 className="preview-title">Form Preview</h1>
            {hasUnsavedChanges && (
              <div className="unsaved-indicator">
                <div className="indicator-dot" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
          
          {/* Progress indicator moved to same line as title */}
          {formSchema && (
            <div className="form-progress">
              <div className="progress-item completed">
                <div className="progress-dot">✓</div>
                <span>Generated</span>
              </div>
              <div className="progress-connector" />
              <div className={`progress-item ${hasUnsavedChanges ? 'pending' : 'completed'}`}>
                <div className="progress-dot">{hasUnsavedChanges ? '⚡' : '✓'}</div>
                <span>Customized</span>
              </div>
              <div className="progress-connector" />
              <div className={`progress-item ${publishedFormId || formSchema.formId ? 'completed' : 'pending'}`}>
                <div className="progress-dot">🚀</div>
                <span>Published</span>
              </div>
            </div>
          )}
          
          {/* Form Actions - Save/Discard moved here from chat input */}
          {hasUnsavedChanges && (
            <div className="form-actions">
              <button 
                onClick={onSaveChanges}
                className="header-save-btn"
                title="Save changes to form"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17,21 17,13 7,13 7,21"/>
                  <polyline points="7,3 7,8 15,8"/>
                </svg>
                <span>Save Changes</span>
              </button>
              
              <button 
                onClick={onDiscardChanges}
                className="header-discard-btn"
                title="Discard unsaved changes"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                <span>Discard Changes</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Compact Publish Section */}
        <PublishSection
          formSchema={formSchema}
          hasUnsavedChanges={hasUnsavedChanges}
          isPublishing={isPublishing}
          publishedFormId={publishedFormId}
          onPublishForm={onPublishForm}
          isAnonymous={isAnonymous}
        />
      </div>
      
      {/* Form Container */}
      <div className="enhanced-form-preview-container">
        {/* Loading State */}
        {isLoading && (
          <div className="enhanced-form-preview-card">
            <EnhancedLoadingFormAnimation stylingConfig={stylingConfig} />
          </div>
        )}
        
        {/* Actual Form Preview */}
        {!isLoading && (
          <div 
            className="enhanced-form-preview-card style-transition"
            style={{ 
              background: stylingConfig.backgroundColor,
              fontFamily: stylingConfig.fontFamily,
              color: stylingConfig.fontColor
            }}
          >
            <div className="form-content">
              {formSchema ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Form Header with Global Controls */}
                  <FormHeader
                    title={effectiveFormSchema?.title || formSchema.title}
                    sizeConfig={sizeConfig}
                    stylingConfig={stylingConfig}
                    hasUnsavedChanges={hasUnsavedChanges}
                    editingField={editingField}
                    editValue={editValue}
                    onEditValueChange={onEditValueChange}
                    onStartEditing={onStartEditing}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    onSizeChange={onSizeChange}
                    onStylingChange={onStylingChange}
                    onStylingPanelToggle={onStylingPanelToggle}
                  />
                  
                  {/* Field List */}
                  {effectiveFormSchema?.fields && (
                    <FieldList
                      fields={effectiveFormSchema.fields}
                      sizeConfig={sizeConfig}
                      stylingConfig={stylingConfig}
                      editingField={editingField}
                      editValue={editValue}
                      onEditValueChange={onEditValueChange}
                      onStartEditing={onStartEditing}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onToggleRequired={onToggleRequired}
                      onSizeChange={onSizeChange}
                      onRadioOptionEdit={handleRadioOptionEdit}
                    />
                  )}
                  
                  {/* Submit Button Editor */}
                  <SubmitButtonEditor
                    submitButtonText={submitButtonText}
                    globalSize={sizeConfig.globalFontSize}
                    stylingConfig={stylingConfig}
                    editingField={editingField}
                    editValue={editValue}
                    onEditValueChange={onEditValueChange}
                    onStartEditing={onStartEditing}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                  />
                </div>
              ) : isAnalyzing ? (
                // Show analysis progress instead of templates
                <AnalysisProgressState 
                  stylingConfig={stylingConfig}
                  onResetAnalysis={onResetAnalysis}
                />
              ) : (
                // Enhanced Empty state with better engagement (only when not analyzing)
                <EnhancedEmptyState 
                  stylingConfig={stylingConfig}
                  onExampleClick={onExampleSelect}
                  analysisComplete={analysisComplete}
                  extractedFields={extractedFields}
                  onGenerateFormFromFields={onGenerateFormFromFields}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}