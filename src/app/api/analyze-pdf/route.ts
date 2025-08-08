import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const POPPLER_API_URL = process.env.POPPLER_API_URL || 'https://my-poppler-api-production.up.railway.app'

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

interface PopplerResponse {
  success: boolean
  uuid: string
  totalPages: number
  images: Array<{
    page: number
    filename: string
    url: string
    size: number
  }>
  message?: string
  error?: string
  details?: string
}

interface _PageSelection {
  pages: number[]
  selectAll?: boolean
}

// Convert PDF to PNG images using Poppler API
async function convertPDFToImages(buffer: Buffer): Promise<PopplerResponse> {
  const formData = new FormData()
  const blob = new Blob([buffer], { type: 'application/pdf' })
  formData.append('pdf', blob, 'document.pdf')

  const response = await fetch(`${POPPLER_API_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json() as PopplerResponse
  
  if (!response.ok || !result.success) {
    throw new Error(result.error || result.details || 'Failed to convert PDF to images')
  }

  return result
}

// Cleanup files from Poppler API
async function cleanupPopplerFiles(uuid: string): Promise<void> {
  try {
    await fetch(`${POPPLER_API_URL}/cleanup/${uuid}`, {
      method: 'DELETE',
    })
    console.log(`🗑️ Cleaned up Poppler files for UUID: ${uuid}`)
  } catch (error) {
    console.warn(`⚠️ Failed to cleanup Poppler files for UUID: ${uuid}`, error)
  }
}

// Analyze images using GPT-4O Vision API
async function analyzeImagesWithGPT(imageUrls: string[], additionalContext?: string): Promise<FieldExtraction[]> {
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

3. **Key Visual Patterns to Detect**:
   - **Multiple Checkboxes**: Look for ☐ ☐ ☐ patterns = use "checkbox-group" or "checkbox-with-other"
   - **Multiple Radio Buttons**: Look for ○ ○ ○ patterns = use "radio" or "radio-with-other"
   - **Text Lines After Options**: If you see checkboxes/radio + blank line = add "Other" support
   - **"Other:" Labels**: Explicit "Other:" text = definitely use "-with-other" variants
   - **Single Text Box**: Only use "text" for standalone input fields, NOT for option lists

4. **Required Status**: Look for visual indicators:
   - Red asterisks (*)
   - "(required)" text
   - "(optional)" text (mark as not required)
   - Red field borders or labels

5. **Options Extraction**: For dropdowns/radio buttons/checkboxes, extract ALL visible options

6. **"Other" Field Detection**: Look for patterns like:
   - "Other:" followed by blank lines or text inputs
   - "Other (specify):" with text fields
   - "Please specify:" or "Please describe:"
   - Blank lines after option lists
   - Text inputs next to the last option in a group

7. **Multi-selection indicators**: Look for:
   - "Select all that apply"
   - "Check all that apply" 
   - Multiple checkboxes for same category
   - "Choose multiple" instructions

8. **Page Number**: IMPORTANT - Include the page number where each field is found

9. **Confidence**: Rate 0.0-1.0 how confident you are about this field

**CRITICAL RULES**:
- If you see multiple checkboxes (☐ ☐ ☐), NEVER use "text" - use "checkbox-group" or "checkbox-with-other"
- If you see multiple radio buttons (○ ○ ○), NEVER use "text" - use "radio" or "radio-with-other"
- Only use "text" for standalone input fields with no visible options
- If there are 3+ options visible, it's almost certainly a multi-select field
- Look for visual grouping of related options (languages, status options, etc.)
- ALWAYS include pageNumber for each field

Important guidelines:
- Only extract fields you can clearly see
- Prioritize visual structure over assumptions
- Look for form structure top to bottom
- Pay attention to groupings and sections
- Don't make assumptions about hidden fields
- When in doubt between text and multi-select, choose multi-select if you see multiple options
- Each image represents one page of a multi-page form

Return a JSON array of field objects with this exact structure:
[
  {
    "label": "Primary Language",
    "type": "checkbox-with-other", 
    "required": false,
    "options": ["English", "Spanish"],
    "allowOther": true,
    "otherLabel": "Other:",
    "otherPlaceholder": "Please specify language",
    "confidence": 0.90,
    "pageNumber": 1
  }
]`

  const userMessage = additionalContext 
    ? `Analyze these PDF form pages and extract all visible form fields. Additional context: ${additionalContext}`
    : 'Analyze these PDF form pages and extract all visible form fields.'

  const imageContent = imageUrls.map(url => ({
    type: "image_url" as const,
    image_url: {
      url: url,
      detail: "high" as const
    }
  }))

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user", 
        content: [
          {
            type: "text",
            text: userMessage
          },
          ...imageContent
        ]
      }
    ],
    max_tokens: 10000,
    temperature: 0.1
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No content received from OpenAI Vision API')
  }

  console.log('Raw GPT-4O Vision API response:', content)

  let extractedFields: unknown[]
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      extractedFields = JSON.parse(jsonMatch[0]) as unknown[]
    } else {
      throw new Error('No JSON array found in response')
    }
  } catch (parseError) {
    console.error('JSON parsing error:', parseError)
    throw new Error(`Failed to parse field extraction results: ${content}`)
  }

  const isValidField = (field: unknown): field is Record<string, unknown> => {
    return (
      typeof field === 'object' && 
      field !== null && 
      'label' in field && 
      'type' in field
    )
  }

  const validatedFields: FieldExtraction[] = extractedFields
    .filter(isValidField)
    .map((field: Record<string, unknown>, index: number) => ({
      id: typeof field.id === 'string' ? field.id : `pdf_field_${Date.now()}_${index}`,
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
      pageNumber: typeof field.pageNumber === 'number' ? field.pageNumber : 1
    }))

  console.log(`Validated ${validatedFields.length} fields from PDF pages`)
  return validatedFields
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdfBuffer, additionalContext, pageSelection } = body

    if (!pdfBuffer) {
      return NextResponse.json({ error: 'No PDF data provided' }, { status: 400 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(pdfBuffer, 'base64')
    
    if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({
        error: 'PDF file too large. Maximum size: 10MB',
        suggestion: 'Try compressing the PDF or splitting it into smaller files.'
      }, { status: 400 })
    }

    console.log(`📄 Processing PDF (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`)

    // Step 1: Convert PDF to images
    let popplerResponse: PopplerResponse
    try {
      popplerResponse = await convertPDFToImages(buffer)
    } catch (error) {
      console.error('Poppler API error:', error)
      return NextResponse.json({ 
        error: 'Failed to convert PDF to images',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please try again. If the problem persists, try a different PDF.'
      }, { status: 500 })
    }

    console.log(`✅ PDF converted: ${popplerResponse.totalPages} pages, UUID: ${popplerResponse.uuid}`)

    // Step 2: Handle page selection for PDFs with >10 pages
    if (!pageSelection && popplerResponse.totalPages > 10) {
      // Return page preview for user selection
      return NextResponse.json({
        needsPageSelection: true,
        uuid: popplerResponse.uuid,
        totalPages: popplerResponse.totalPages,
        pages: popplerResponse.images.map(img => ({
          page: img.page,
          url: img.url,
          filename: img.filename
        })),
        message: `PDF has ${popplerResponse.totalPages} pages. Please select which pages to analyze (max 10 per batch).`
      })
    }

    // Step 3: Determine pages to process
    let pagesToProcess: number[]
    if (pageSelection?.pages) {
      pagesToProcess = pageSelection.pages.slice(0, 10) // Limit to 10 pages per batch
    } else if (pageSelection?.selectAll) {
      pagesToProcess = popplerResponse.images.slice(0, 10).map(img => img.page)
    } else {
      // Process all pages up to 10
      pagesToProcess = popplerResponse.images.slice(0, 10).map(img => img.page)
    }

    // Step 4: Get URLs for selected pages
    const selectedImages = popplerResponse.images.filter(img => pagesToProcess.includes(img.page))
    const imageUrls = selectedImages.map(img => img.url)

    console.log(`🔍 Analyzing ${selectedImages.length} pages: [${pagesToProcess.join(', ')}]`)

    // Step 5: Analyze images with GPT-4O
    let extractedFields: FieldExtraction[]
    try {
      extractedFields = await analyzeImagesWithGPT(imageUrls, additionalContext)
    } catch (error) {
      console.error('GPT-4O analysis error:', error)
      // Cleanup before returning error
      await cleanupPopplerFiles(popplerResponse.uuid)
      return NextResponse.json({ 
        error: 'Failed to analyze PDF pages',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please try again with a clearer PDF or different pages.'
      }, { status: 500 })
    }

    // Step 6: Cleanup Poppler files
    await cleanupPopplerFiles(popplerResponse.uuid)

    if (extractedFields.length === 0) {
      return NextResponse.json({ 
        error: 'No form fields detected in PDF',
        suggestion: 'The PDF may not contain recognizable form structure. Try different pages or create the form manually.',
        processedPages: pagesToProcess
      }, { status: 400 })
    }

    console.log(`✅ Analysis complete: ${extractedFields.length} fields extracted`)

    return NextResponse.json({
      success: true,
      extractedFields,
      fieldsCount: extractedFields.length,
      processedPages: pagesToProcess,
      totalPages: popplerResponse.totalPages,
      processingMethod: 'poppler-gpt4o',
      uuid: popplerResponse.uuid // For reference
    })

  } catch (error) {
    console.error('PDF analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze PDF', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}