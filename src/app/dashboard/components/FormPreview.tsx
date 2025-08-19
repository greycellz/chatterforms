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

// Enhanced loading form animation with new styling
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
      {/* Enhanced loading header */}
      <div className="loading-header">
        <div className="loading-icon">🎨</div>
        <div className="loading-text">
          <h3 className="loading-title">Creating your form...</h3>
          <p className="loading-subtitle">AI is analyzing your requirements</p>
        </div>
      </div>
      
      {/* Enhanced progress indicator */}
      <div className="loading-progress">
        <div className="progress-steps">
          <div className="progress-step active">
            <div className="step-dot">✓</div>
            <span>Understanding requirements</span>
          </div>
          <div className="progress-step active">
            <div className="step-dot">⚡</div>
            <span>Generating fields</span>
          </div>
          <div className="progress-step">
            <div className="step-dot">🎨</div>
            <span>Applying styling</span>
          </div>
        </div>
        
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
      </div>
      
      {/* Skeleton content with staggered animation */}
      <div className="skeleton-form">
        <div className="skeleton-title" />
        
        <div className="skeleton-fields">
          {[1, 2, 3, 4].map((_, index) => (
            <div 
              key={index}
              className="skeleton-field"
              style={{
                animationDelay: `${index * 200}ms`,
                opacity: 1 - (index * 0.2)
              }}
            >
              <div className="skeleton-label" />
              <div className="skeleton-input" />
            </div>
          ))}
        </div>
        
        <div className="skeleton-button" style={{ backgroundColor: stylingConfig.buttonColor }} />
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
        max-width: 500px;
        width: 100%;
      }

      .loading-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 40px;
      }

      .loading-icon {
        font-size: 48px;
        animation: pulse 2s ease-in-out infinite;
      }

      .loading-text {
        text-align: left;
      }

      .loading-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
        color: ${stylingConfig.fontColor};
      }

      .loading-subtitle {
        font-size: 14px;
        color: ${stylingConfig.fontColor};
        opacity: 0.7;
        margin: 0;
      }

      .loading-progress {
        margin-bottom: 40px;
      }

      .progress-steps {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-bottom: 20px;
      }

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: ${stylingConfig.fontColor};
        opacity: 0.5;
        transition: opacity 0.3s ease;
      }

      .progress-step.active {
        opacity: 1;
      }

      .step-dot {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${stylingConfig.buttonColor}20;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .progress-step.active .step-dot {
        background: ${stylingConfig.buttonColor};
        color: white;
      }

      .progress-bar {
        height: 4px;
        background: ${stylingConfig.fontColor}20;
        border-radius: 2px;
        overflow: hidden;
        margin: 0 auto;
        max-width: 300px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, ${stylingConfig.buttonColor}, ${stylingConfig.buttonColor}cc);
        border-radius: 2px;
        animation: progressFlow 3s ease-in-out infinite;
      }

      @keyframes progressFlow {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
      }

      .skeleton-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: center;
      }

      .skeleton-title {
        width: 200px;
        height: 32px;
        background: ${stylingConfig.fontColor}15;
        border-radius: 8px;
        animation: shimmer 1.5s ease-in-out infinite;
      }

      .skeleton-fields {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .skeleton-field {
        animation: fadeInUp 0.5s ease-out forwards;
        opacity: 0;
      }

      .skeleton-label {
        width: 120px;
        height: 16px;
        background: ${stylingConfig.fontColor}15;
        border-radius: 4px;
        margin-bottom: 8px;
        animation: shimmer 1.5s ease-in-out infinite;
      }

      .skeleton-input {
        width: 100%;
        height: 40px;
        background: ${stylingConfig.fontColor}10;
        border: 1px solid ${stylingConfig.fontColor}20;
        border-radius: 8px;
        animation: shimmer 1.5s ease-in-out infinite;
      }

      .skeleton-button {
        width: 140px;
        height: 44px;
        border-radius: 8px;
        opacity: 0.4;
        animation: shimmer 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }

      @keyframes shimmer {
        0% { opacity: 0.5; }
        50% { opacity: 0.8; }
        100% { opacity: 0.5; }
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
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