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
    <>
      {/* Editable Placeholder (for applicable field types) */}
      {(fieldType === 'text' || fieldType === 'email' || fieldType === 'tel' || fieldType === 'textarea') && placeholder && (
        <div className="text-xs text-gray-500">
          Placeholder: <EditableText
            text={placeholder}
            editKey={`placeholder-${fieldId}`}
            className="inline"
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
        <div className="text-xs text-gray-500">
          Options: <EditableText
            text={options.join(', ')}
            editKey={`options-${fieldId}`}
            className="inline"
            onStartEdit={() => onStartEditing('options', fieldId, fieldIndex)}
            isEditing={editingField === `options-${fieldId}`}
            editValue={editValue}
            onEditValueChange={onEditValueChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        </div>
      )}
    </>
  )
}