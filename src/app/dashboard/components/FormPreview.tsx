import EditableText from './EditableText'
import FormField from './FormField'
import RequiredToggle from './RequiredToggle'
import SizeSlider from './SizeSlider'
import { getTextSizeClasses, getButtonSizeClasses, SizeType, SizeConfig } from '../components/SizeUtilities'

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
      
      {/* Form Preview Container - Black Border, White Background (consistent with published form) */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        {formSchema ? (
          <div className="space-y-4">
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
              text={effectiveFormSchema?.title || formSchema.title}
              editKey="title"
              className={`font-bold text-gray-900 mb-6 inline-block ${getTextSizeClasses(sizeConfig.globalFontSize, 'title')}`}
              onStartEdit={() => onStartEditing('title')}
              isEditing={editingField === 'title'}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
            
            {effectiveFormSchema?.fields.map((field, index) => {
              // Debug: Get the current field size
              const currentFieldSize = sizeConfig.fieldSizes[field.id] || field.size || 'm'
              
              return (
              <div key={field.id} className="space-y-2 relative">
                {/* Field Size Slider - positioned top-right */}
                <div className="flex justify-end mb-1">
                  <SizeSlider
                    fieldId={field.id}
                    currentSize={currentFieldSize}
                    onSizeChange={onSizeChange}
                    label="Field Size"
                  />
                </div>
                
                {/* Editable Field Label with Required Toggle */}
                <div className="flex items-center">
                  <EditableText
                    text={field.label}
                    editKey={`label-${field.id}`}
                    className={`block font-medium text-gray-700 ${getTextSizeClasses(sizeConfig.globalFontSize, 'label')}`}
                    onStartEdit={() => onStartEditing('label', field.id, index)}
                    isEditing={editingField === `label-${field.id}`}
                    editValue={editValue}
                    onEditValueChange={onEditValueChange}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                  />
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  
                  {/* Required/Optional Toggle */}
                  <RequiredToggle
                    fieldId={field.id}
                    isRequired={field.required}
                    onToggle={onToggleRequired}
                  />
                </div>
                
                {/* Form Field with integrated editing for radio options */}
                <FormField 
                  field={{
                    ...field,
                    size: currentFieldSize
                  }}
                  globalSize={sizeConfig.globalFontSize}
                  onStartEditing={(fieldType, fieldId, optionIndex) => {
                    if (fieldType === 'options' && optionIndex !== undefined) {
                      handleRadioOptionEdit(fieldId, optionIndex)
                    }
                  }}
                  editingField={editingField}
                  editValue={editValue}
                  onEditValueChange={onEditValueChange}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                />
                
                {/* Editable Placeholder (for applicable field types) */}
                {(field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'textarea') && field.placeholder && (
                  <div className="text-xs text-gray-500">
                    Placeholder: <EditableText
                      text={field.placeholder}
                      editKey={`placeholder-${field.id}`}
                      className="inline"
                      onStartEdit={() => onStartEditing('placeholder', field.id, index)}
                      isEditing={editingField === `placeholder-${field.id}`}
                      editValue={editValue}
                      onEditValueChange={onEditValueChange}
                      onSave={onSaveEdit}
                      onCancel={onCancelEdit}
                    />
                  </div>
                )}
                
                {/* Editable Options (only for select fields, radio options are now inline) */}
                {field.type === 'select' && field.options && (
                  <div className="text-xs text-gray-500">
                    Options: <EditableText
                      text={field.options.join(', ')}
                      editKey={`options-${field.id}`}
                      className="inline"
                      onStartEdit={() => onStartEditing('options', field.id, index)}
                      isEditing={editingField === `options-${field.id}`}
                      editValue={editValue}
                      onEditValueChange={onEditValueChange}
                      onSave={onSaveEdit}
                      onCancel={onCancelEdit}
                    />
                  </div>
                )}
              </div>
            )})
        } 
            {/* Editable Submit Button */}
            <EditableText
              text={submitButtonText}
              editKey="submitButton"
              className={`mt-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${getButtonSizeClasses(sizeConfig.globalFontSize)}`}
              onStartEdit={() => onStartEditing('submitButton')}
              isButton={true}
              isEditing={editingField === 'submitButton'}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
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