import EditableText from './EditableText'
import RequiredToggle from './RequiredToggle'
import { getTextSizeClasses, SizeType } from '../components/SizeUtilities'

interface FieldLabelWithToggleProps {
  fieldId: string
  fieldIndex: number
  label: string
  isRequired: boolean
  globalSize: SizeType
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'label', fieldId: string, fieldIndex: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleRequired: (fieldId: string, required: boolean) => void
}

export default function FieldLabelWithToggle({
  fieldId,
  fieldIndex,
  label,
  isRequired,
  globalSize,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleRequired
}: FieldLabelWithToggleProps) {
  return (
    <div className="flex items-center">
      <EditableText
        text={label}
        editKey={`label-${fieldId}`}
        className={`block font-medium text-gray-700 ${getTextSizeClasses(globalSize, 'label')}`}
        onStartEdit={() => onStartEditing('label', fieldId, fieldIndex)}
        isEditing={editingField === `label-${fieldId}`}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
      />
      {isRequired && <span className="text-red-500 ml-1">*</span>}
      
      {/* Required/Optional Toggle */}
      <RequiredToggle
        fieldId={fieldId}
        isRequired={isRequired}
        onToggle={onToggleRequired}
      />
    </div>
  )
}