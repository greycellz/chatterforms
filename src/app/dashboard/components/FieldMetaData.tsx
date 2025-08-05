import EditableText from './EditableText'

interface FieldMetadataProps {
  fieldId: string
  fieldIndex: number
  fieldType: string
  placeholder?: string
  options?: string[]
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'placeholder' | 'options', fieldId: string, fieldIndex: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export default function FieldMetadata({
  fieldId,
  fieldIndex,
  fieldType,
  placeholder,
  options,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit
}: FieldMetadataProps) {
  return (
    <div className="space-y-2">
      {/* Editable Placeholder (for applicable field types) */}
      {(fieldType === 'text' || fieldType === 'email' || fieldType === 'tel' || fieldType === 'textarea') && placeholder && (
        <div className="flex items-center space-x-2 p-2 bg-gray-50/80 rounded-md border border-gray-200/60">
          <span className="text-xs font-medium text-gray-700 flex-shrink-0">
            📝 Placeholder:
          </span>
          <EditableText
            text={placeholder}
            editKey={`placeholder-${fieldId}`}
            className="text-xs text-gray-600 bg-transparent px-1 py-0.5 rounded flex-1"
            onStartEdit={() => onStartEditing('placeholder', fieldId, fieldIndex)}
            isEditing={editingField === `placeholder-${fieldId}`}
            editValue={editValue}
            onEditValueChange={onEditValueChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        </div>
      )}
      
      {/* Editable Options (only for select fields, radio options are now inline) */}
      {fieldType === 'select' && options && (
        <div className="flex items-start space-x-2 p-2 bg-amber-50/80 rounded-md border border-amber-200/60">
          <span className="text-xs font-medium text-amber-700 flex-shrink-0 mt-0.5">
            ⚙️ Options:
          </span>
          <EditableText
            text={options.join(', ')}
            editKey={`options-${fieldId}`}
            className="text-xs text-amber-600 bg-transparent px-1 py-0.5 rounded flex-1"
            onStartEdit={() => onStartEditing('options', fieldId, fieldIndex)}
            isEditing={editingField === `options-${fieldId}`}
            editValue={editValue}
            onEditValueChange={onEditValueChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        </div>
      )}
      
      {/* Multi-option field types indicator */}
      {(fieldType === 'radio' || fieldType === 'radio-with-other' || fieldType === 'checkbox-group' || fieldType === 'checkbox-with-other') && options && (
        <div className="flex items-center space-x-2 p-2 bg-green-50/80 rounded-md border border-green-200/60">
          <span className="text-xs font-medium text-green-700">
            🔘 {options.length} option{options.length !== 1 ? 's' : ''}
            {(fieldType === 'radio-with-other' || fieldType === 'checkbox-with-other') && ' + Other'}
          </span>
          <span className="text-xs text-green-600 italic">
            (Click options below to edit)
          </span>
        </div>
      )}
    </div>
  )
}