import FormField from './FormField'
import FieldLabelWithToggle from './FieldLabelWithToggle'
import FieldMetadata from './FieldMetaData'
import SizeSlider from './SizeSlider'
import { SizeType, StylingConfig } from '../components/SizeUtilities'

interface FormFieldType {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
}

interface FieldContainerProps {
  field: FormFieldType
  fieldIndex: number
  currentFieldSize: SizeType
  globalSize: SizeType
  stylingConfig: StylingConfig
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

export default function FieldContainer({
  field,
  fieldIndex,
  currentFieldSize,
  globalSize,
  stylingConfig,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleRequired,
  onSizeChange,
  onRadioOptionEdit
}: FieldContainerProps) {
  return (
    <div className="space-y-2 relative">
      {/* Field Size Slider - positioned top-right */}
      <div className="flex justify-end mb-1">
        <SizeSlider
          fieldId={field.id}
          currentSize={currentFieldSize}
          onSizeChange={onSizeChange}
          label="Field Size"
        />
      </div>
      
      {/* Field Label with Required Toggle */}
      <FieldLabelWithToggle
        fieldId={field.id}
        fieldIndex={fieldIndex}
        label={field.label}
        isRequired={field.required}
        globalSize={globalSize}
        stylingConfig={stylingConfig}
        editingField={editingField}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onStartEditing={onStartEditing}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onToggleRequired={onToggleRequired}
      />
      
      {/* Form Field with integrated editing for radio options */}
      <FormField 
        field={{
          ...field,
          size: currentFieldSize
        }}
        globalSize={globalSize}
        stylingConfig={stylingConfig}
        onStartEditing={(fieldType, fieldId, optionIndex) => {
          if (fieldType === 'options' && optionIndex !== undefined) {
            onRadioOptionEdit(fieldId, optionIndex)
          }
        }}
        editingField={editingField}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />
      
      {/* Field Metadata (placeholder/options editing) */}
      <FieldMetadata
        fieldId={field.id}
        fieldIndex={fieldIndex}
        fieldType={field.type}
        placeholder={field.placeholder}
        options={field.options}
        editingField={editingField}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onStartEditing={onStartEditing}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />
    </div>
  )
}