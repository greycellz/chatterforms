import EditableText from './EditableText'
import ImprovedStylingPanel from './ImprovedStylingPanel'
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
  return (
    <div className="space-y-4">
      {/* Improved Settings Panel */}
      <ImprovedStylingPanel
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
      
      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>You have unsaved styling changes. Save or publish to apply them.</span>
        </div>
      )}
    </div>
  )
}