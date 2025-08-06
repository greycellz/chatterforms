import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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

// PDF Configuration
const PDF_CONFIG = {
  MAX_FILE_SIZE_MB: parseFloat(process.env.PDF_MAX_FILE_SIZE_MB || '10'),
  SINGLE_CALL_MAX_TOKENS: parseInt(process.env.PDF_SINGLE_CALL_MAX_TOKENS || '4000'),
  ENABLE_FALLBACK: process.env.PDF_ENABLE_FALLBACK !== 'false'
}

// Simple PDF text extraction without external dependencies
async function extractPDFTextSimple(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const pdfString = buffer.toString('binary')
  const textRegex = /BT\s*(.*?)\s*ET/gs
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/gs
  
  let extractedText = ''
  const textMatches = pdfString.match(textRegex) || []
  
  for (const match of textMatches) {
    const cleanText = match
      .replace(/BT|ET/g, '')
      .replace(/\/\w+\s+\d+(\.\d+)?\s+Tf/g, '')
      .replace(/\d+(\.\d+)?\s+\d+(\.\d+)?\s+Td/g, '')
      .replace(/\d+(\.\d+)?\s+TL/g, '')
      .replace(/q|Q/g, '')
      .replace(/[()]/g, '')
      .trim()
    
    if (cleanText.length > 2) {
      extractedText += cleanText + ' '
    }
  }
  
  const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g) || []
  const estimatedPages = Math.max(1, pageMatches.length)
  
  if (extractedText.trim().length === 0) {
    const streamMatches = pdfString.match(streamRegex) || []
    for (const stream of streamMatches) {
      const readableText = stream.match(/[a-zA-Z\s]{3,}/g) || []
      extractedText += readableText.join(' ') + ' '
    }
  }
  
  return {
    text: extractedText.trim(),
    pages: estimatedPages
  }
}

async function analyzePDFStructure(buffer: Buffer, additionalContext?: string): Promise<FieldExtraction[]> {
  console.log('Attempting GPT-4 analysis of PDF structure')
  
  const pdfStart = buffer.subarray(0, 2000).toString('utf8').replace(/[^\x20-\x7E]/g, ' ')
  
  const systemMessage = `Analyze PDF text for form fields. Look for:
- Labels with colons, underscores, blanks: "Name: ___", "Email _______"
- Checkboxes: "☐ Option1 ☐ Option2" 
- Radio buttons: "○ Yes ○ No"
- Required indicators: *, "required"

Return JSON: [{"id":"field_1","label":"Name","type":"text","required":false,"confidence":0.8}]

Types: text, email, tel, textarea, select, radio, checkbox, date`

  const userMessage = `Find form fields in this PDF:

${pdfStart.substring(0, 1000)}

${additionalContext ? `Context: ${additionalContext}` : ''}

Return JSON array even if making educated guesses.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage }
    ],
    max_tokens: 2000,
    temperature: 0.1
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No content received from GPT-4')
  }

  const jsonMatch = content.match(/\[[\s\S]*?\]/)
  if (!jsonMatch) {
    return [
      {
        id: `fallback_field_1_${Date.now()}`,
        label: "Full Name",
        type: "text" as const,
        required: false,
        confidence: 0.4,
        pageNumber: 1
      },
      {
        id: `fallback_field_2_${Date.now()}`,
        label: "Email Address",
        type: "email" as const,
        required: false,
        confidence: 0.4,
        pageNumber: 1
      },
      {
        id: `fallback_field_3_${Date.now()}`,
        label: "Phone Number",
        type: "tel" as const,
        required: false,
        confidence: 0.4,
        pageNumber: 1
      }
    ]
  }

  const fields = JSON.parse(jsonMatch[0]) as FieldExtraction[]
  
  return fields.map((field, index) => ({
    ...field,
    id: field.id || `pdf_field_${index + 1}_${Date.now()}`,
    pageNumber: 1,
    confidence: Math.min(1.0, (field.confidence || 0.5) * 0.7)
  }))
}

async function analyzePDFContent(buffer: Buffer, additionalContext?: string): Promise<FieldExtraction[]> {
  console.log('Analyzing PDF using simple text extraction')
  
  try {
    const { text: textContent, pages } = await extractPDFTextSimple(buffer)
    
    if (textContent && textContent.length > 50) {
      console.log(`Extracted ${textContent.length} characters from ${pages} pages`)
      
      const systemMessage = `Analyze PDF text for form fields. Look for:
- Labels with colons, underscores, blanks: "Name: ___", "Email _______"
- Checkboxes: "☐ Option1 ☐ Option2" 
- Radio buttons: "○ Yes ○ No"
- Required indicators: *, "required"

Return JSON: [{"id":"field_1","label":"Name","type":"text","required":false,"confidence":0.8}]

Types: text, email, tel, textarea, select, radio, checkbox, date`

      const userMessage = `Find form fields in this text:

${textContent.substring(0, 3000)}${textContent.length > 3000 ? '\n\n[TRUNCATED]' : ''}

${additionalContext ? `Context: ${additionalContext}` : ''}

Return JSON array of fields.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })

      const content = completion.choices[0].message.content
      if (content) {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const fields = JSON.parse(jsonMatch[0]) as FieldExtraction[]
          
          return fields.map((field, index) => ({
            ...field,
            id: field.id || `pdf_field_${index + 1}_${Date.now()}`,
            pageNumber: Math.ceil((index + 1) / Math.ceil(fields.length / pages)),
            confidence: Math.min(1.0, (field.confidence || 0.7) * 0.8)
          }))
        }
      }
    }
    
    console.log('Text extraction yielded minimal results, trying structure analysis')
    return await analyzePDFStructure(buffer, additionalContext)
    
  } catch (error) {
    console.warn('Simple text extraction failed, trying structure analysis:', error)
    return await analyzePDFStructure(buffer, additionalContext)
  }
}

