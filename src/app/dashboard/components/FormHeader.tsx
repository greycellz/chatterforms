import EditableText from './EditableText'
import StylingPanel from './StylingPanel'
import { getTextSizeClasses, SizeType, SizeConfig, StylingConfig } from '../components/SizeUtilities'
import { useState } from 'react'

interface FormHeaderProps {
  title: string
  sizeConfig: SizeConfig
  stylingConfig: StylingConfig
  hasUnsavedChanges: boolean
  editingField: string | null
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEditing: (fieldType: 'title') => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSizeChange: (fieldId: string | 'global', size: SizeType) => void
  onStylingChange: (config: Partial<StylingConfig>) => void
}

export default function FormHeader({
  title,
  sizeConfig,
  stylingConfig,
  hasUnsavedChanges,
  editingField,
  editValue,
  onEditValueChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onSizeChange,
  onStylingChange
}: FormHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      {/* Collapsible Controls Panel */}
      <div className="bg-gray-50 bg-opacity-95 rounded-lg border">
        {/* Header with Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-100 hover:bg-opacity-50 transition-colors rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Global Settings</span>
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {isExpanded ? 'Click to collapse' : 'Click to expand styling options'}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-4 pb-4">
            <StylingPanel
              fontFamily={stylingConfig.fontFamily}
              fontColor={stylingConfig.fontColor}
              backgroundColor={stylingConfig.backgroundColor}
              buttonColor={stylingConfig.buttonColor}
              globalFontSize={sizeConfig.globalFontSize}
              onFontFamilyChange={(fontFamily) => onStylingChange({ fontFamily })}
              onFontColorChange={(fontColor) => onStylingChange({ fontColor })}
              onBackgroundColorChange={(backgroundColor) => onStylingChange({ backgroundColor })}
              onButtonColorChange={(buttonColor) => onStylingChange({ buttonColor })}
              onSizeChange={onSizeChange}
            />
            
            {hasUnsavedChanges && (
              <div className="text-xs text-orange-600 mt-3 text-center">
                ⚠️ Changes need to be saved and republished
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Editable Form Title */}
      <EditableText
        text={title}
        editKey="title"
        className={`font-bold mb-6 inline-block ${getTextSizeClasses(sizeConfig.globalFontSize, 'title')}`}
        onStartEdit={() => onStartEditing('title')}
        isEditing={editingField === 'title'}
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
  )
}