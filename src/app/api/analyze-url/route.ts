import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import puppeteer from 'puppeteer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

// Method 1: Try OpenAI web browsing (if available)
async function analyzeUrlWithOpenAI(url: string, additionalContext?: string): Promise<FieldExtraction[]> {
  const systemMessage = `You are a form analysis expert. Visit the provided URL and analyze the form on that page to extract ALL visible form fields.

For each field you identify, determine:

1. **Field Label**: The visible text label (exactly as shown)
2. **Field Type**: Choose the most appropriate type:
   - text: single-line text inputs
   - email: email address fields  
   - tel: phone number fields
   - textarea: large text areas
   - select: dropdown menus
   - radio: radio button groups
   - checkbox: single checkboxes
   - checkbox-group: multiple related checkboxes
   - radio-with-other: radio buttons with "Other" option
   - checkbox-with-other: checkbox groups with "Other" option
   - date: date picker fields

3. **Required Status**: Look for asterisks (*), "required" text, or visual indicators
4. **Options**: For dropdowns/radio/checkboxes, extract all visible options
5. **Other Fields**: Detect "Other" options with text inputs
6. **Confidence**: Rate 0.0-1.0 how confident you are

**CRITICAL RULES**:
- Only extract fields that are clearly visible on the page
- Look for form structure, labels, and input elements
- If you see multiple checkboxes/radios, use appropriate group types
- Focus on the main form, ignore navigation or footer elements

Return a JSON array with this structure:
[
  {
    "label": "Email Address",
    "type": "email", 
    "required": true,
    "placeholder": "Enter your email",
    "confidence": 0.95,
    "pageNumber": 1
  }
]`

  const userMessage = additionalContext 
    ? `Please visit this URL and analyze the form: ${url}\n\nAdditional context: ${additionalContext}`
    : `Please visit this URL and analyze the form: ${url}`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage }
    ],
    max_tokens: 4000,
    temperature: 0.1
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No content received from OpenAI')
  }

  console.log('OpenAI web browsing response:', content)

  // Parse JSON response
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('No JSON array found in OpenAI response')
  }

  const fields = JSON.parse(jsonMatch[0]) as FieldExtraction[]
  return fields.map((field, index) => ({
    ...field,
    id: field.id || `url_field_${Date.now()}_${index}`,
    pageNumber: 1 // Single page analysis
  }))
}

// Method 2: Puppeteer screenshot + GPT-4O Vision fallback
async function analyzeUrlWithPuppeteer(url: string, additionalContext?: string): Promise<FieldExtraction[]> {
  console.log('Using Puppeteer fallback method')
  
  let browser
  try {
    // Launch browser
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
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Navigate to URL with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    })

    // Wait for potential dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Take screenshot
    const screenshot = await page.screenshot({ 
      fullPage: true,
      type: 'png'
    })

    // Convert to base64
    const base64Screenshot = `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`

    // Use existing vision analysis function
    return await analyzeScreenshotWithVision(base64Screenshot, additionalContext)
    
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Reuse existing vision analysis logic
async function analyzeScreenshotWithVision(imageData: string, additionalContext?: string): Promise<FieldExtraction[]> {
  const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '')

  const systemMessage = `You are a form analysis expert. Analyze this screenshot of a web form and extract ALL visible form fields.

[Same detailed system message as your existing analyze-screenshot route...]`

  const userMessage = additionalContext 
    ? `Analyze this form screenshot from a web URL. Additional context: ${additionalContext}`
    : 'Analyze this form screenshot from a web URL.'

  const completion = await openai.chat.completions.create({
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
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 4000,
    temperature: 0.1
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No content received from OpenAI Vision API')
  }

  console.log('Puppeteer + Vision API response:', content)

  // Parse JSON (same logic as existing)
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('No JSON array found in response')
  }

  const extractedFields = JSON.parse(jsonMatch[0]) as unknown[]
  
  // Validate and format fields (reuse existing validation logic)
  const validatedFields: FieldExtraction[] = extractedFields
    .filter((field): field is Record<string, unknown> => 
      typeof field === 'object' && field !== null && 'label' in field && 'type' in field
    )
    .map((field, index) => ({
      id: typeof field.id === 'string' ? field.id : `url_field_${Date.now()}_${index}`,
      label: String(field.label).trim(),
      type: ['text', 'email', 'tel', 'textarea', 'select', 'radio', 'checkbox', 'date', 'checkbox-group', 'radio-with-other', 'checkbox-with-other'].includes(field.type as string) 
        ? (field.type as FieldExtraction['type'])
        : 'text' as const,
      required: Boolean(field.required),
      placeholder: typeof field.placeholder === 'string' ? field.placeholder.trim() : undefined,
      options: Array.isArray(field.options) 
        ? field.options.map((opt: unknown) => String(opt).trim()).filter((opt: string) => opt.length > 0)
        : undefined,
      confidence: typeof field.confidence === 'number' 
        ? Math.max(0, Math.min(1, field.confidence))
        : 0.8,
      allowOther: Boolean(field.allowOther),
      otherLabel: typeof field.otherLabel === 'string' ? field.otherLabel : undefined,
      otherPlaceholder: typeof field.otherPlaceholder === 'string' ? field.otherPlaceholder : undefined,
      pageNumber: 1
    }))

  return validatedFields
}

export async function POST(request: NextRequest) {
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
    let method = 'unknown'

    try {
      // Method 1: Try OpenAI web browsing first
      console.log('Attempting OpenAI web browsing...')
      extractedFields = await analyzeUrlWithOpenAI(normalizedUrl, additionalContext)
      method = 'openai-browsing'
      console.log(`✅ OpenAI browsing succeeded: ${extractedFields.length} fields`)
      
    } catch (openaiError) {
      console.log('OpenAI browsing failed, trying Puppeteer fallback...')
      console.error('OpenAI error:', openaiError)
      
      try {
        // Method 2: Puppeteer + Vision fallback
        extractedFields = await analyzeUrlWithPuppeteer(normalizedUrl, additionalContext)
        method = 'puppeteer-vision'
        console.log(`✅ Puppeteer fallback succeeded: ${extractedFields.length} fields`)
        
      } catch (puppeteerError) {
        console.error('Puppeteer error:', puppeteerError)
        return NextResponse.json({ 
          error: 'Failed to analyze URL with both methods',
          details: `OpenAI: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}, Puppeteer: ${puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error'}`,
          suggestion: 'The form may be behind authentication, use JavaScript heavily, or be inaccessible. Try taking a screenshot instead.'
        }, { status: 500 })
      }
    }

    if (extractedFields.length === 0) {
      return NextResponse.json({ 
        error: 'No form fields detected at URL',
        suggestion: 'The page may not contain a recognizable form, or the form may be dynamically loaded. Try a screenshot instead.',
        url: normalizedUrl,
        method
      }, { status: 400 })
    }

    console.log(`✅ URL analysis complete: ${extractedFields.length} fields using ${method}`)

    return NextResponse.json({
      success: true,
      extractedFields,
      fieldsCount: extractedFields.length,
      url: normalizedUrl,
      method,
      message: `Successfully extracted ${extractedFields.length} fields from URL using ${method}`
    })

  } catch (error) {
    console.error('URL analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze URL', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}