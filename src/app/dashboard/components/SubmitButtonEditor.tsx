import EditableText from './EditableText'
import { getButtonSizeClasses, SizeType } from '../components/SizeUtilities'

interface SubmitButtonEditorProps {
  submitButtonText: string
  globalSize: SizeType
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'submitButton') => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export default function SubmitButtonEditor({
  submitButtonText,
  globalSize,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit
}: SubmitButtonEditorProps) {
  return (
    <EditableText
      text={submitButtonText}
      editKey="submitButton"
      className={`mt-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${getButtonSizeClasses(globalSize)}`}
      onStartEdit={() => onStartEditing('submitButton')}
      isButton={true}
      isEditing={editingField === 'submitButton'}
      editValue={editValue}
      onEditValueChange={onEditValueChange}
      onSave={onSaveEdit}
      onCancel={onCancelEdit}
    />
  )
}