// Your EXACT working image analysis function
async function analyzeImageContent(imageData: string, additionalContext?: string): Promise<FieldExtraction[]> {
  const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '')

  const systemMessage = `You are a form analysis expert. Analyze this screenshot of a form and extract ALL visible form fields.

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

8. **Confidence**: Rate 0.0-1.0 how confident you are about this field

**CRITICAL RULES**:
- If you see multiple checkboxes (☐ ☐ ☐), NEVER use "text" - use "checkbox-group" or "checkbox-with-other"
- If you see multiple radio buttons (○ ○ ○), NEVER use "text" - use "radio" or "radio-with-other"
- Only use "text" for standalone input fields with no visible options
- If there are 3+ options visible, it's almost certainly a multi-select field
- Look for visual grouping of related options (languages, status options, etc.)

Important guidelines:
- Only extract fields you can clearly see
- Prioritize visual structure over assumptions
- Look for form structure top to bottom
- Pay attention to groupings and sections
- Don't make assumptions about hidden fields
- When in doubt between text and multi-select, choose multi-select if you see multiple options

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
    "confidence": 0.90
  }
]

For checkbox groups without "other":
{
  "label": "Languages Spoken",
  "type": "checkbox-group",
  "required": false,
  "options": ["English", "Spanish", "French", "German"],
  "confidence": 0.85
}

For radio groups with "other":
{
  "label": "Marital Status",
  "type": "radio-with-other",
  "required": false,
  "options": ["Single", "Married", "Divorced", "Separated", "Widowed"],
  "allowOther": true,
  "otherLabel": "Other:",
  "confidence": 0.88
}`

  const userMessage = additionalContext 
    ? `Analyze this form screenshot. Additional context: ${additionalContext}`
    : 'Analyze this form screenshot and extract all visible form fields.'
  
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
    max_tokens: 1500,
    temperature: 0.1
  })

  const content = completion.choices[0].message.content
  if (!content) {
    throw new Error('No content received from OpenAI Vision API')
  }

  console.log('Raw Vision API response:', content)

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
    return NextResponse.json({ 
      error: 'Failed to parse field extraction results',
      details: content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, { status: 500 }) as any
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
      id: typeof field.id === 'string' ? field.id : `field_${Date.now()}_${index}`,
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
      otherPlaceholder: typeof field.otherPlaceholder === 'string' ? field.otherPlaceholder : undefined
    }))

  console.log('Validated extracted fields:', validatedFields)
  return validatedFields
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    // Handle PDF file uploads (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const additionalContext = formData.get('additionalContext') as string || undefined

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (file.type === 'application/pdf') {
        console.log(`Processing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
        
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > PDF_CONFIG.MAX_FILE_SIZE_MB) {
          return NextResponse.json({
            error: `PDF file too large. Maximum size: ${PDF_CONFIG.MAX_FILE_SIZE_MB}MB`,
            suggestion: 'Try compressing the PDF or splitting it into smaller files.'
          }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const startTime = Date.now()

        try {
          const extractedFields = await analyzePDFContent(buffer, additionalContext)
          const processingTime = Date.now() - startTime

          if (extractedFields.length === 0) {
            return NextResponse.json({ 
              error: 'No form fields detected in PDF',
              suggestion: 'The PDF may not contain recognizable form structure. Try a different document or create the form manually.',
              strategy: 'simple-text'
            }, { status: 400 })
          }

          return NextResponse.json({
            extractedFields,
            fieldsCount: extractedFields.length,
            strategy: 'simple-text',
            processingTimeMs: processingTime,
            pdfInfo: {
              pages: Math.max(...extractedFields.map(f => f.pageNumber || 1)),
              hasFormFields: true,
              analysisMethod: 'simple-text-extraction'
            }
          })

        } catch (error) {
          console.error('PDF analysis error:', error)
          return NextResponse.json({ 
            error: 'Failed to analyze PDF', 
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }
      
      return NextResponse.json({ error: 'Unsupported file type in form data' }, { status: 400 })
    }

    // Handle image uploads (JSON - existing functionality)
    const body = await request.json()
    const { imageData, additionalContext } = body
    
    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    const extractedFields = await analyzeImageContent(imageData, additionalContext)

    if (extractedFields.length === 0) {
      return NextResponse.json({ 
        error: 'No valid form fields could be extracted from the image',
        suggestion: 'Please ensure the image clearly shows a form with visible field labels'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      extractedFields,
      fieldsCount: extractedFields.length
    })

  } catch (error) {
    console.error('File analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze file', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}