import { useState, useRef } from 'react'
import { FormSchema, ChatMessage, FieldExtraction, PDFPageSelectionResponse } from '../types'
import { railwayClient, AnalysisResult } from '@/lib/railway-client'

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
  
  // Ref to track if analysis is in progress (prevents race conditions)
  const isAnalyzingRef = useRef(false)

  const generateForm = async (
    description: string, 
    currentForm: FormSchema | null = null,
    isEdit: boolean = false,
    preserveButtonText?: string,
    extractedFields?: FieldExtraction[]
  ) => {
    console.log('🚀 generateForm called:', { 
      description: description?.substring(0, 50) + '...', 
      isEdit, 
      hasExtractedFields: !!extractedFields,
      timestamp: Date.now(),
      stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
    })
    
    if (!description.trim() && !extractedFields) return

    setIsLoading(true)
    setError('')

    // Add user message to chat history (only if there's a description)
    if (description.trim()) {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: description, timestamp: Date.now() }
      ])
    }

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
      
      // Store form structure in GCP via Railway
      try {
        await railwayClient.storeFormStructure(
          updatedSchema,
          'anonymous', // TODO: Add user authentication
          {
            source: 'form-generation',
            isEdit,
            hasExtractedFields: !!extractedFields,
            uploadedSource: uploadedPDF ? 'pdf' : uploadedURL ? 'url' : uploadedImage ? 'screenshot' : 'text'
          }
        )
        console.log('✅ Form structure stored in GCP')
      } catch (error) {
        console.error('❌ Failed to store form in GCP:', error)
        // Don't fail the form generation if GCP storage fails
      }
      
      // Enhanced chat history for different sources
      const assistantMessage = isEdit 
        ? 'Form updated!' 
        : extractedFields 
          ? `Generated form from ${uploadedPDF ? 'PDF document' : uploadedURL ? 'URL' : 'screenshot'} with ${extractedFields.length} fields${description ? ` and additional instructions` : ''}`
          : 'Form created!'
      
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: assistantMessage, timestamp: Date.now() }
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
    
    const startTime = Date.now()
    
          // Add thinking message immediately
      const thinkingMessage: ChatMessage = { 
        role: 'thinking', 
        content: 'Analyzing screenshot...',
        timestamp: startTime,
        metadata: {
          duration: 0,
          type: 'image',
          steps: ['Processing image', 'Extracting form fields', 'Validating field types']
        }
      }
      
      console.log('🔍 Adding thinking message for image analysis:', thinkingMessage)
      
      setChatHistory(prev => [
        ...prev,
        thinkingMessage
      ])

    try {
      // Use Railway backend for analysis
      const result: AnalysisResult = await railwayClient.analyzeScreenshot(imageData, additionalContext)

      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      setExtractedFields(result.extractedFields)
      setAnalysisComplete(true)
      
      // Replace thinking message with results
      setChatHistory(prev => {
        const filtered = prev.filter(msg => msg.role !== 'thinking')
        return [
          ...filtered,
          { 
            role: 'assistant', 
            content: `Extracted ${result.extractedFields.length} fields from screenshot in ${duration}s. Please review and edit as needed.`, 
            timestamp: endTime 
          },
          {
            role: 'fieldResults',
            content: `Field extraction complete`,
            timestamp: endTime + 100,
            metadata: {
              extractedFields: result.extractedFields
            }
          }
        ]
      })

      return result.extractedFields
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      
      // Remove thinking message on error
      setChatHistory(prev => prev.filter(msg => msg.role !== 'thinking'))
      
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeURL = async (url: string, additionalContext?: string) => {
    console.log('🔍 analyzeURL called with:', { url, additionalContext, timestamp: Date.now() })
    // URL ANALYSIS FUNCTION - UNIQUE IDENTIFIER
    
    // Prevent duplicate analysis if already analyzing (using ref for immediate check)
    if (isAnalyzingRef.current) {
      console.log('⏭️ Skipping analyzeURL - already analyzing (ref check)')
      return
    }
    
    // Set analyzing flag immediately
    isAnalyzingRef.current = true
    
    // Set URL state first (like other analysis functions)
    setUploadedURL(url)
    setUploadedImage(null) // Clear image if URL is uploaded
    setUploadedPDF(null) // Clear PDF if URL is uploaded
    setExtractedFields([])
    setAnalysisComplete(false)
    setPdfPageSelection(null)
    setError('')
    
    setIsAnalyzing(true)
    
    const startTime = Date.now()
    
    // Add URL upload message and thinking message
    setChatHistory(prev => [
      ...prev,
      { 
        role: 'file', 
        content: 'URL uploaded',
        timestamp: startTime,
        metadata: {
          fileType: 'url',
          fileName: url,
          fileData: url,
          isUpload: true
        }
      },
      { 
        role: 'thinking', 
        content: 'Analyzing URL...',
        timestamp: startTime + 100,
        metadata: {
          duration: 0,
          type: 'url',
          steps: ['Fetching webpage', 'Extracting form fields', 'Validating field types']
        }
      }
    ])

    try {
      // Use Railway backend for URL analysis
      const result: AnalysisResult = await railwayClient.analyzeURL(url, additionalContext)

      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      setExtractedFields(result.extractedFields)
      setAnalysisComplete(true)
      
      // Replace thinking message with results
      setChatHistory(prev => {
        const filtered = prev.filter(msg => msg.role !== 'thinking')
        return [
          ...filtered,
          { 
            role: 'assistant', 
            content: `Extracted ${result.extractedFields.length} fields from URL in ${duration}s. Please review and edit as needed.`, 
            timestamp: endTime 
          },
          {
            role: 'fieldResults',
            content: `Field extraction complete`,
            timestamp: endTime + 100,
            metadata: {
              extractedFields: result.extractedFields
            }
          }
        ]
      })

      // Reset analyzing flag on success
      isAnalyzingRef.current = false
      return result.extractedFields
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      
      // Remove thinking message on error
      setChatHistory(prev => prev.filter(msg => msg.role !== 'thinking'))
      
      // Reset analyzing flag on error
      isAnalyzingRef.current = false
      
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
    
    const startTime = Date.now()
    
    // Add thinking message immediately
    setChatHistory(prev => [
      ...prev,
      { 
        role: 'thinking', 
        content: 'Analyzing PDF...',
        timestamp: startTime,
        metadata: {
          duration: 0,
          type: 'pdf',
          steps: ['Processing PDF', 'Extracting form fields', 'Validating field types']
        }
      }
    ])

    try {
      // Use Railway backend for PDF analysis
      const result: AnalysisResult = await railwayClient.analyzePDF(file, additionalContext)

      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      // Analysis completed
      setExtractedFields(result.extractedFields)
      setAnalysisComplete(true)
      
      // Replace thinking message with results
      setChatHistory(prev => {
        const filtered = prev.filter(msg => msg.role !== 'thinking')
        return [
          ...filtered,
          { 
            role: 'assistant', 
            content: `Analyzed PDF and extracted ${result.extractedFields.length} fields in ${duration}s. Please review before generating.`,
            timestamp: endTime
          },
          {
            role: 'fieldResults',
            content: `Field extraction complete`,
            timestamp: endTime + 100,
            metadata: {
              extractedFields: result.extractedFields
            }
          }
        ]
      })

      return result.extractedFields
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      
      // Remove thinking message on error
      setChatHistory(prev => prev.filter(msg => msg.role !== 'thinking'))
      
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
      ? `PDF document`
      : uploadedURL
        ? `URL analysis`
        : 'screenshot'
    
    // Create a much shorter description to avoid layout issues
    const description = `Generate form from ${sourceInfo} with ${validatedFields.length} extracted fields${additionalContext ? ` and custom requirements` : ''}`

    return await generateForm(description, null, false, undefined, validatedFields)
  }

  const publishForm = async (effectiveFormSchema: FormSchema, submitButtonText: string, onPublished?: () => void) => {
    if (!effectiveFormSchema) return

    console.log('🚀 Starting publish - Pre-state:', {
      publishedFormId,
      isPublishing: false
    })

    setIsPublishing(true)
    setError('')

    try {
      const requestBody = {
        formSchema: effectiveFormSchema,
        submitButtonText,
        existingFormId: effectiveFormSchema.formId || publishedFormId
      }

      // Get authentication token from localStorage
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add authorization header if user is authenticated
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/publish-form', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication required
          throw new Error('Please sign up or sign in to publish your forms')
        }
        throw new Error(data.error || 'Failed to publish form')
      }

      console.log('🚀 Publish successful - Setting states:', {
        newFormId: data.formId,
        oldPublishedFormId: publishedFormId
      })

      setPublishedFormId(data.formId)
      
      console.log('🚀 After setting publishedFormId:', {
        publishedFormId: data.formId
      })
      
      if (effectiveFormSchema && !effectiveFormSchema.formId) {
        const updatedSchema = { ...effectiveFormSchema, formId: data.formId }
        setFormSchema(updatedSchema)
      }
      
      // Call the onPublished callback after state updates
      if (onPublished) {
        console.log('🚀 Calling onPublished callback')
        onPublished()
      }
      
      console.log('🚀 Publish function completed - Final state:', {
        publishedFormId: data.formId,
        isPublishing: false
      })
      
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
    
    // Add file message to chat history
    setChatHistory(prev => [
      ...prev,
      { 
        role: 'file', 
        content: 'Image uploaded',
        timestamp: Date.now(),
        metadata: {
          fileType: 'image',
          fileName: 'Screenshot',
          fileData: imageData,
          isUpload: true
        }
      }
    ])
    
    // Automatically trigger analysis
    analyzeScreenshot(imageData)
  }

  const handlePDFUpload = (file: File) => {
    setUploadedPDF(file)
    setUploadedImage(null) // Clear image if PDF is uploaded
    setUploadedURL(null) // Clear URL if PDF is uploaded
    setExtractedFields([])
    setAnalysisComplete(false)
    setPdfPageSelection(null)
    setError('')
    
    // Add file message to chat history
    setChatHistory(prev => [
      ...prev,
      { 
        role: 'file', 
        content: 'PDF uploaded',
        timestamp: Date.now(),
        metadata: {
          fileType: 'pdf',
          fileName: file.name,
          fileData: file.name, // Just show filename for PDFs
          isUpload: true
        }
      }
    ])
    
    // Automatically trigger analysis
    analyzePDF(file)
  }

  const handleURLUpload = (url: string) => {
    setUploadedURL(url)
    setUploadedImage(null) // Clear image if URL is uploaded
    setUploadedPDF(null) // Clear PDF if URL is uploaded
    setExtractedFields([])
    setAnalysisComplete(false)
    setPdfPageSelection(null)
    setError('')
    
    // Add file message to chat history
    setChatHistory(prev => [
      ...prev,
      { 
        role: 'file', 
        content: 'URL uploaded',
        timestamp: Date.now(),
        metadata: {
          fileType: 'url',
          fileName: url,
          fileData: url,
          isUpload: true
        }
      }
    ])
    
    // Automatically trigger analysis
    analyzeURL(url)
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