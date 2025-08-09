import FormHeader from './FormHeader'
import FieldList from './FieldList'
import SubmitButtonEditor from './SubmitButtonEditor'
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
}

// Loading form animation with new styling
const LoadingFormAnimation = ({ stylingConfig }: { stylingConfig: StylingConfig }) => (
  <div 
    className="form-preview-card loading-animation"
    style={{ 
      background: stylingConfig.backgroundColor,
      fontFamily: stylingConfig.fontFamily,
      color: stylingConfig.fontColor
    }}
  >
    <div className="form-content">
      {/* Loading indicator */}
      <div className="loading-container" style={{ marginBottom: '32px' }}>
        <div className="loading-content">
          <div className="loading-spinner" />
          <span style={{ color: 'rgba(139, 92, 246, 0.9)' }}>
            Generating your form...
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
      </div>
      
      {/* Skeleton content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ 
          width: '200px', 
          height: '32px', 
          background: 'rgba(139, 92, 246, 0.1)', 
          borderRadius: '8px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
      
      {/* Progressive field loading */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[1, 2, 3, 4].map((_, index) => (
          <div 
            key={index}
            style={{
              opacity: 1 - (index * 0.2),
              animationDelay: `${index * 200}ms`
            }}
          >
            <div style={{ 
              width: `${120 + (index * 20)}px`, 
              height: '16px', 
              background: 'rgba(139, 92, 246, 0.15)', 
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{ 
              width: '100%', 
              height: '40px', 
              background: 'rgba(139, 92, 246, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        ))}
      </div>
      
      {/* Submit button skeleton */}
      <div style={{
        width: '140px',
        height: '44px',
        background: stylingConfig.buttonColor,
        opacity: 0.4,
        borderRadius: '8px',
        marginTop: '32px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
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
  submitButtonText
}: FormPreviewProps) {
  
  // Handle individual radio option editing
  const handleRadioOptionEdit = (fieldId: string, optionIndex: number) => {
    const fieldIndex = effectiveFormSchema?.fields.findIndex(f => f.id === fieldId) ?? -1
    onStartEditing('options', fieldId, fieldIndex, optionIndex)
  }

  return (
    <div className="form-preview-panel">
      {/* Header */}
      <div className="form-preview-header">
        <h1 className="form-preview-title">Form Preview</h1>
        {hasUnsavedChanges && (
          <div style={{
            background: 'rgba(251, 146, 60, 0.1)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            color: '#f59e0b',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Unsaved changes
          </div>
        )}
      </div>
      
      {/* Form Container */}
      <div className="form-preview-container">
        {/* Loading State */}
        {isLoading && (
          <LoadingFormAnimation stylingConfig={stylingConfig} />
        )}
        
        {/* Actual Form Preview */}
        {!isLoading && (
          <div 
            className="form-preview-card style-transition"
            style={{ 
              background: stylingConfig.backgroundColor, // ← FIXED: Apply background here
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
                // Empty state with proper styling inheritance
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 40px',
                  color: stylingConfig.fontColor,
                  opacity: 0.7
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>
                    📋
                  </div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: stylingConfig.fontColor,
                    marginBottom: '12px' 
                  }}>
                    Ready to create your form
                  </h3>
                  <p style={{ 
                    color: stylingConfig.fontColor,
                    opacity: 0.6,
                    maxWidth: '400px', 
                    margin: '0 auto',
                    lineHeight: 1.6
                  }}>
                    Describe what kind of form you need, or upload an image of an existing form to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add CSS for transitions */}
      <style jsx>{`
        .style-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .loading-animation .loading-dot {
          width: 6px;
          height: 6px;
          background: rgba(139, 92, 246, 0.7);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loading-animation .loading-dot:nth-child(1) { animation-delay: 0s; }
        .loading-animation .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-animation .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}