import { useState } from 'react'
import { FormField, FormSchema, ChatMessage, FieldExtraction, PDFPageSelectionResponse } from '../types'

export function useFormGeneration() {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedFormId, setPublishedFormId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [customButtonText, setCustomButtonText] = useState<string>('Submit Form')

  // File analysis states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null)
  const [uploadedURL, setUploadedURL] = useState<string | null>(null) // New URL state
  const [extractedFields, setExtractedFields] = useState<FieldExtraction[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // New PDF page selection state
  const [pdfPageSelection, setPdfPageSelection] = useState<PDFPageSelectionResponse | null>(null)

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
          extractedFields
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form')
      }

      const updatedSchema = {
        ...data.formSchema,
        formId: currentForm?.formId || data.formSchema.formId
      }
      
      setFormSchema(updatedSchema)
      
      if (isEdit && preserveButtonText) {
        setCustomButtonText(preserveButtonText)
      }
      
      // Enhanced chat history for different sources
      const userMessage = extractedFields 
        ? `Generated form from ${uploadedPDF ? 'PDF document' : uploadedURL ? 'URL' : 'screenshot'} with ${extractedFields.length} fields${description ? ` and instructions: ${description}` : ''}`
        : description
      
      const assistantMessage = isEdit 
        ? 'Form updated!' 
        : extractedFields 
          ? `Form created from ${uploadedPDF ? 'PDF' : uploadedURL ? 'URL' : 'screenshot'}! Found ${extractedFields.length} fields.`
          : 'Form created!'
      
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      ])
      
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

  const analyzeURL = async (url: string, additionalContext?: string) => {
    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          additionalContext
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze URL')
      }

      setExtractedFields(data.extractedFields)
      setAnalysisComplete(true)
      
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: `Uploaded URL for analysis: ${url.length > 50 ? url.substring(0, 50) + '...' : url}${additionalContext ? ` with context: ${additionalContext}` : ''}` },
        { role: 'assistant', content: `Extracted ${data.extractedFields.length} fields from URL using ${data.method}. Please review and edit as needed.` }
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

  const analyzePDF = async (
    file: File, 
    additionalContext?: string, 
    pageSelection?: { pages: number[], selectAll?: boolean }
  ) => {
    setIsAnalyzing(true)
    setError('')
    setPdfPageSelection(null)

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBuffer: base64,
          additionalContext,
          pageSelection
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze PDF')
      }

      // Check if page selection is needed
      if (data.needsPageSelection) {
        setPdfPageSelection(data)
        setIsAnalyzing(false)
        
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: `Uploaded PDF "${file.name}" for analysis${additionalContext ? ` with context: ${additionalContext}` : ''}` },
          { role: 'assistant', content: `PDF has ${data.totalPages} pages. Please select which pages to analyze.` }
        ])
        
        return null // No fields yet, waiting for page selection
      }

      // Analysis completed
      setExtractedFields(data.extractedFields)
      setAnalysisComplete(true)
      
      const processedPagesText = data.processedPages ? 
        ` (pages ${data.processedPages.join(', ')})` : ''
      
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: `Uploaded PDF "${file.name}" for analysis${additionalContext ? ` with context: ${additionalContext}` : ''}${processedPagesText}` },
        { 
          role: 'assistant', 
          content: `Analyzed PDF using ${data.processingMethod} and extracted ${data.extractedFields.length} fields from ${data.processedPages?.length || 'selected'} pages. Please review before generating.`
        }
      ])

      return data.extractedFields
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      throw err
    } finally {
      if (!pdfPageSelection) {
        setIsAnalyzing(false)
      }
    }
  }

  const handlePageSelectionComplete = async (pageSelection: { pages: number[], selectAll?: boolean }) => {
    if (!uploadedPDF || !pdfPageSelection) return

    // Continue analysis with selected pages
    await analyzePDF(uploadedPDF, '', pageSelection)
  }

  const generateFormFromFields = async (validatedFields: FieldExtraction[]) => {
    const additionalContext = validatedFields.find(f => f.additionalContext)?.additionalContext || ''
    
    const sourceInfo = uploadedPDF 
      ? `PDF document "${uploadedPDF.name}"`
      : uploadedURL
        ? `URL "${uploadedURL}"`
        : 'screenshot'
    
    const description = `Create a form based on fields extracted from ${sourceInfo}: ${validatedFields.map(field => {
      let fieldDesc = `${field.label} (${field.type}${field.required ? ', required' : ', optional'})`
      if (field.placeholder) fieldDesc += ` with placeholder "${field.placeholder}"`
      if (field.options) fieldDesc += ` with options: ${field.options.join(', ')}`
      if (field.pageNumber && uploadedPDF) fieldDesc += ` [page ${field.pageNumber}]`
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
    setUploadedPDF(null) // Clear PDF if image is uploaded
    setUploadedURL(null) // Clear URL if image is uploaded
    setExtractedFields([])
    setAnalysisComplete(false)
    setPdfPageSelection(null)
    setError('')
  }

  const handlePDFUpload = (file: File) => {
    setUploadedPDF(file)
    setUploadedImage(null) // Clear image if PDF is uploaded
    setUploadedURL(null) // Clear URL if PDF is uploaded
    setExtractedFields([])
    setAnalysisComplete(false)
    setPdfPageSelection(null)
    setError('')
  }

  const handleURLUpload = (url: string) => {
    setUploadedURL(url)
    setUploadedImage(null) // Clear image if URL is uploaded
    setUploadedPDF(null) // Clear PDF if URL is uploaded
    setExtractedFields([])
    setAnalysisComplete(false)
    setPdfPageSelection(null)
    setError('')
  }

  const resetAnalysis = () => {
    setUploadedImage(null)
    setUploadedPDF(null)
    setUploadedURL(null) // Reset URL
    setExtractedFields([])
    setAnalysisComplete(false)
    setIsAnalyzing(false)
    setPdfPageSelection(null)
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
    // Form state
    formSchema,
    isLoading,
    isPublishing,
    publishedFormId,
    error,
    chatHistory,
    customButtonText,

    // File analysis state
    uploadedImage,
    uploadedPDF,
    uploadedURL, // New URL state
    extractedFields,
    isAnalyzing,
    analysisComplete,
    pdfPageSelection,

    // Form actions
    generateForm,
    publishForm,
    updateFormSchema,
    updateButtonText,
    clearError,

    // File analysis actions
    analyzeScreenshot,
    analyzePDF,
    analyzeURL, // New URL analysis action
    generateFormFromFields,
    handleImageUpload,
    handlePDFUpload,
    handleURLUpload, // New URL upload handler
    handlePageSelectionComplete,
    resetAnalysis
  }
}