import EditableText from './EditableText'
import { getInputSizeClasses, getTextSizeClasses, SizeType, StylingConfig } from '../components/SizeUtilities'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
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
  const baseClasses = "w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  // Use field-specific size if available, otherwise fall back to global size
  const effectiveSize = field.size || globalSize
  const sizeClasses = getInputSizeClasses(effectiveSize)

  // Keep input fields white with gray-900 text (as requested)
  const inputStyle = {
    fontFamily: stylingConfig.fontFamily,
    color: '#111827', // gray-900
    backgroundColor: '#ffffff' // white
  }

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          key={field.id}
          placeholder={field.placeholder}
          className={`${baseClasses} ${sizeClasses} h-24 resize-none`}
          style={inputStyle}
          required={field.required}
          readOnly
        />
      )
    case 'select':
      return (
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
      )
    case 'radio':
      return (
        <div key={field.id} className="space-y-2">
          {field.options?.map((option, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <input
                type="radio"
                name={field.id}
                value={option}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
        </div>
      )
    case 'checkbox':
      return (
        <label key={field.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
    default:
      return (
        <input
          key={field.id}
          type={field.type}
          placeholder={field.placeholder}
          className={`${baseClasses} ${sizeClasses}`}
          style={inputStyle}
          required={field.required}
          readOnly
        />
      )
  }
}