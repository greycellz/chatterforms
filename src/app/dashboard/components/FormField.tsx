import EditableText from './EditableText'
import { getInputSizeClasses, getTextSizeClasses, getFieldContainerClasses, SizeType, StylingConfig } from '../components/SizeUtilities'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
}

interface FormFieldComponentProps {
  field: FormField
  globalSize: SizeType
  stylingConfig: StylingConfig
  // Add editing props to make radio options editable
  onStartEditing?: (fieldType: 'options', fieldId: string, optionIndex: number) => void
  editingField?: string | null
  editValue?: string
  onEditValueChange?: (value: string) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
}

export default function FormField({ 
  field, 
  globalSize,
  stylingConfig,
  onStartEditing,
  editingField,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit
}: FormFieldComponentProps) {
  // Use field-specific size if available, otherwise fall back to global size
  const effectiveSize = field.size || globalSize
  const baseClasses = "border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  const sizeClasses = getInputSizeClasses(effectiveSize)
  const containerClasses = getFieldContainerClasses()

  // Keep input fields white with gray-900 text (as requested)
  const inputStyle = {
    fontFamily: stylingConfig.fontFamily,
    color: '#111827', // gray-900
    backgroundColor: '#ffffff' // white
  }

  switch (field.type) {
    case 'textarea':
      return (
        <div className={containerClasses}>
          <textarea
            key={field.id}
            placeholder={field.placeholder}
            className={`${baseClasses} ${sizeClasses} h-24 resize-none`}
            style={inputStyle}
            required={field.required}
            readOnly
          />
        </div>
      )
    case 'select':
      return (
        <div className={containerClasses}>
          <select 
            key={field.id} 
            className={`${baseClasses} ${sizeClasses}`}
            style={inputStyle}
            required={field.required} 
            disabled
          >
            <option value="">{field.placeholder || 'Choose an option'}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )
    case 'radio':
    case 'radio-with-other':
      return (
        <div key={field.id} className="space-y-2">
          {field.options?.map((option, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <input
                type="radio"
                name={field.id}
                value={option}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 flex-shrink-0"
                required={field.required}
                disabled
              />
              {/* Make each radio option editable if editing props are provided */}
              {onStartEditing && editingField !== undefined ? (
                <EditableText
                  text={option}
                  editKey={`option-${field.id}-${idx}`}
                  className={`text-sm capitalize cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded ${getTextSizeClasses(globalSize, 'label')}`}
                  onStartEdit={() => onStartEditing('options', field.id, idx)}
                  isEditing={editingField === `option-${field.id}-${idx}`}
                  editValue={editValue || ''}
                  onEditValueChange={onEditValueChange || (() => {})}
                  onSave={onSaveEdit || (() => {})}
                  onCancel={onCancelEdit || (() => {})}
                  style={{
                    fontFamily: stylingConfig.fontFamily,
                    color: stylingConfig.fontColor
                  }}
                />
              ) : (
                <span 
                  className={`text-sm capitalize ${getTextSizeClasses(globalSize, 'label')}`}
                  style={{
                    fontFamily: stylingConfig.fontFamily,
                    color: stylingConfig.fontColor
                  }}
                >
                  {option}
                </span>
              )}
            </div>
          )) || []}
          
          {/* Other option for radio-with-other */}
          {field.type === 'radio-with-other' && field.allowOther && (
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name={field.id}
                value="other"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 flex-shrink-0"
                disabled
              />
              <span 
                className={`text-sm ${getTextSizeClasses(globalSize, 'label')}`}
                style={{
                  fontFamily: stylingConfig.fontFamily,
                  color: stylingConfig.fontColor
                }}
              >
                {field.otherLabel || 'Other:'}
              </span>
              <input
                type="text"
                placeholder={field.otherPlaceholder || 'Please specify...'}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                style={inputStyle}
                disabled
              />
            </div>
          )}
        </div>
      )
    case 'checkbox':
      return (
        <label key={field.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            required={field.required}
            disabled
          />
          <span 
            style={{
              fontFamily: stylingConfig.fontFamily,
              color: stylingConfig.fontColor
            }}
          >
            {field.label}
          </span>
        </label>
      )
      
    case 'checkbox-group':
    case 'checkbox-with-other':
      return (
        <div key={field.id} className="space-y-2">
          {field.options?.map((option, idx) => (
            <label key={idx} htmlFor={`${field.id}-${idx}`} className="flex items-center space-x-2 cursor-pointer">
              <input
                id={`${field.id}-${idx}`}
                type="checkbox"
                name={field.id}
                value={option}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                disabled
              />
              <span 
                className={`text-sm ${getTextSizeClasses(globalSize, 'label')}`}
                style={{
                  fontFamily: stylingConfig.fontFamily,
                  color: stylingConfig.fontColor
                }}
              >
                {option}
              </span>
            </label>
          )) || []}
          
          {/* Other option for checkbox-with-other */}
          {field.type === 'checkbox-with-other' && field.allowOther && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name={`${field.id}_other`}
                value="other"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                disabled
              />
              <span 
                className={`text-sm ${getTextSizeClasses(globalSize, 'label')}`}
                style={{
                  fontFamily: stylingConfig.fontFamily,
                  color: stylingConfig.fontColor
                }}
              >
                {field.otherLabel || 'Other:'}
              </span>
              <input
                type="text"
                placeholder={field.otherPlaceholder || 'Please specify...'}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                style={inputStyle}
                disabled
              />
            </label>
          )}
        </div>
      )
      
    default:
      return (
        <div className={containerClasses}>
          <input
            key={field.id}
            type={field.type}
            placeholder={field.placeholder}
            className={`${baseClasses} ${sizeClasses}`}
            style={inputStyle}
            required={field.required}
            readOnly
          />
        </div>
      )
  }
}