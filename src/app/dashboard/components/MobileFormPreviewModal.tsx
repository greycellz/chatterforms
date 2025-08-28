import React, { useState } from 'react'
import styles from '../styles/MobileFormPreviewModal.module.css'

interface FormSchema {
  id?: string
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
}

export default function MobileFormPreviewModal({
  isOpen,
  onClose,
  formSchema,
  onPublish,
  onCustomize,
  isPublishing,
  publishedFormId
}: MobileFormPreviewModalProps) {
  const [isCustomizing, setIsCustomizing] = useState(false)

  if (!isOpen || !formSchema) return null

  const handleCustomize = () => {
    setIsCustomizing(true)
    onCustomize()
  }

  const handlePublish = () => {
    onPublish()
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

        {/* Action Buttons */}
        <div className={styles.modalActions}>
          <button
            className={styles.customizeButton}
            onClick={handleCustomize}
            disabled={isPublishing}
          >
            <span className={styles.buttonIcon}>🎨</span>
            Customize
          </button>
          
          {publishedFormId ? (
                         <a
               href={`/forms/${publishedFormId}`}
               target="_blank"
               rel="noopener noreferrer"
               className={styles.viewButton}
             >
               <span className={styles.buttonIcon}>
                 <img 
                   src="/orange-arrow.png" 
                   alt="View" 
                   style={{ width: '48px', height: '48px' }}
                 />
               </span>
               View Form
             </a>
          ) : (
            <button
              className={styles.publishButton}
              onClick={handlePublish}
              disabled={isPublishing}
            >
              <span className={styles.buttonIcon}>
                {isPublishing ? '⏳' : '🚀'}
              </span>
              {isPublishing ? 'Publishing...' : 'Publish Form'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
