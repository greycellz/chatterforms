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
    <div className="mt-6 flex justify-center">
      {editingField === 'submitButton' ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit()
            if (e.key === 'Escape') onCancelEdit()
          }}
          className="bg-white text-black border-2 border-blue-500 rounded-lg py-4 px-6 focus:outline-none font-medium shadow-sm"
          style={{
            fontFamily: stylingConfig.fontFamily,
            width: 'fit-content',
            minWidth: '200px'
          }}
          autoFocus
        />
      ) : (
        <button
          className={`text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${getButtonSizeClasses(globalSize)}`}
          onDoubleClick={() => onStartEditing('submitButton')}
          type="button"
          title="Double-click to edit button text"
          style={{
            fontFamily: stylingConfig.fontFamily,
            background: stylingConfig.buttonColor,
            width: 'fit-content',
            padding: '16px 32px',
            minHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {submitButtonText}
        </button>
      )}
    </div>
  )
}