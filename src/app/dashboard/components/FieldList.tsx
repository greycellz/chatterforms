import FieldContainer from './FieldContainer'
import { SizeType, SizeConfig } from '../components/SizeUtilities'

interface FormFieldType {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
}

interface FieldListProps {
  fields: FormFieldType[]
  sizeConfig: SizeConfig
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'label' | 'placeholder' | 'options', fieldId: string, fieldIndex: number, optionIndex?: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleRequired: (fieldId: string, required: boolean) => void
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
  onRadioOptionEdit: (fieldId: string, optionIndex: number) => void
}

export default function FieldList({
  fields,
  sizeConfig,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleRequired,
  onSizeChange,
  onRadioOptionEdit
}: FieldListProps) {
  return (
    <>
      {fields.map((field, index) => {
        // Get the current field size
        const currentFieldSize = sizeConfig.fieldSizes[field.id] || field.size || 'm'
        
        return (
          <FieldContainer
            key={field.id}
            field={field}
            fieldIndex={index}
            currentFieldSize={currentFieldSize}
            globalSize={sizeConfig.globalFontSize}
            editingField={editingField}
            editValue={editValue}
            onEditValueChange={onEditValueChange}
            onStartEditing={onStartEditing}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onToggleRequired={onToggleRequired}
            onSizeChange={onSizeChange}
            onRadioOptionEdit={onRadioOptionEdit}
          />
        )
      })}
    </>
  )
}