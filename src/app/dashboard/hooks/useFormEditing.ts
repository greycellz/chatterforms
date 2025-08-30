import { useState, useEffect } from 'react'
import { SizeType, SizeConfig, StylingConfig, FormField, FormSchema } from '../types'

interface PendingChanges {
  title?: string
  fields?: (Partial<FormField> & { id?: string })[]
  submitButtonText?: string
  sizeConfig?: Partial<SizeConfig>
  stylingConfig?: Partial<StylingConfig>
}

export function useFormEditing(formSchema: FormSchema | null) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editValue, setEditValue] = useState('')
  
  // Initialize size config from form schema or defaults
  const [sizeConfig, setSizeConfig] = useState<SizeConfig>(() => ({
    globalFontSize: formSchema?.styling?.globalFontSize || 'm',
    fieldSizes: formSchema?.styling?.fieldSizes || {}
  }))

  // Initialize styling config from form schema or defaults
  const [stylingConfig, setStylingConfig] = useState<StylingConfig>(() => ({
    fontFamily: formSchema?.styling?.fontFamily || 'Arial, sans-serif',
    fontColor: formSchema?.styling?.fontColor || '#000000',
    backgroundColor: formSchema?.styling?.backgroundColor || '#ffffff',
    buttonColor: formSchema?.styling?.buttonColor || '#3b82f6'
  }))

  // Track form schema changes to detect unsaved changes
  const [lastPublishedSchema, setLastPublishedSchema] = useState<FormSchema | null>(null)

  // Update configs when form schema changes
  useEffect(() => {
    if (formSchema?.styling) {
      setSizeConfig({
        globalFontSize: formSchema.styling.globalFontSize || 'm',
        fieldSizes: formSchema.styling.fieldSizes || {}
      })
      setStylingConfig({
        fontFamily: formSchema.styling.fontFamily || 'Arial, sans-serif',
        fontColor: formSchema.styling.fontColor || '#000000',
        backgroundColor: formSchema.styling.backgroundColor || '#ffffff',
        buttonColor: formSchema.styling.buttonColor || '#3b82f6'
      })
    }
  }, [formSchema])

  // Detect when form schema changes and set hasUnsavedChanges
  useEffect(() => {
    if (formSchema && lastPublishedSchema) {
      // Compare only user-relevant fields, ignore system properties like formId
      const currentUserSchema = {
        title: formSchema.title,
        fields: formSchema.fields
      }
      const lastUserSchema = {
        title: lastPublishedSchema.title,
        fields: lastPublishedSchema.fields
      }
      
      const hasChanges = JSON.stringify(currentUserSchema) !== JSON.stringify(lastUserSchema)
      
      if (hasChanges) {
        console.log('🔍 Schema comparison detected user changes:', {
          currentTitle: formSchema.title,
          lastTitle: lastPublishedSchema.title,
          currentFieldsCount: formSchema.fields?.length,
          lastFieldsCount: lastPublishedSchema.fields?.length,
          currentFormId: formSchema.formId,
          lastFormId: lastPublishedSchema.formId
        })
      }
      
      setHasUnsavedChanges(hasChanges)
    } else if (formSchema && !lastPublishedSchema) {
      // If we have a form schema but no last published schema, 
      // it means this is a new form that hasn't been published yet
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }, [formSchema, lastPublishedSchema])





  // Get the effective form schema with pending changes applied
  const getEffectiveFormSchema = (): FormSchema | null => {
    if (!formSchema) return null

    const effective = { ...formSchema }

    // Apply pending title change
    if (pendingChanges.title !== undefined) {
      effective.title = pendingChanges.title
    }

    // Apply pending field changes AND size changes
    effective.fields = effective.fields.map((field, index) => {
      const pendingField = pendingChanges.fields?.[index]
      const fieldSize = sizeConfig.fieldSizes[field.id]
      
      let updatedField = { ...field }
      
      // Apply pending changes
      if (pendingField) {
        updatedField = { ...updatedField, ...pendingField }
      }
      
      // Apply size changes
      if (fieldSize) {
        updatedField.size = fieldSize
      }
      
      return updatedField
    })

    // Apply styling changes
    effective.styling = {
      ...effective.styling,
      globalFontSize: sizeConfig.globalFontSize,
      fieldSizes: sizeConfig.fieldSizes,
      fontFamily: stylingConfig.fontFamily,
      fontColor: stylingConfig.fontColor,
      backgroundColor: stylingConfig.backgroundColor,
      buttonColor: stylingConfig.buttonColor
    }

    return effective
  }

  // Start editing a field
  const startEditing = (
    fieldType: 'title' | 'label' | 'placeholder' | 'options' | 'submitButton',
    fieldId?: string,
    fieldIndex?: number,
    optionIndex?: number
  ) => {
    const effective = getEffectiveFormSchema()
    if (!effective) return

    let currentValue = ''
    let editKey = fieldId ? `${fieldType}-${fieldId}` : fieldType

    // Handle individual radio option editing
    if (fieldType === 'options' && optionIndex !== undefined && fieldIndex !== undefined) {
      editKey = `option-${fieldId}-${optionIndex}`
      currentValue = effective.fields[fieldIndex]?.options?.[optionIndex] || ''
    } else if (fieldType === 'title') {
      currentValue = effective.title
    } else if (fieldType === 'submitButton') {
      currentValue = pendingChanges.submitButtonText || 'Submit Form'
    } else if (fieldType === 'label' && fieldIndex !== undefined) {
      currentValue = effective.fields[fieldIndex]?.label || ''
    } else if (fieldType === 'placeholder' && fieldIndex !== undefined) {
      currentValue = effective.fields[fieldIndex]?.placeholder || ''
    } else if (fieldType === 'options' && fieldIndex !== undefined) {
      currentValue = effective.fields[fieldIndex]?.options?.join(', ') || ''
    }

    setEditingField(editKey)
    setEditValue(currentValue)
  }

  // Save the current edit
  const saveEdit = () => {
    if (!editingField || !formSchema) return

    // Handle individual radio option editing
    if (editingField.startsWith('option-')) {
      const parts = editingField.split('-')
      const fieldId = parts[1]
      const optionIndex = parseInt(parts[2], 10)
      const fieldIndex = formSchema.fields.findIndex(f => f.id === fieldId)

      if (fieldIndex !== -1 && !isNaN(optionIndex)) {
        const newPendingChanges = { ...pendingChanges }
        if (!newPendingChanges.fields) {
          newPendingChanges.fields = []
        }
        if (!newPendingChanges.fields[fieldIndex]) {
          newPendingChanges.fields[fieldIndex] = { id: fieldId }
        }

        // Update the specific option
        const currentOptions = newPendingChanges.fields[fieldIndex].options || 
                             formSchema.fields[fieldIndex].options || []
        const updatedOptions = [...currentOptions]
        updatedOptions[optionIndex] = editValue

        newPendingChanges.fields[fieldIndex].options = updatedOptions
        setPendingChanges(newPendingChanges)
        setHasUnsavedChanges(true)
      }
    } else {
      // Handle regular field editing
      const [fieldType, fieldId] = editingField.split('-')
      const fieldIndex = fieldId ? formSchema.fields.findIndex(f => f.id === fieldId) : -1

      const newPendingChanges = { ...pendingChanges }

      if (fieldType === 'title') {
        newPendingChanges.title = editValue
      } else if (fieldType === 'submitButton') {
        newPendingChanges.submitButtonText = editValue
      } else if (fieldIndex !== -1) {
        if (!newPendingChanges.fields) {
          newPendingChanges.fields = []
        }
        if (!newPendingChanges.fields[fieldIndex]) {
          newPendingChanges.fields[fieldIndex] = { id: fieldId }
        }

        if (fieldType === 'label') {
          newPendingChanges.fields[fieldIndex].label = editValue
        } else if (fieldType === 'placeholder') {
          newPendingChanges.fields[fieldIndex].placeholder = editValue
        } else if (fieldType === 'options') {
          newPendingChanges.fields[fieldIndex].options = editValue
            .split(',')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0)
        }
      }

      setPendingChanges(newPendingChanges)
      setHasUnsavedChanges(true)
    }

    setEditingField(null)
    setEditValue('')
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  // Save all pending changes to main schema
  const saveChanges = (): FormSchema | null => {
    const effective = getEffectiveFormSchema()
    if (effective) {
      // Only clear field and title changes, preserve button text and styling/sizing
      setPendingChanges({
        submitButtonText: pendingChanges.submitButtonText
      })
      setHasUnsavedChanges(false)
      return effective
    }
    return null
  }

  // Handle size changes
  const handleSizeChange = (fieldId: string | 'global', size: SizeType) => {
    if (fieldId === 'global') {
      setSizeConfig(prev => ({ ...prev, globalFontSize: size }))
    } else {
      setSizeConfig(prev => ({
        ...prev,
        fieldSizes: { ...prev.fieldSizes, [fieldId]: size }
      }))
    }
    setHasUnsavedChanges(true)
  }

  // Handle styling changes
  const handleStylingChange = (changes: Partial<StylingConfig>) => {
    setStylingConfig(prev => ({ ...prev, ...changes }))
    setHasUnsavedChanges(true)
  }

  const toggleRequired = (fieldId: string, required: boolean) => {
    if (!formSchema) return

    const fieldIndex = formSchema.fields.findIndex(f => f.id === fieldId)
    if (fieldIndex === -1) return

    const newPendingChanges = { ...pendingChanges }
    if (!newPendingChanges.fields) {
      newPendingChanges.fields = []
    }
    if (!newPendingChanges.fields[fieldIndex]) {
      newPendingChanges.fields[fieldIndex] = { id: fieldId }
    }

    newPendingChanges.fields[fieldIndex].required = required
    setPendingChanges(newPendingChanges)
    setHasUnsavedChanges(true)
  }

  // Discard pending changes
  const discardChanges = () => {
    setPendingChanges({})
    setHasUnsavedChanges(false)
    setEditingField(null)
    setEditValue('')
    
    // Reset styling and size configs to form schema defaults
    if (formSchema?.styling) {
      setSizeConfig({
        globalFontSize: formSchema.styling.globalFontSize || 'm',
        fieldSizes: formSchema.styling.fieldSizes || {}
      })
      setStylingConfig({
        fontFamily: formSchema.styling.fontFamily || 'Arial, sans-serif',
        fontColor: formSchema.styling.fontColor || '#000000',
        backgroundColor: formSchema.styling.backgroundColor || '#ffffff',
        buttonColor: formSchema.styling.buttonColor || '#3b82f6'
      })
    }
  }

  // Mark form as published (called after successful publish)
  const markAsPublished = () => {
    console.log('📝 markAsPublished called - Pre-state:', {
      formSchema,
      lastPublishedSchema,
      hasUnsavedChanges
    })

    if (formSchema) {
      setLastPublishedSchema(formSchema)
      setHasUnsavedChanges(false)
    }

    console.log('📝 markAsPublished completed - Post-state:', {
      lastPublishedSchema: formSchema,
      hasUnsavedChanges: false
    })
  }

  return {
    // State
    editingField,
    pendingChanges,
    hasUnsavedChanges,
    editValue,
    setEditValue,
    sizeConfig,
    stylingConfig,
    
    // Actions
    startEditing,
    saveEdit,
    cancelEdit,
    saveChanges,
    discardChanges,
    toggleRequired,
    handleSizeChange,
    handleStylingChange,
    getEffectiveFormSchema,
    markAsPublished
  }
}