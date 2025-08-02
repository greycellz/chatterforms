import EditableText from './EditableText'
import { getButtonSizeClasses, SizeType, StylingConfig } from '../components/SizeUtilities'

interface SubmitButtonEditorProps {
  submitButtonText: string
  globalSize: SizeType
  stylingConfig: StylingConfig
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
  stylingConfig,
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
      className={`mt-6 text-white rounded-lg transition-colors ${getButtonSizeClasses(globalSize)}`}
      onStartEdit={() => onStartEditing('submitButton')}
      isButton={true}
      isEditing={editingField === 'submitButton'}
      editValue={editValue}
      onEditValueChange={onEditValueChange}
      onSave={onSaveEdit}
      onCancel={onCancelEdit}
      style={{
        fontFamily: stylingConfig.fontFamily,
        background: stylingConfig.buttonColor
      }}
    />
  )
}