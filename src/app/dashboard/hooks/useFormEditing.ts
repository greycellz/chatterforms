import { useState } from 'react'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormSchema {
  title: string
  fields: FormField[]
}

interface PendingChanges {
  title?: string
  fields?: (Partial<FormField> & { id?: string })[]
  submitButtonText?: string
}

export function useFormEditing(formSchema: FormSchema | null) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editValue, setEditValue] = useState('')

  // Get the effective form schema with pending changes applied
  const getEffectiveFormSchema = (): FormSchema | null => {
    if (!formSchema) return null

    const effective = { ...formSchema }

    // Apply pending title change
    if (pendingChanges.title !== undefined) {
      effective.title = pendingChanges.title
    }

    // Apply pending field changes
    if (pendingChanges.fields) {
      effective.fields = effective.fields.map((field, index) => {
        const pendingField = pendingChanges.fields?.[index]
        if (pendingField) {
          return { ...field, ...pendingField }
        }
        return field
      })
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
      // Only clear field and title changes, preserve button text
      setPendingChanges({
        submitButtonText: pendingChanges.submitButtonText
      })
      setHasUnsavedChanges(false)
      return effective
    }
    return null
  }

  // Discard pending changes
  const discardChanges = () => {
    setPendingChanges({})
    setHasUnsavedChanges(false)
    setEditingField(null)
    setEditValue('')
  }

  return {
    // State
    editingField,
    pendingChanges,
    hasUnsavedChanges,
    editValue,
    setEditValue,
    
    // Actions
    startEditing,
    saveEdit,
    cancelEdit,
    saveChanges,
    discardChanges,
    getEffectiveFormSchema
  }
}