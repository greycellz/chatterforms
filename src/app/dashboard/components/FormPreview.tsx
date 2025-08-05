import FormHeader from './FormHeader'
import FieldList from './FieldList'
import SubmitButtonEditor from './SubmitButtonEditor'
import { SizeType, SizeConfig, StylingConfig } from '../components/SizeUtilities'

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
  stylingConfig: StylingConfig
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
  onStylingChange: (config: Partial<StylingConfig>) => void
  
  // Submit button text
  submitButtonText: string
}

// Loading skeleton components
const SkeletonField = ({ width = 'w-full' }: { width?: string }) => (
  <div className="space-y-2 animate-pulse">
    <div className={`h-4 bg-gray-200 rounded ${width === 'w-full' ? 'w-32' : width}`}></div>
    <div className="h-10 bg-gray-100 rounded border border-gray-200 w-full"></div>
  </div>
)

const LoadingFormAnimation = ({ stylingConfig }: { stylingConfig: StylingConfig }) => (
  <div 
    className="border-2 border-black rounded-lg p-6 relative overflow-hidden"
    style={{ 
      background: stylingConfig.backgroundColor,
      fontFamily: stylingConfig.fontFamily,
      color: stylingConfig.fontColor
    }}
  >
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer transform translate-x-[-100%]" 
         style={{
           animation: 'shimmer 2s ease-in-out infinite',
           backgroundSize: '200% 100%'
         }}>
    </div>
    
    {/* Content with typing animation */}
    <div className="space-y-6 relative z-10">
      {/* Form title skeleton with typing dots */}
      <div className="flex items-center space-x-3">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      {/* Progressive field loading */}
      <div className="space-y-4">
        <SkeletonField width="w-40" />
        <div className="opacity-75">
          <SkeletonField width="w-36" />
        </div>
        <div className="opacity-50">
          <SkeletonField width="w-44" />
        </div>
        <div className="opacity-25">
          <SkeletonField width="w-32" />
        </div>
      </div>
      
      {/* Submit button skeleton */}
      <div className="animate-pulse">
        <div 
          className="h-10 rounded-lg w-32"
          style={{ 
            backgroundColor: stylingConfig.buttonColor,
            opacity: 0.3
          }}
        ></div>
      </div>
    </div>
    
    {/* CSS for shimmer animation */}
    <style jsx>{`
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      
      .animate-shimmer {
        animation: shimmer 2s ease-in-out infinite;
      }
    `}</style>
  </div>
)

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
  stylingConfig,
  onSizeChange,
  onStylingChange,
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
      
      {/* Loading State with Animation */}
      {isLoading && (
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-lg animate-pulse">✨</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700 font-medium">
                    {formSchema ? "Updating your form..." : "Generating your form..."}
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  AI is {formSchema ? "refining your existing form with new changes" : "analyzing your request and crafting the perfect form"}...
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full"
                style={{
                  width: '0%',
                  animation: 'loadingProgress 3s ease-in-out infinite'
                }}
              ></div>
            </div>
          </div>
          
          {/* Animated loading form */}
          <LoadingFormAnimation stylingConfig={stylingConfig} />
          
          {/* CSS for animations */}
          <style jsx>{`
            @keyframes loadingProgress {
              0% { width: 0%; }
              50% { width: 75%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      )}
      
      {/* Actual Form Preview */}
      {!isLoading && (
        <div 
          className="border-2 border-black rounded-lg p-6"
          style={{ 
            background: stylingConfig.backgroundColor,
            fontFamily: stylingConfig.fontFamily,
            color: stylingConfig.fontColor
          }}
        >
          {formSchema ? (
            <div className="space-y-4">
              {/* Form Header with Global Controls */}
              <FormHeader
                title={effectiveFormSchema?.title || formSchema.title}
                sizeConfig={sizeConfig}
                stylingConfig={stylingConfig}
                hasUnsavedChanges={hasUnsavedChanges}
                editingField={editingField}
                editValue={editValue}
                onEditValueChange={onEditValueChange}
                onStartEditing={onStartEditing}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onSizeChange={onSizeChange}
                onStylingChange={onStylingChange}
              />
              
              {/* Field List */}
              {effectiveFormSchema?.fields && (
                <FieldList
                  fields={effectiveFormSchema.fields}
                  sizeConfig={sizeConfig}
                  stylingConfig={stylingConfig}
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
                stylingConfig={stylingConfig}
                editingField={editingField}
                editValue={editValue}
                onEditValueChange={onEditValueChange}
                onStartEditing={onStartEditing}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to create your form</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Describe what kind of form you need, or upload an image of an existing form to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}