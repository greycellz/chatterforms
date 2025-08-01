import EditableText from './EditableText'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormFieldComponentProps {
  field: FormField
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
  onStartEditing,
  editingField,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit
}: FormFieldComponentProps) {
  const baseClasses = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          key={field.id}
          placeholder={field.placeholder}
          className={`${baseClasses} h-24 resize-none`}
          required={field.required}
          readOnly
        />
      )
    case 'select':
      return (
        <select key={field.id} className={baseClasses} required={field.required} disabled>
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
                  className="text-sm text-gray-900 capitalize cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded"
                  onStartEdit={() => onStartEditing('options', field.id, idx)}
                  isEditing={editingField === `option-${field.id}-${idx}`}
                  editValue={editValue || ''}
                  onEditValueChange={onEditValueChange || (() => {})}
                  onSave={onSaveEdit || (() => {})}
                  onCancel={onCancelEdit || (() => {})}
                />
              ) : (
                <span className="text-sm text-gray-900 capitalize">{option}</span>
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
          <span>{field.label}</span>
        </label>
      )
    default:
      return (
        <input
          key={field.id}
          type={field.type}
          placeholder={field.placeholder}
          className={baseClasses}
          required={field.required}
          readOnly
        />
      )
  }
}