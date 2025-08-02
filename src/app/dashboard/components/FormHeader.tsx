import EditableText from './EditableText'
import SizeSlider from './SizeSlider'
import { getTextSizeClasses, SizeType, SizeConfig } from '../components/SizeUtilities'

interface FormHeaderProps {
  title: string
  sizeConfig: SizeConfig
  hasUnsavedChanges: boolean
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'title') => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
}

export default function FormHeader({
  title,
  sizeConfig,
  hasUnsavedChanges,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onSizeChange
}: FormHeaderProps) {
  return (
    <>
      {/* Global Font Size Slider */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
        <SizeSlider
          currentSize={sizeConfig.globalFontSize}
          onSizeChange={onSizeChange}
          isGlobal={true}
          label="Global Font Size"
        />
        {hasUnsavedChanges && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ Size changes need to be saved and republished
          </div>
        )}
      </div>
      
      {/* Editable Form Title */}
      <EditableText
        text={title}
        editKey="title"
        className={`font-bold text-gray-900 mb-6 inline-block ${getTextSizeClasses(sizeConfig.globalFontSize, 'title')}`}
        onStartEdit={() => onStartEditing('title')}
        isEditing={editingField === 'title'}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
      />
    </>
  )
}