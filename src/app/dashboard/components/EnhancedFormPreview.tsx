import FormHeader from './FormHeader'
import FieldList from './FieldList'
import SubmitButtonEditor from './SubmitButtonEditor'
import EnhancedEmptyState from './EnhancedEmptyState'
import { SizeType, SizeConfig, StylingConfig } from '../components/SizeUtilities'

// Import the enhanced CSS
import '../styles/enhanced-form-preview.css'

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

  // Enhanced props for save/discard functionality
  onSaveChanges: () => void
  onDiscardChanges: () => void

  // Example selection prop
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
          <h3 className="loading-title" style={{ color: stylingConfig.fontColor }}>
            Creating your form...
          </h3>
          <p className="loading-subtitle" style={{ color: stylingConfig.fontColor }}>
            AI is analyzing your requirements
          </p>
        </div>
      </div>
      
      {/* Enhanced progress indicator */}
      <div className="loading-progress">
        <div className="progress-steps">
          <div className="progress-step active">
            <div className="step-dot" style={{ backgroundColor: `${stylingConfig.buttonColor}20` }}>
              ✓
            </div>
            <span style={{ color: stylingConfig.fontColor }}>Understanding requirements</span>
          </div>
          <div className="progress-step active">
            <div className="step-dot" style={{ backgroundColor: stylingConfig.buttonColor, color: 'white' }}>
              ⚡
            </div>
            <span style={{ color: stylingConfig.fontColor }}>Generating fields</span>
          </div>
          <div className="progress-step">
            <div className="step-dot" style={{ backgroundColor: `${stylingConfig.fontColor}20` }}>
              🎨
            </div>
            <span style={{ color: stylingConfig.fontColor }}>Applying styling</span>
          </div>
        </div>
        
        <div className="progress-bar" style={{ background: `${stylingConfig.fontColor}20` }}>
          <div 
            className="progress-fill" 
            style={{ 
              background: `linear-gradient(90deg, ${stylingConfig.buttonColor}, ${stylingConfig.buttonColor}cc)` 
            }}
          />
        </div>
      </div>
      
      {/* Skeleton content with staggered animation */}
      <div className="skeleton-form">
        <div 
          className="skeleton-title" 
          style={{ background: `${stylingConfig.fontColor}15` }}
        />
        
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
              <div 
                className="skeleton-label" 
                style={{ background: `${stylingConfig.fontColor}15` }}
              />
              <div 
                className="skeleton-input" 
                style={{ 
                  background: `${stylingConfig.fontColor}10`,
                  border: `1px solid ${stylingConfig.fontColor}20`
                }}
              />
            </div>
          ))}
        </div>
        
        <div 
          className="skeleton-button" 
          style={{ backgroundColor: stylingConfig.buttonColor }}
        />
      </div>
    </div>
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
  onSaveChanges,
  onDiscardChanges,
  onExampleSelect
}: FormPreviewProps) {
  
  // Handle individual radio option editing
  const handleRadioOptionEdit = (fieldId: string, optionIndex: number) => {
    const fieldIndex = effectiveFormSchema?.fields.findIndex(f => f.id === fieldId) ?? -1
    onStartEditing('options', fieldId, fieldIndex, optionIndex)
  }

  return (
    <div className="enhanced-form-preview-panel">
      {/* Enhanced Header with Save/Discard Controls */}
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
                <span>Discard</span>
              </button>
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
              <span>Ready to Publish</span>
            </div>
          </div>
        )}
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
    </div>
  )
}