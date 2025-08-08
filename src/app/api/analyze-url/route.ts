import { NextRequest, NextResponse } from 'next/server'

interface FieldExtraction {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'checkbox-group' | 'radio-with-other' | 'checkbox-with-other'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
  pageNumber?: number
}

// Railway service configuration
const PUPPETEER_SERVICE_URL = process.env.PUPPETEER_SERVICE_URL || 'https://my-poppler-api-production.up.railway.app'

// Validate URL format and accessibility
function validateUrl(url: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
  try {
    // Add protocol if missing
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(normalizedUrl)
    
    // Basic validation
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' }
    }
    
    return { isValid: true, normalizedUrl }
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

// Call Railway service for screenshot capture
async function captureScreenshotWithRailway(url: string, additionalContext?: string): Promise<{
  screenshot: string
  metadata: any
  urlHash: string
}> {
  console.log('🔗 Calling Railway service for screenshot capture')
  
  try {
    const response = await fetch(`${PUPPETEER_SERVICE_URL}/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        options: {
          viewport: { width: 1280, height: 800 },
          waitTime: 4000,
          fullPage: true
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Railway service error: ${response.status} - ${errorData.error || 'Unknown error'}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Screenshot capture failed')
    }

    console.log(`✅ Screenshot captured via Railway: ${data.screenshot.cached ? 'from cache' : 'newly captured'}`)
    
    return {
      screenshot: data.screenshot.url,
      metadata: data.metadata,
      urlHash: data.urlHash
    }

  } catch (error) {
    console.error('❌ Railway service error:', error)
    throw new Error(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Analyze screenshot using OpenAI GPT-4O Vision API
async function analyzeScreenshotWithVision(imageUrl: string, additionalContext?: string, sourceUrl?: string): Promise<FieldExtraction[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const systemMessage = `You are a form analysis expert. Analyze this screenshot of a web form and extract ALL visible form fields with high accuracy.

For each field you can clearly identify on the screenshot, determine:

1. **Field Label**: The exact visible text label as shown (e.g., "Student Name (First and Last Name)", "Email Address", etc.)

2. **Field Type**: Choose the most appropriate type based on visual appearance:
   - text: single-line text inputs, general text fields
   - email: fields specifically for email (often labeled "email" or with @ symbol hints)
   - tel: phone number fields (labeled "phone", "cell", "number" etc.)
   - textarea: large multi-line text areas for longer input
   - select: dropdown menus (look for dropdown arrows ▼)
   - radio: radio button groups (○ symbols with multiple options)
   - checkbox: checkbox fields (☐ symbols, single or multiple)
   - checkbox-group: multiple related checkboxes for the same question
   - date: date picker fields (often with calendar icons or date format hints)
   - time: time picker fields

3. **Required Status**: Look for visual indicators:
   - Red asterisks (*) next to labels
   - Red text or styling
   - "(required)" or "(optional)" text
   - Form validation styling

4. **Options Extraction**: For dropdowns, radio buttons, and checkboxes:
   - Extract ALL visible options exactly as shown
   - Look for partially visible dropdown options
   - Include options like "Other", "N/A", "Prefer not to say"

5. **Placeholder Text**: Any gray/faded text inside input fields

6. **Confidence Score**: Rate 0.1-1.0 based on:
   - 1.0: Clearly visible field with obvious label and type
   - 0.8: Visible but some ambiguity in type or requirements
   - 0.6: Partially visible or unclear labeling
   - 0.4: Difficult to see or highly ambiguous

**CRITICAL ANALYSIS RULES:**
- Only extract fields you can actually see in the screenshot
- Don't assume or invent fields that "should" be there
- If text is cut off or partially visible, include what you can see
- For conditional fields (like "If other, specify..."), include them if visible
- Pay attention to form sections and groupings
- Look carefully at field borders and styling to identify input types

**QUALITY CHECKS:**
- Verify each field label matches exactly what's visible
- Ensure field types match the visual appearance
- Double-check that options are actually visible in the screenshot
- Don't include duplicate fields

Return ONLY a JSON array with this exact structure:
[
  {
    "label": "Exact field label as shown",
    "type": "field_type",
    "required": true_or_false,
    "placeholder": "placeholder text if visible",
    "options": ["option1", "option2"], // only for select/radio/checkbox fields,
    "confidence": 0.95
  }
]

If no form fields are visible in the screenshot, return an empty array: []`

  const userMessage = additionalContext 
    ? `Analyze this screenshot of a form from URL: ${sourceUrl || 'provided URL'}

Additional context: ${additionalContext}

Please extract all visible form fields with their exact labels, types, and options as they appear in the screenshot.`
    : `Analyze this screenshot of a form from URL: ${sourceUrl || 'provided URL'}

Please extract all visible form fields with their exact labels, types, and options as they appear in the screenshot.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          {
            role: "user", 
            content: [
              { type: "text", text: userMessage },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI Vision API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI Vision API')
    }

    console.log('🤖 Vision API raw response length:', content.length)
    console.log('🔍 Vision API response preview:', content.substring(0, 200) + '...')

    // Extract JSON from the response (handle markdown code blocks)
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (!jsonMatch) {
      jsonMatch = content.match(/\[[\s\S]*?\]/)
    }
    
    if (!jsonMatch) {
      console.error('No JSON found in response:', content)
      throw new Error('No JSON array found in Vision API response')
    }

    const jsonString = jsonMatch[1] || jsonMatch[0]
    
    try {
      const extractedFields = JSON.parse(jsonString) as unknown[]
      
      // Validate and format fields
      const validatedFields: FieldExtraction[] = extractedFields
        .filter((field): field is Record<string, unknown> => 
          typeof field === 'object' && 
          field !== null && 
          'label' in field && 
          'type' in field &&
          typeof field.label === 'string' &&
          field.label.trim().length > 0
        )
        .map((field, index) => {
          const validatedField: FieldExtraction = {
            id: `url_field_${Date.now()}_${index}`,
            label: String(field.label).trim(),
            type: ['text', 'email', 'tel', 'textarea', 'select', 'radio', 'checkbox', 'date', 'checkbox-group', 'radio-with-other', 'checkbox-with-other'].includes(field.type as string) 
              ? (field.type as FieldExtraction['type'])
              : 'text',
            required: Boolean(field.required),
            placeholder: typeof field.placeholder === 'string' && field.placeholder.trim() 
              ? field.placeholder.trim() 
              : undefined,
            options: Array.isArray(field.options) 
              ? field.options
                  .map((opt: unknown) => String(opt).trim())
                  .filter((opt: string) => opt.length > 0)
              : undefined,
            confidence: typeof field.confidence === 'number' 
              ? Math.max(0.1, Math.min(1, field.confidence))
              : 0.8,
            allowOther: Boolean(field.allowOther),
            otherLabel: typeof field.otherLabel === 'string' && field.otherLabel.trim()
              ? field.otherLabel.trim()
              : undefined,
            otherPlaceholder: typeof field.otherPlaceholder === 'string' && field.otherPlaceholder.trim()
              ? field.otherPlaceholder.trim()
              : undefined,
            pageNumber: 1
          }

          // Clean up options array if empty
          if (validatedField.options && validatedField.options.length === 0) {
            delete validatedField.options
          }

          return validatedField
        })

      console.log(`✅ Vision analysis complete: ${validatedFields.length} fields extracted`)
      
      if (validatedFields.length > 0) {
        console.log('📊 Field summary:', validatedFields.map(f => `${f.label} (${f.type})`).join(', '))
      }

      return validatedFields

    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Failed to parse JSON:', jsonString)
      throw new Error(`Failed to parse Vision API response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`)
    }

  } catch (error) {
    console.error('Vision API error:', error)
    throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Main URL analysis function using Railway service
async function analyzeUrlWithRailway(url: string, additionalContext?: string): Promise<FieldExtraction[]> {
  console.log('🎯 Using Railway Puppeteer service for URL analysis')
  
  try {
    // Step 1: Capture screenshot via Railway service
    const { screenshot, metadata, urlHash } = await captureScreenshotWithRailway(url, additionalContext)
    
    console.log(`📸 Screenshot captured: ${screenshot}`)
    console.log(`📊 Metadata:`, { 
      pageTitle: metadata.pageTitle, 
      loadTime: metadata.loadTime,
      cached: metadata.cached 
    })
    
    // Step 2: Analyze screenshot with Vision API
    const extractedFields = await analyzeScreenshotWithVision(screenshot, additionalContext, url)
    
    console.log(`✅ Analysis complete: ${extractedFields.length} fields found`)
    
    // Step 3: Optional cleanup of screenshot (you can decide when to do this)
    // We'll let the Railway service handle automatic cleanup after 30 minutes
    
    return extractedFields
    
  } catch (error) {
    console.error('❌ Railway URL analysis failed:', error)
    throw error
  }
}

// Main API route handler
export async function POST(request: NextRequest) {
  console.log('🚀 Starting URL analysis with Railway Puppeteer service')
  
  try {
    const { url, additionalContext } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Validate URL
    const validation = validateUrl(url)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid URL',
        details: validation.error 
      }, { status: 400 })
    }

    const normalizedUrl = validation.normalizedUrl!
    console.log(`🔗 Analyzing form at URL: ${normalizedUrl}`)

    let extractedFields: FieldExtraction[]
    const method = 'railway-puppeteer-vision'
    const startTime = Date.now()

    try {
      // Use Railway Puppeteer service
      extractedFields = await analyzeUrlWithRailway(normalizedUrl, additionalContext)
      const processingTime = Date.now() - startTime
      console.log(`✅ Analysis completed in ${processingTime}ms: ${extractedFields.length} fields found`)
      
    } catch (railwayError) {
      console.error('❌ Railway service failed:', railwayError)
      
      return NextResponse.json({ 
        error: 'Unable to analyze URL',
        details: railwayError instanceof Error ? railwayError.message : 'Unknown error',
        suggestion: 'The form may be behind authentication, require JavaScript interaction, or be inaccessible.',
        troubleshooting: [
          'Check if the URL requires login or authentication',
          'Verify the form is publicly accessible',
          'Ensure the URL contains an actual form (not just a landing page)',
          'Try taking a screenshot of the form and uploading it instead',
          'Some complex forms with heavy JavaScript may not be analyzable'
        ],
        alternatives: [
          'Use the "Attach Form Screenshot" option instead',
          'Copy the form fields manually and describe them in the chat',
          'Check if the form has a simpler direct link'
        ],
        serviceStatus: {
          railwayService: 'failed',
          fallbackAvailable: false
        }
      }, { status: 500 })
    }

    // Check if any fields were found
    if (extractedFields.length === 0) {
      return NextResponse.json({ 
        error: 'No form fields detected at URL',
        suggestion: 'The page may not contain a recognizable form, or the form may be dynamically loaded.',
        url: normalizedUrl,
        method,
        possibleReasons: [
          'The page might not contain a form',
          'The form might be loaded dynamically after our analysis',
          'The form might be hidden behind user interactions (clicks, scrolls)',
          'The form might be in an iframe or embedded component',
          'The page might show different content to automated tools'
        ],
        alternatives: [
          'Try taking a manual screenshot of the form and uploading it',
          'Check if you need to interact with the page first (click buttons, etc.)',
          'Verify the URL shows the actual form when you visit it manually'
        ]
      }, { status: 400 })
    }

    // Success response
    const processingTime = Date.now() - startTime
    console.log(`🎉 URL analysis complete: ${extractedFields.length} fields using ${method} in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      extractedFields,
      fieldsCount: extractedFields.length,
      url: normalizedUrl,
      method,
      processingTimeMs: processingTime,
      message: `Successfully extracted ${extractedFields.length} fields from URL using Railway screenshot service`,
      methodology: 'This method captures a screenshot via Railway Puppeteer service and analyzes it with AI vision for maximum accuracy',
      confidenceRange: {
        min: Math.min(...extractedFields.map(f => f.confidence)),
        max: Math.max(...extractedFields.map(f => f.confidence)),
        average: extractedFields.reduce((sum, f) => sum + f.confidence, 0) / extractedFields.length
      },
      serviceInfo: {
        screenshotService: 'railway-puppeteer',
        visionService: 'openai-gpt4o',
        cacheEnabled: true
      }
    })

  } catch (error) {
    console.error('❌ URL analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze URL', 
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please try again or use the screenshot upload option instead'
    }, { status: 500 })
  }
}