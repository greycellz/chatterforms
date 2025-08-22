import FormField from './FormField'
import EditableText from './EditableText'
import FieldThreeDotMenu from './FieldThreeDotMenu'
import { SizeType, StylingConfig, getTextSizeClasses } from '../components/SizeUtilities'

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

// Enhanced RequiredToggle component with better contrast
const EnhancedRequiredToggle = ({ fieldId, isRequired, onToggle }: {
  fieldId: string
  isRequired: boolean
  onToggle: (fieldId: string, required: boolean) => void
}) => {
  return (
    <div className="flex items-center ml-3 space-x-2">
      <label className="flex items-center cursor-pointer" title={isRequired ? "Make optional" : "Make required"}>
        <div className="relative">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => onToggle(fieldId, e.target.checked)}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-all duration-200 ease-in-out shadow-inner ${
            isRequired 
              ? 'bg-blue-500 shadow-blue-200' 
              : 'bg-gray-300 shadow-gray-100'
          }`}
          style={{
            boxShadow: isRequired 
              ? '0 2px 4px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
              : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out mt-0.5 ${
              isRequired ? 'translate-x-5' : 'translate-x-0.5'
            }`}
            style={{
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)'
            }} />
          </div>
        </div>
        <span className={`text-xs font-semibold ml-2 px-2 py-1 rounded-full transition-colors duration-200 ${
          isRequired 
            ? 'text-blue-700 bg-blue-100' 
            : 'text-gray-600 bg-gray-100'
        }`}>
          {isRequired ? 'Required' : 'Optional'}
        </span>
      </label>
    </div>
  )
}

// Enhanced SizeSlider with better contrast
const EnhancedSizeSlider = ({ fieldId, currentSize, onSizeChange, label }: {
  fieldId?: string
  currentSize: 'xs' | 's' | 'm' | 'l' | 'xl'
  onSizeChange: (fieldId: string | 'global', size: 'xs' | 's' | 'm' | 'l' | 'xl') => void
  label?: string
}) => {
  const sizes: ('xs' | 's' | 'm' | 'l' | 'xl')[] = ['xs', 's', 'm', 'l', 'xl']
  const currentIndex = sizes.indexOf(currentSize)
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value)
    const newSize = sizes[newIndex]
    onSizeChange(fieldId || 'global', newSize)
  }

  return (
    <div className="flex items-center space-x-2">
      {label && (
        <span className="text-xs font-medium text-gray-700 min-w-max">
          {label}:
        </span>
      )}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">xs</span>
        <input
          type="range"
          min="0"
          max="4"
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(currentIndex / 4) * 100}%, #e5e7eb ${(currentIndex / 4) * 100}%, #e5e7eb 100%)`
          }}
        />
        <span className="text-xs text-gray-500">xl</span>
        <span className="text-xs font-bold text-blue-600 min-w-max bg-blue-50 px-1.5 py-0.5 rounded">
          {currentSize.toUpperCase()}
        </span>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
        }
      `}</style>
    </div>
  )
}

// Enhanced FieldMetadata component
const EnhancedFieldMetadata = ({
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
}: {
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
}) => {
  return (
    <div className="space-y-2">
      {/* Editable Placeholder (for applicable field types) */}
      {(fieldType === 'text' || fieldType === 'email' || fieldType === 'tel' || fieldType === 'textarea') && placeholder && (
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-700 px-2 py-1 bg-gray-100/80 rounded-full inline-flex items-center space-x-1"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}>
            <span>📝</span>
            <span>Placeholder:</span>
          </span>
          <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100/60 rounded-full"
                style={{
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                }}>
            <EditableText
              text={placeholder}
              editKey={`placeholder-${fieldId}`}
              className="bg-transparent"
              onStartEdit={() => onStartEditing('placeholder', fieldId, fieldIndex)}
              isEditing={editingField === `placeholder-${fieldId}`}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
          </span>
        </div>
      )}
      
      {/* Editable Options (only for select fields, radio options are now inline) */}
      {fieldType === 'select' && options && (
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-amber-700 px-2 py-1 bg-amber-100/80 rounded-full inline-flex items-center space-x-1"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}>
            <span>⚙️</span>
            <span>Options:</span>
          </span>
          <span className="text-xs text-amber-600 px-2 py-1 bg-amber-100/60 rounded-full"
                style={{
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                }}>
            <EditableText
              text={options.join(', ')}
              editKey={`options-${fieldId}`}
              className="bg-transparent"
              onStartEdit={() => onStartEditing('options', fieldId, fieldIndex)}
              isEditing={editingField === `options-${fieldId}`}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
          </span>
        </div>
      )}
      
      {/* REMOVED: Multi-option field indicators - letting users discover double-click naturally */}
    </div>
  )
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
    <div className="space-y-3 relative group ml-8">
      {/* Clean Field Header with Three-Dot Menu in Margin */}
      <div className="relative">
        {/* Three-Dot Menu - Absolute positioned in left margin */}
        <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <FieldThreeDotMenu
            fieldId={field.id}
            fieldType={field.type}
            isRequired={field.required}
            currentSize={currentFieldSize}
            placeholder={field.placeholder}
            onToggleRequired={onToggleRequired}
            onSizeChange={onSizeChange}
            onStartEditing={onStartEditing}
            fieldIndex={fieldIndex}
            editingField={editingField}
            editValue={editValue}
            onEditValueChange={onEditValueChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        </div>
        
        {/* Field Label - Click to Edit */}
        <div className="flex items-center">
          <div
            className="cursor-pointer hover:bg-blue-50 hover:bg-opacity-50 rounded px-2 py-1 transition-colors"
            onDoubleClick={() => onStartEditing('label', field.id, fieldIndex)}
            title="Double-click to edit field name"
          >
            <EditableText
              text={field.label}
              editKey={`label-${field.id}`}
              className={`block font-medium ${getTextSizeClasses(globalSize, 'label')}`}
              onStartEdit={() => onStartEditing('label', field.id, fieldIndex)}
              isEditing={editingField === `label-${field.id}`}
              editValue={editValue}
              onEditValueChange={onEditValueChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              style={{
                fontFamily: stylingConfig.fontFamily,
                color: stylingConfig.fontColor
              }}
            />
          </div>
          
          {/* Required Badge */}
          {field.required && (
            <span className="ml-1 text-red-500 font-medium">
              *
            </span>
          )}
        </div>
      </div>
      
      {/* Form Field */}
      <div>
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
      </div>
    </div>
  )
}