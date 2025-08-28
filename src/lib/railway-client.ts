import { FieldExtraction } from '@/app/dashboard/types'

interface FormSchema {
  id?: string
  title: string
  fields: FormField[]
  styling?: {
    backgroundColor?: string
    fontFamily?: string
    fontSize?: string
    color?: string
    borderRadius?: string
    padding?: string
    margin?: string
  }
}

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: string[]
  confidence?: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
  additionalContext?: string
}

/**
 * Railway API Client for Vercel Frontend
 * Handles communication with Railway backend for form processing and GCP integration
 */

const RAILWAY_BASE_URL = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://my-poppler-api-production.up.railway.app'

export interface RailwayResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FormSubmissionData {
  formId: string
  formData: Record<string, unknown>
  userId?: string
  isHipaa?: boolean
  metadata?: {
    ipAddress?: string
    userAgent?: string
    timestamp?: string
  }
}

export interface AnalysisResult {
  extractedFields: FieldExtraction[]
  metadata?: {
    processingTime?: number
    source?: 'pdf' | 'screenshot' | 'url'
    totalPages?: number
    originalUrl?: string
    method?: string
  }
}

class RailwayClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = RAILWAY_BASE_URL
  }

  /**
   * Test Railway connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      const data = await response.json()
      return data.status === 'healthy' && data.services?.gcp === 'enabled'
    } catch (error) {
      console.error('Railway connection test failed:', error)
      return false
    }
  }

  /**
   * Analyze screenshot using GPT-4 Vision API directly
   */
  async analyzeScreenshot(imageData: string, additionalContext?: string): Promise<AnalysisResult> {
    try {
      // Use the same approach as PDF analysis - call Vercel API directly
      const extractedFields = await this.analyzeImagesWithGPT([imageData], additionalContext)
      
      return {
        extractedFields,
        metadata: {
          processingTime: Date.now(),
          source: 'screenshot'
        }
      }
    } catch (error) {
      console.error('Screenshot analysis error:', error)
      throw error
    }
  }

  /**
   * Analyze PDF using Railway backend + GPT-4 Vision
   */
  async analyzePDF(pdfFile: File, additionalContext?: string): Promise<AnalysisResult> {
    try {
      // Step 1: Convert PDF to images using Railway
      const formData = new FormData()
      formData.append('pdf', pdfFile)

      const uploadResponse = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'PDF upload failed')
      }

      const uploadData = await uploadResponse.json()
      console.log('✅ PDF converted to images:', uploadData.uuid)

      // Step 2: Analyze images using GPT-4 Vision API
      const imageUrls = uploadData.images.map((img: { url: string }) => img.url)
      const extractedFields = await this.analyzeImagesWithGPT(imageUrls, additionalContext)

      // Step 3: Cleanup Railway files
      try {
        await fetch(`${this.baseUrl}/cleanup/${uploadData.uuid}`, {
          method: 'DELETE',
        })
        console.log('🗑️ Cleaned up Railway files')
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup Railway files:', cleanupError)
      }

      return {
        extractedFields,
        metadata: {
          processingTime: uploadData.processingTime,
          source: 'pdf',
          totalPages: uploadData.totalPages
        }
      }
    } catch (error) {
      console.error('PDF analysis error:', error)
      throw error
    }
  }

  /**
   * Analyze images using GPT-4 Vision API
   */
  private async analyzeImagesWithGPT(imageUrls: string[], additionalContext?: string): Promise<FieldExtraction[]> {
    try {
      const systemMessage = `You are a form analysis expert. Analyze these PDF page images and extract ALL visible form fields.

For each field you identify, determine:

1. **Field Label**: The visible text label (exactly as shown)
2. **Field Type**: Choose the most appropriate type based on visual structure:
   - text: for single-line text inputs (names, addresses, single values)
   - email: for email address fields
   - tel: for phone/telephone number fields  
   - textarea: for large text areas, comments, messages
   - select: for dropdown menus with arrow indicators
   - radio: for radio button groups (○ symbols)
   - radio-with-other: for radio buttons that include "Other:" with text input
   - checkbox: for single checkboxes (☐ or ☑ symbols)
   - checkbox-group: for multiple related checkboxes (like languages, skills, etc.)
   - checkbox-with-other: for checkbox groups that include "Other:" with text input
   - date: for date picker fields

3. **Required/Optional**: Determine if the field is required (look for asterisks *, "required", or context)
4. **Placeholder Text**: Extract any placeholder text shown in input fields
5. **Options**: For select/radio/checkbox fields, extract all visible options

Return ONLY valid JSON in this exact format:
{
  "fields": [
    {
      "id": "unique_id",
      "label": "Field Label",
      "type": "text|email|tel|textarea|select|radio|checkbox|date|checkbox-group|radio-with-other|checkbox-with-other",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"],
      "confidence": 0.9
    }
  ]
}`

      const userMessage = `Analyze these PDF page images and extract all form fields:${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`

      // Call GPT-4 Vision API
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls,
          systemMessage,
          userMessage
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Image analysis failed')
      }

      const data = await response.json()
      
      // Transform to FieldExtraction format
      return (data.fields || []).map((field: { id?: string; label?: string; type?: string; required?: boolean; placeholder?: string; options?: string[]; confidence?: number; allowOther?: boolean; otherLabel?: string; otherPlaceholder?: string; pageNumber?: number; additionalContext?: string }) => ({
        id: field.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: field.label || 'Untitled Field',
        type: field.type || 'text',
        required: field.required || false,
        placeholder: field.placeholder,
        options: field.options,
        confidence: field.confidence || 0.8,
        allowOther: field.allowOther,
        otherLabel: field.otherLabel,
        otherPlaceholder: field.otherPlaceholder,
        pageNumber: field.pageNumber,
        additionalContext: field.additionalContext
      }))
    } catch (error) {
      console.error('Image analysis error:', error)
      throw error
    }
  }

  /**
   * Analyze URL using Vercel API route (original working approach)
   */
  async analyzeURL(url: string, additionalContext?: string): Promise<AnalysisResult> {
    try {
      // Use the original working approach - call Vercel API route
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'URL analysis failed')
      }

      const data = await response.json()
      
      // Transform to FieldExtraction format
      const extractedFields: FieldExtraction[] = (data.extractedFields || []).map((field: { id?: string; label?: string; type?: string; required?: boolean; placeholder?: string; options?: string[]; confidence?: number; allowOther?: boolean; otherLabel?: string; otherPlaceholder?: string; pageNumber?: number; additionalContext?: string }) => ({
        id: field.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: field.label || 'Untitled Field',
        type: field.type || 'text',
        required: field.required || false,
        placeholder: field.placeholder,
        options: field.options,
        confidence: field.confidence || 0.8,
        allowOther: field.allowOther,
        otherLabel: field.otherLabel,
        otherPlaceholder: field.otherPlaceholder,
        pageNumber: field.pageNumber,
        additionalContext: field.additionalContext
      }))

      return {
        extractedFields,
        metadata: {
          processingTime: data.processingTimeMs,
          source: 'url',
          originalUrl: url,
          method: data.method
        }
      }
    } catch (error) {
      console.error('URL analysis error:', error)
      throw error
    }
  }

  /**
   * Submit form data to Railway backend with GCP integration
   */
  async submitForm(submissionData: FormSubmissionData): Promise<RailwayResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Form submission failed')
      }

      return {
        success: true,
        data: data,
        message: 'Form submitted successfully'
      }
    } catch (error) {
      console.error('Form submission error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Form submission failed'
      }
    }
  }

  /**
   * Store form structure in GCP via Railway
   */
  async storeFormStructure(formData: FormSchema, userId?: string, metadata?: Record<string, unknown>): Promise<RailwayResponse> {
    const maxRetries = 3;
    const timeout = 30000; // 30 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} to store form in GCP...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}/store-form`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData,
            userId,
            metadata: {
              ...metadata,
              source: 'vercel-frontend',
              timestamp: new Date().toISOString()
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Form storage failed');
        }

        console.log(`✅ Form stored successfully on attempt ${attempt}`);
        return {
          success: true,
          data: data,
          message: 'Form stored successfully'
        };
      } catch (error) {
        console.error(`❌ Form storage attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Form storage failed after all retries'
          };
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: 'Form storage failed after all retries'
    };
  }

  /**
   * Get form structure from GCP via Railway
   */
  async getFormStructure(formId: string): Promise<RailwayResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/form/${formId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch form')
      }

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Form fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch form'
      }
    }
  }

  /**
   * Get form analytics from GCP via Railway
   */
  async getFormAnalytics(formId: string): Promise<RailwayResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/${formId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      }
    }
  }

  /**
   * Test GCP integration via Railway
   */
  async testGCPIntegration(): Promise<RailwayResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/test-gcp`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'GCP integration test failed')
      }

      return {
        success: data.success,
        data: data,
        message: data.success ? 'GCP integration working' : 'GCP integration failed'
      }
    } catch (error) {
      console.error('GCP integration test error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GCP integration test failed'
      }
    }
  }
}

// Export the client instance
export const railwayClient = new RailwayClient()
