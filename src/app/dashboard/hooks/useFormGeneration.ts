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
  formId?: string // Add formId to schema for persistence
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface FieldExtraction {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'checkbox-group' | 'radio-with-other' | 'checkbox-with-other'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
  additionalContext?: string
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
}

export function useFormGeneration() {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedFormId, setPublishedFormId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [customButtonText, setCustomButtonText] = useState<string>('Submit Form')

  // Screenshot analysis states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extractedFields, setExtractedFields] = useState<FieldExtraction[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const generateForm = async (
    description: string, 
    currentForm: FormSchema | null = null,
    isEdit: boolean = false,
    preserveButtonText?: string,
    extractedFields?: FieldExtraction[]
  ) => {
    if (!description.trim() && !extractedFields) return

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
          isEdit,
          extractedFields // Pass extracted fields from screenshot
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form')
      }

      // Preserve formId from existing schema during updates
      const updatedSchema = {
        ...data.formSchema,
        formId: currentForm?.formId || data.formSchema.formId
      }
      
      setFormSchema(updatedSchema)
      
      // Preserve custom button text during updates
      if (isEdit && preserveButtonText) {
        setCustomButtonText(preserveButtonText)
      }
      
      // Add to chat history
      const userMessage = extractedFields 
        ? `Generated form from screenshot with ${extractedFields.length} fields${description ? ` and instructions: ${description}` : ''}`
        : description
      
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: isEdit ? 'Form updated!' : (extractedFields ? 'Form created from screenshot!' : 'Form created!') }
      ])
      
      // Reset screenshot analysis state after successful form generation
      if (extractedFields) {
        resetAnalysis()
      }
      
      return updatedSchema
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeScreenshot = async (imageData: string, additionalContext?: string) => {
    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          additionalContext
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze screenshot')
      }

      setExtractedFields(data.extractedFields)
      setAnalysisComplete(true)
      
      // Add to chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: `Uploaded screenshot for analysis${additionalContext ? ` with context: ${additionalContext}` : ''}` },
        { role: 'assistant', content: `Extracted ${data.extractedFields.length} fields from screenshot. Please review and edit as needed.` }
      ])

      return data.extractedFields
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateFormFromFields = async (validatedFields: FieldExtraction[]) => {
    // Extract additional context from first field if available
    const additionalContext = validatedFields.find(f => f.additionalContext)?.additionalContext || ''
    
    // Convert extracted fields to description for form generation
    const description = `Create a form with these fields: ${validatedFields.map(field => {
      let fieldDesc = `${field.label} (${field.type}${field.required ? ', required' : ', optional'})`
      if (field.placeholder) fieldDesc += ` with placeholder "${field.placeholder}"`
      if (field.options) fieldDesc += ` with options: ${field.options.join(', ')}`
      return fieldDesc
    }).join('; ')}. ${additionalContext}`

    return await generateForm(description, null, false, undefined, validatedFields)
  }

  const publishForm = async (effectiveFormSchema: FormSchema, submitButtonText: string) => {
    if (!effectiveFormSchema) return

    setIsPublishing(true)
    setError('')

    try {
      const requestBody = {
        formSchema: effectiveFormSchema,
        submitButtonText,
        existingFormId: effectiveFormSchema.formId || publishedFormId
      }

      const response = await fetch('/api/publish-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish form')
      }

      setPublishedFormId(data.formId)
      
      if (effectiveFormSchema && !effectiveFormSchema.formId) {
        const updatedSchema = { ...effectiveFormSchema, formId: data.formId }
        setFormSchema(updatedSchema)
      }
      
      return data.formId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      throw err
    } finally {
      setIsPublishing(false)
    }
  }

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData)
    setExtractedFields([])
    setAnalysisComplete(false)
    setError('')
  }

  const resetAnalysis = () => {
    setUploadedImage(null)
    setExtractedFields([])
    setAnalysisComplete(false)
    setIsAnalyzing(false)
    setError('')
  }

  const updateFormSchema = (newSchema: FormSchema) => {
    setFormSchema(newSchema)
  }

  const updateButtonText = (buttonText: string) => {
    setCustomButtonText(buttonText)
  }

  const clearError = () => setError('')

  return {
    // Original state
    formSchema,
    isLoading,
    isPublishing,
    publishedFormId,
    error,
    chatHistory,
    customButtonText,

    // Screenshot analysis state
    uploadedImage,
    extractedFields,
    isAnalyzing,
    analysisComplete,

    // Original actions
    generateForm,
    publishForm,
    updateFormSchema,
    updateButtonText,
    clearError,

    // Screenshot analysis actions
    analyzeScreenshot,
    generateFormFromFields,
    handleImageUpload,
    resetAnalysis
  }
}