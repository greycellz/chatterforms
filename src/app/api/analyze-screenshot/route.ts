import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FieldExtraction {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date'
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
}

export async function POST(request: NextRequest) {
  try {
    const { imageData, additionalContext } = await request.json()
    
    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '')

    const systemMessage = `You are a form analysis expert. Analyze this screenshot of a form and extract ALL visible form fields.

For each field you identify, determine:

1. **Field Label**: The visible text label (exactly as shown)
2. **Field Type**: Choose the most appropriate type:
   - text: for general text inputs, names, addresses
   - email: for email address fields
   - tel: for phone/telephone number fields  
   - textarea: for large text areas, comments, messages
   - select: for dropdown menus
   - radio: for radio button groups
   - checkbox: for single checkboxes or checkbox groups
   - date: for date picker fields

3. **Required Status**: Look for visual indicators:
   - Red asterisks (*)
   - "(required)" text
   - "(optional)" text (mark as not required)
   - Red field borders or labels

4. **Placeholder Text**: Any gray/light text inside input fields
5. **Options**: For dropdowns/radio buttons, extract ALL visible options
6. **Confidence**: Rate 0.0-1.0 how confident you are about this field

Important guidelines:
- Only extract fields you can clearly see
- Be conservative with field types - when uncertain, use "text"
- Look for form structure top to bottom
- Pay attention to groupings and sections
- Don't make assumptions about hidden fields

Return a JSON array of field objects with this exact structure:
[
  {
    "label": "Full Name",
    "type": "text", 
    "required": true,
    "placeholder": "Enter your full name",
    "confidence": 0.95
  }
]

If you see select/radio fields, include the "options" array:
{
  "label": "Gender",
  "type": "select",
  "required": false,
  "options": ["Male", "Female", "Other"],
  "confidence": 0.90
}`

    const userMessage = additionalContext 
      ? `Analyze this form screenshot. Additional context: ${additionalContext}`
      : 'Analyze this form screenshot and extract all visible form fields.'
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Updated to current vision model
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
      temperature: 0.1 // Lower temperature for more consistent extraction
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI Vision API')
    }

    console.log('Raw Vision API response:', content)

    // Try to extract JSON from the response
    let extractedFields: unknown[]
    try {
      // Look for JSON array in the response
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
      }, { status: 500 })
    }

    // Type guard function to check if object has required properties
    const isValidField = (field: unknown): field is Record<string, unknown> => {
      return (
        typeof field === 'object' && 
        field !== null && 
        'label' in field && 
        'type' in field
      )
    }

    // Validate and enhance the extracted fields
    const validatedFields: FieldExtraction[] = extractedFields
      .filter(isValidField) // Filter out invalid fields
      .map((field: Record<string, unknown>, index: number) => ({
        id: typeof field.id === 'string' ? field.id : `field_${Date.now()}_${index}`,
        label: String(field.label).trim(),
        type: ['text', 'email', 'tel', 'textarea', 'select', 'radio', 'checkbox', 'date'].includes(field.type as string) 
          ? (field.type as FieldExtraction['type'])
          : 'text' as const, // Default to text for invalid types
        required: Boolean(field.required),
        placeholder: typeof field.placeholder === 'string' ? field.placeholder.trim() : undefined,
        options: Array.isArray(field.options) 
          ? field.options.map((opt: unknown) => String(opt).trim()).filter((opt: string) => opt.length > 0)
          : undefined,
        confidence: typeof field.confidence === 'number' 
          ? Math.max(0, Math.min(1, field.confidence))
          : 0.8 // Default confidence
      }))

    console.log('Validated extracted fields:', validatedFields)

    if (validatedFields.length === 0) {
      return NextResponse.json({ 
        error: 'No valid form fields could be extracted from the image',
        suggestion: 'Please ensure the image clearly shows a form with visible field labels'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      extractedFields: validatedFields,
      fieldsCount: validatedFields.length
    })
  } catch (error) {
    console.error('Screenshot analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze screenshot', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}