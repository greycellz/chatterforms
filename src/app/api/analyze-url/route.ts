import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

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

// Primary Method: Puppeteer screenshot + GPT-4O Vision
async function analyzeUrlWithPuppeteer(url: string, additionalContext?: string): Promise<FieldExtraction[]> {
  console.log('🎯 Using Puppeteer + Vision for URL analysis (most reliable method)')
  
  let browser
  try {
    // Launch browser with optimized settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    })

    const page = await browser.newPage()
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Set extra headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    })

    console.log(`📄 Navigating to URL: ${url}`)
    
    // Navigate to URL with extended timeout and wait conditions
    await page.goto(url, { 
      waitUntil: 'networkidle0', // Wait until no network requests for 500ms
      timeout: 45000 // 45 second timeout
    })

    // Wait for potential dynamic content and form rendering
    console.log('⏳ Waiting for dynamic content to load...')
    await new Promise(resolve => setTimeout(resolve, 4000)) // 4 second wait

    // Try to scroll down to ensure all form elements are loaded
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0
        const distance = 100
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            // Scroll back to top
            window.scrollTo(0, 0)
            setTimeout(resolve, 1000) // Wait 1 second after scrolling back to top
          }
        }, 100)
      })
    })

    console.log('📸 Taking screenshot of the form...')
    
    // Take full page screenshot
    const screenshot = await page.screenshot({ 
      fullPage: true,
      type: 'png'
      // Note: quality option only works with 'jpeg', not 'png'
    })

    // Convert to base64
    const base64Screenshot = `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`

    console.log('🤖 Analyzing screenshot with AI Vision...')
    
    // Analyze the screenshot with Vision AI
    return await analyzeScreenshotWithVision(base64Screenshot, additionalContext, url)
    
  } catch (error) {
    console.error('Puppeteer error:', error)
    throw new Error(`Failed to capture or analyze webpage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    if (browser) {
      await browser.close()
      console.log('🔒 Browser closed')
    }
  }
}

// Vision analysis using OpenAI GPT-4O
async function analyzeScreenshotWithVision(imageData: string, additionalContext?: string, sourceUrl?: string): Promise<FieldExtraction[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '')

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
    "options": ["option1", "option2"] // only for select/radio/checkbox fields,
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
                  url: `data:image/png;base64,${base64Image}`,
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

// Main API route handler
export async function POST(request: NextRequest) {
  console.log('🚀 Starting URL analysis with Puppeteer-first approach')
  
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
    const method = 'chatterforms-vision'
    const startTime = Date.now()

    try {
      // Use Puppeteer + Vision approach (most reliable)
      extractedFields = await analyzeUrlWithPuppeteer(normalizedUrl, additionalContext)
      const processingTime = Date.now() - startTime
      console.log(`✅ Analysis completed in ${processingTime}ms: ${extractedFields.length} fields found`)
      
    } catch (puppeteerError) {
      console.error('❌ Puppeteer + Vision failed:', puppeteerError)
      
      return NextResponse.json({ 
        error: 'Unable to analyze URL',
        details: puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error',
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
        ]
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
      message: `Successfully extracted ${extractedFields.length} fields from URL using reliable screenshot analysis`,
      methodology: 'This method takes a screenshot of the live form and analyzes it with AI vision for maximum accuracy',
      confidenceRange: {
        min: Math.min(...extractedFields.map(f => f.confidence)),
        max: Math.max(...extractedFields.map(f => f.confidence)),
        average: extractedFields.reduce((sum, f) => sum + f.confidence, 0) / extractedFields.length
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