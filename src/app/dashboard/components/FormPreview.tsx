import FormHeader from './FormHeader'
import FieldList from './FieldList'
import SubmitButtonEditor from './SubmitButtonEditor'
import EnhancedEmptyState from './EnhancedEmptyState'
import { SizeType, SizeConfig, StylingConfig } from '../components/SizeUtilities'

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

  // New prop for example selection
  onExampleSelect?: (example: string) => void
}

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
      {/* Enhanced loading header with better visual hierarchy */}
      <div className="loading-header">
        <div className="loading-icon-container">
          <div className="loading-icon">✨</div>
          <div className="icon-glow" />
        </div>
        <div className="loading-text">
          <h3 className="loading-title">Creating your form...</h3>
          <p className="loading-subtitle">AI is analyzing your requirements</p>
        </div>
      </div>
      
      {/* Enhanced progress indicator with purple theme */}
      <div className="loading-progress">
        <div className="progress-steps">
          <div className="progress-step completed">
            <div className="step-dot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <span>Understanding requirements</span>
          </div>
          <div className="progress-step active">
            <div className="step-dot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span>Generating fields</span>
          </div>
          <div className="progress-step">
            <div className="step-dot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
            </div>
            <span>Applying styling</span>
          </div>
        </div>
        
        <div className="progress-bar">
          <div className="progress-fill" />
          <div className="progress-glow" />
        </div>
      </div>
      
      {/* Animated form preview that builds progressively */}
      <div className="animated-form-preview">
        <div className="form-title-animated" />
        
        <div className="form-fields-animated">
          {[1, 2, 3, 4].map((_, index) => (
            <div 
              key={index}
              className="form-field-animated"
              style={{
                animationDelay: `${index * 300}ms`
              }}
            >
              <div className="field-label-animated" />
              <div className="field-input-animated" />
            </div>
          ))}
        </div>
        
        <div className="form-button-animated" />
      </div>
    </div>

    <style jsx>{`
      .enhanced-loading-container {
        padding: 60px 40px;
        text-align: center;
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loading-content {
        max-width: 600px;
        width: 100%;
      }

      .loading-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        margin-bottom: 50px;
      }

      .loading-icon-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loading-icon {
        font-size: 56px;
        animation: magicPulse 3s ease-in-out infinite;
        z-index: 2;
        position: relative;
      }

      .icon-glow {
        position: absolute;
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        animation: glowPulse 3s ease-in-out infinite;
      }

      .loading-text {
        text-align: left;
      }

      .loading-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        color: ${stylingConfig.fontColor};
        background: linear-gradient(135deg, #9333ea, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .loading-subtitle {
        font-size: 16px;
        color: ${stylingConfig.fontColor};
        opacity: 0.8;
        margin: 0;
      }

      .loading-progress {
        margin-bottom: 50px;
      }

      .progress-steps {
        display: flex;
        justify-content: center;
        gap: 32px;
        margin-bottom: 30px;
      }

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        color: ${stylingConfig.fontColor};
        opacity: 0.4;
        transition: all 0.4s ease;
      }

      .progress-step.completed {
        opacity: 1;
        color: #10b981;
      }

      .progress-step.active {
        opacity: 1;
        color: #9333ea;
        transform: scale(1.05);
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

      .progress-step.completed .step-dot {
        background: #10b981;
        border-color: #10b981;
        color: white;
        animation: checkmarkBounce 0.6s ease-out;
      }

      .progress-step.active .step-dot {
        background: #9333ea;
        border-color: #9333ea;
        color: white;
        animation: activePulse 2s ease-in-out infinite;
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
        animation: progressFlow 4s ease-in-out infinite;
        position: relative;
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
      }

      .form-title-animated {
        width: 240px;
        height: 36px;
        background: linear-gradient(90deg, #9333ea20, #7c3aed20, #9333ea20);
        border-radius: 8px;
        animation: formBuild 2s ease-in-out infinite;
        border: 1px solid rgba(147, 51, 234, 0.2);
      }

      .form-fields-animated {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .form-field-animated {
        animation: fieldAppear 0.8s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
      }

      .field-label-animated {
        width: 140px;
        height: 18px;
        background: linear-gradient(90deg, #9333ea15, #7c3aed15);
        border-radius: 4px;
        margin-bottom: 10px;
        animation: formBuild 2s ease-in-out infinite;
        border: 1px solid rgba(147, 51, 234, 0.1);
      }

      .field-input-animated {
        width: 100%;
        height: 44px;
        background: linear-gradient(90deg, #f8fafc, #f1f5f9);
        border: 2px solid rgba(147, 51, 234, 0.2);
        border-radius: 8px;
        animation: formBuild 2s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }

      .field-input-animated::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.1), transparent);
        animation: shimmerFlow 2s ease-in-out infinite;
      }

      .form-button-animated {
        width: 160px;
        height: 48px;
        background: linear-gradient(135deg, #9333ea, #7c3aed);
        border-radius: 8px;
        animation: buttonPulse 2s ease-in-out infinite;
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
      }

      @keyframes magicPulse {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(5deg); }
        50% { transform: scale(1.05) rotate(-3deg); }
        75% { transform: scale(1.15) rotate(2deg); }
      }

      @keyframes glowPulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.2); }
      }

      @keyframes activePulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(147, 51, 234, 0.4); }
        50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(147, 51, 234, 0.6); }
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
  onExampleSelect
}: FormPreviewProps) {
  
  // Handle individual radio option editing
  const handleRadioOptionEdit = (fieldId: string, optionIndex: number) => {
    const fieldIndex = effectiveFormSchema?.fields.findIndex(f => f.id === fieldId) ?? -1
    onStartEditing('options', fieldId, fieldIndex, optionIndex)
  }

  return (
    <div className="enhanced-form-preview-panel">
      {/* Enhanced Header with better visual hierarchy */}
      <div className="enhanced-form-preview-header">
        <div className="header-content">
          <h1 className="preview-title">Form Preview</h1>
          {hasUnsavedChanges && (
            <div className="unsaved-indicator">
              <div className="indicator-dot" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
        
        {/* Progress indicator when form exists */}
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
            <div className="progress-item">
              <div className="progress-dot">🚀</div>
              <span>Publish</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Form Container */}
      <div className="enhanced-form-preview-container">
        {/* Loading State */}
        {isLoading && (
          <div className="form-preview-card">
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
              ) : (
                // Enhanced Empty state with better engagement
                <EnhancedEmptyState 
                  stylingConfig={stylingConfig}
                  onExampleClick={onExampleSelect}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced CSS Styles */}
      <style jsx>{`
        .enhanced-form-preview-panel {
          flex: 1;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .enhanced-form-preview-header {
          padding: 24px 40px 20px;
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(20px);
          position: relative;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .preview-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .unsaved-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(251, 146, 60, 0.1);
          border: 1px solid rgba(251, 146, 60, 0.3);
          color: #f59e0b;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .indicator-dot {
          width: 6px;
          height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .form-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0.8;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .progress-item.completed {
          color: #059669;
        }

        .progress-item.pending {
          color: #f59e0b;
        }

        .progress-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .progress-item.completed .progress-dot {
          background: #059669;
          color: white;
        }

        .progress-item.pending .progress-dot {
          background: #f59e0b;
          color: white;
        }

        .progress-connector {
          width: 32px;
          height: 1px;
          background: #e2e8f0;
          margin: 0 8px;
        }

        .enhanced-form-preview-container {
          flex: 1;
          padding: 32px 40px 40px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow-y: auto;
          position: relative;
        }

        .enhanced-form-preview-card {
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 800px;
          position: relative;
          
          /* Enhanced 3D Effect */
          box-shadow: 
            0 32px 64px rgba(0, 0, 0, 0.12),
            0 16px 32px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04);
          
          transform: perspective(1200px) rotateX(1deg);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .enhanced-form-preview-card:hover {
          transform: perspective(1200px) rotateX(0deg) translateY(-8px);
          box-shadow: 
            0 48px 96px rgba(0, 0, 0, 0.16),
            0 24px 48px rgba(0, 0, 0, 0.12),
            0 12px 24px rgba(0, 0, 0, 0.08);
        }

        /* Enhanced glassmorphic overlay */
        .enhanced-form-preview-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(255, 255, 255, 0.03) 50%, 
            rgba(0, 0, 0, 0.01) 100%);
          border-radius: 22px;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .enhanced-form-preview-card:hover::before {
          opacity: 0.7;
        }

        /* Form content styling */
        .form-content {
          position: relative;
          z-index: 2;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .enhanced-form-preview-container {
            padding: 24px 20px;
          }
          
          .enhanced-form-preview-card {
            padding: 32px 24px;
          }

          .enhanced-form-preview-header {
            padding: 20px 24px 16px;
          }

          .preview-title {
            font-size: 20px;
          }

          .form-progress {
            display: none; /* Hide on mobile for space */
          }
        }

        @media (max-width: 768px) {
          .enhanced-form-preview-container {
            padding: 16px;
          }
          
          .enhanced-form-preview-card {
            padding: 24px 20px;
            transform: none;
            border-radius: 16px;
          }
          
          .enhanced-form-preview-card:hover {
            transform: translateY(-4px);
          }

          .enhanced-form-preview-header {
            padding: 16px 20px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .preview-title {
            font-size: 18px;
          }
        }

        /* Smooth transitions for style changes */
        .style-transition {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .style-transition * {
          transition: 
            color 0.3s ease, 
            background-color 0.3s ease, 
            border-color 0.3s ease,
            font-family 0.3s ease;
        }

        /* Enhanced scrollbar */
        .enhanced-form-preview-container::-webkit-scrollbar {
          width: 8px;
        }

        .enhanced-form-preview-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        .enhanced-form-preview-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .enhanced-form-preview-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        /* Focus improvements for accessibility */
        .enhanced-form-preview-card:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 4px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .enhanced-form-preview-card {
            border-width: 3px;
            border-color: #000000;
          }
          
          .enhanced-form-preview-header {
            border-bottom-width: 2px;
            border-bottom-color: #000000;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-form-preview-card,
          .style-transition,
          .indicator-dot {
            transition: none;
            animation: none;
          }
          
          .enhanced-form-preview-card {
            transform: none;
          }
          
          .enhanced-form-preview-card:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}