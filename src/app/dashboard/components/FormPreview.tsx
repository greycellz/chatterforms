import FormHeader from './FormHeader'
import FieldList from './FieldList'
import SubmitButtonEditor from './SubmitButtonEditor'
import { SizeType, SizeConfig } from '../components/SizeUtilities'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  size?: SizeType
}

interface FormSchema {
  title: string
  fields: FormField[]
}

interface FormPreviewProps {
  formSchema: FormSchema | null
  effectiveFormSchema: FormSchema | null
  isLoading: boolean
  hasUnsavedChanges: boolean
  
  // Editing props
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'title' | 'label' | 'placeholder' | 'options' | 'submitButton', fieldId?: string, fieldIndex?: number, optionIndex?: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleRequired: (fieldId: string, required: boolean) => void
  sizeConfig: SizeConfig
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
  
  // Submit button text
  submitButtonText: string
}

export default function FormPreview({
  formSchema,
  effectiveFormSchema,
  isLoading,
  hasUnsavedChanges,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleRequired,
  sizeConfig,
  onSizeChange,
  submitButtonText
}: FormPreviewProps) {
  
  // Handle individual radio option editing
  const handleRadioOptionEdit = (fieldId: string, optionIndex: number) => {
    const fieldIndex = effectiveFormSchema?.fields.findIndex(f => f.id === fieldId) ?? -1
    onStartEditing('options', fieldId, fieldIndex, optionIndex)
  }

  return (
    <div className="flex-1 bg-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Form Preview</h2>
        {hasUnsavedChanges && (
          <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Unsaved changes
          </span>
        )}
      </div>
      
      {/* Form Preview Container - Black Border, White Background */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        {formSchema ? (
          <div className="space-y-4">
            {/* Form Header with Global Controls */}
            <FormHeader
              title={effectiveFormSchema?.title || formSchema.title}
              sizeConfig={sizeConfig}
              hasUnsavedChanges={hasUnsavedChanges}
              editingField={editingField}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onStartEditing={onStartEditing}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onSizeChange={onSizeChange}
            />
            
            {/* Field List */}
            {effectiveFormSchema?.fields && (
              <FieldList
                fields={effectiveFormSchema.fields}
                sizeConfig={sizeConfig}
                editingField={editingField}
                editValue={editValue}
                onEditValueChange={onEditValueChange}
                onStartEditing={onStartEditing}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onToggleRequired={onToggleRequired}
                onSizeChange={onSizeChange}
                onRadioOptionEdit={handleRadioOptionEdit}
              />
            )}
            
            {/* Submit Button Editor */}
            <SubmitButtonEditor
              submitButtonText={submitButtonText}
              globalSize={sizeConfig.globalFontSize}
              editingField={editingField}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onStartEditing={onStartEditing}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            {isLoading ? 'Generating your form...' : 'Your form will appear here...'}
          </p>
        )}
      </div>
    </div>
  )
}