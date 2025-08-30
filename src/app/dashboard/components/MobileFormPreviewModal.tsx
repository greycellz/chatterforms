import React from 'react'
import styles from '../styles/MobileFormPreviewModal.module.css'

interface FormSchema {
  id?: string
  formId?: string
  title: string
  fields: FormField[]
  styling?: {
    backgroundColor?: string
    fontFamily?: string
    fontSize?: string
    color?: string
    borderRadius?: string
    padding?: string
    margin?: string
  }
}

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: string[]
  confidence?: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
  additionalContext?: string
}

interface MobileFormPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  formSchema: FormSchema | null
  onPublish: () => void
  onCustomize: () => void
  isPublishing: boolean
  publishedFormId?: string
  hasUnsavedChanges?: boolean
}

export default function MobileFormPreviewModal({
  isOpen,
  onClose,
  formSchema,
  onPublish,
  onCustomize: _onCustomize,
  isPublishing,
  publishedFormId,
  hasUnsavedChanges = false
}: MobileFormPreviewModalProps) {

  if (!isOpen || !formSchema) return null

  const handleCustomize = () => {
    // TODO: Implement mobile styling panel
    alert('Customize functionality coming soon to mobile!')
    // setIsCustomizing(true)
    // onCustomize()
  }

  const handlePublish = () => {
    const currentFormId = publishedFormId || formSchema?.formId
    const isPublished = !!currentFormId
    const needsUpdate = isPublished && hasUnsavedChanges
    
    if (needsUpdate) {
      // Publish changes
      onPublish()
    } else if (isPublished) {
      // View form - open in new tab
      window.open(`/forms/${currentFormId}`, '_blank')
    } else {
      // First publish
      onPublish()
    }
  }

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.id}`
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={fieldId} className={styles.formField}>
            <label htmlFor={fieldId} className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type={field.type}
              id={fieldId}
              placeholder={field.placeholder}
              className={styles.fieldInput}
              disabled
            />
          </div>
        )
      
      case 'textarea':
        return (
          <div key={fieldId} className={styles.formField}>
            <label htmlFor={fieldId} className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <textarea
              id={fieldId}
              placeholder={field.placeholder}
              className={styles.fieldTextarea}
              rows={3}
              disabled
            />
          </div>
        )
      
      case 'date':
        return (
          <div key={fieldId} className={styles.formField}>
            <label htmlFor={fieldId} className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="date"
              id={fieldId}
              className={styles.fieldInput}
              disabled
            />
          </div>
        )
      
      case 'radio':
        return (
          <div key={fieldId} className={styles.formField}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.radioGroup}>
              {field.options?.map((option: string, index: number) => (
                <label key={index} className={styles.radioOption}>
                  <input
                    type="radio"
                    name={fieldId}
                    value={option}
                    disabled
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )
      
      case 'checkbox-group':
        return (
          <div key={fieldId} className={styles.formField}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.checkboxGroup}>
              {field.options?.map((option: string, index: number) => (
                <label key={index} className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    value={option}
                    disabled
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )
      
      case 'checkbox-with-other':
        return (
          <div key={fieldId} className={styles.formField}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.checkboxGroup}>
              {field.options?.map((option: string, index: number) => (
                <label key={index} className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    value={option}
                    disabled
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxLabel}>{option}</span>
                </label>
              ))}
              {field.allowOther && (
                <div className={styles.otherOption}>
                  <label className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      disabled
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxLabel}>{field.otherLabel || 'Other:'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={field.otherPlaceholder}
                    className={styles.otherInput}
                    disabled
                  />
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <div key={fieldId} className={styles.formField}>
            <label htmlFor={fieldId} className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              placeholder={field.placeholder}
              className={styles.fieldInput}
              disabled
            />
          </div>
        )
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Form Preview</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Action Buttons - Moved to top */}
        <div className={styles.modalActions}>
          {/* TODO: Implement mobile styling panel - commented out for now
          <button
            className={styles.customizeButton}
            onClick={handleCustomize}
            disabled={isPublishing}
          >
            <span className={styles.buttonIcon}>🎨</span>
            Customize
          </button>
          */}
          
          {/* Debug logging for button state */}
          {(() => {
            // Use the same logic as desktop version
            const currentFormId = publishedFormId || formSchema?.formId
            const isPublished = !!currentFormId
            const needsUpdate = isPublished && hasUnsavedChanges
            
            console.log('🔍 MobileFormPreviewModal Button Debug:', {
              publishedFormId,
              currentFormId,
              isPublished,
              hasUnsavedChanges,
              needsUpdate,
              isPublishing,
              buttonText: needsUpdate ? 'Update Form' : (isPublished ? 'Republish Form' : 'Publish Form')
            })
            return null
          })()}
          
          {/* Always show a button - no conditional View Form */}
          <button
            className={styles.publishButton}
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <span className={styles.buttonIcon}>
              {isPublishing ? '⏳' : '🚀'}
            </span>
            {isPublishing ? 'Publishing...' : (() => {
              const currentFormId = publishedFormId || formSchema?.formId
              const isPublished = !!currentFormId
              const needsUpdate = isPublished && hasUnsavedChanges
              return needsUpdate ? 'Publish Form' : (isPublished ? 'View Form' : 'Publish Form')
            })()}
          </button>
          

        </div>

        {/* Form Preview */}
        <div className={styles.formPreview}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{formSchema.title}</h2>
            
            <div className={styles.formFields}>
              {formSchema.fields?.map((field: FormField) => renderField(field))}
            </div>

            {/* Submit Button */}
            <button className={styles.submitButton} disabled>
              Submit Form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
