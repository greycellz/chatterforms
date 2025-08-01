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

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useFormGeneration() {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedFormId, setPublishedFormId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  // Add state to track custom button text
  const [customButtonText, setCustomButtonText] = useState<string>('Submit Form')

  const generateForm = async (
    description: string, 
    currentForm: FormSchema | null = null,
    isEdit: boolean = false,
    preserveButtonText?: string
  ) => {
    if (!description.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description,
          currentForm,
          isEdit
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form')
      }

      setFormSchema(data.formSchema)
      
      // Preserve custom button text during updates
      if (isEdit && preserveButtonText) {
        setCustomButtonText(preserveButtonText)
      }
      
      // Add to chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: description },
        { role: 'assistant', content: isEdit ? 'Form updated!' : 'Form created!' }
      ])
      
      return data.formSchema
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const publishForm = async (effectiveFormSchema: FormSchema, submitButtonText: string) => {
    if (!effectiveFormSchema) return

    setIsPublishing(true)
    setError('')

    try {
      const response = await fetch('/api/publish-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          formSchema: effectiveFormSchema,
          submitButtonText
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish form')
      }

      setPublishedFormId(data.formId)
      return data.formId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      throw err
    } finally {
      setIsPublishing(false)
    }
  }

  const updateFormSchema = (newSchema: FormSchema) => {
    setFormSchema(newSchema)
  }

  // Add method to update button text
  const updateButtonText = (buttonText: string) => {
    setCustomButtonText(buttonText)
  }

  const clearError = () => setError('')

  return {
    // State
    formSchema,
    isLoading,
    isPublishing,
    publishedFormId,
    error,
    chatHistory,
    customButtonText,

    // Actions
    generateForm,
    publishForm,
    updateFormSchema,
    updateButtonText,
    clearError
  }
}