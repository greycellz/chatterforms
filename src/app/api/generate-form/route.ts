import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FieldExtraction {
  id: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: string[]
  confidence: number
  additionalContext?: string
  allowOther?: boolean
  otherLabel?: string
  otherPlaceholder?: string
}

export async function POST(request: NextRequest) {
  try {
    const { description, currentForm, isEdit, extractedFields } = await request.json()
    
    console.log('Generate form request received:', {
      hasDescription: !!description,
      hasCurrentForm: !!currentForm,
      isEdit,
      extractedFieldsCount: extractedFields?.length || 0
    })

    if (extractedFields) {
      console.log('Extracted fields sample:', extractedFields.slice(0, 3))
    }
    
    let systemMessage, userMessage

    if (extractedFields && extractedFields.length > 0) {
      // Handle form generation from extracted screenshot fields
      systemMessage = `You are a form generator. You will receive extracted field data from a screenshot analysis and create a proper form schema.

Return ONLY valid JSON in this exact format:
{
  "title": "Form Title",
  "fields": [
    {
      "id": "unique_id",
      "type": "text|email|tel|textarea|select|checkbox|radio|date|checkbox-group|radio-with-other|checkbox-with-other",
      "label": "Field Label",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"],
      "allowOther": true|false,
      "otherLabel": "Other:",
      "otherPlaceholder": "Please specify..."
    }
  ]
}

IMPORTANT RULES:
- Generate a meaningful form title based on the fields (e.g., "Patient Information Form", "Contact Details Form")
- Use the exact field labels provided from the screenshot analysis
- Maintain the field types exactly as specified (including checkbox-group, radio-with-other, checkbox-with-other)
- Preserve required/optional status exactly as provided
- Keep placeholder text and options exactly as provided
- For fields with allowOther: true, preserve otherLabel and otherPlaceholder
- Generate unique IDs for each field (e.g., "first_name", "primary_language", "marital_status")
- Only include options array for fields that have options (select, radio, checkbox-group, radio-with-other, checkbox-with-other)
- Only include allowOther, otherLabel, otherPlaceholder for radio-with-other and checkbox-with-other fields`

      const fieldsDescription = extractedFields.map((field: FieldExtraction) => {
        let desc = `${field.label} (${field.type}${field.required ? ', required' : ', optional'})`
        if (field.placeholder) desc += ` placeholder: "${field.placeholder}"`
        if (field.options) desc += ` options: [${field.options.join(', ')}]`
        if (field.allowOther) {
          desc += ` allowOther: true`
          if (field.otherLabel) desc += ` otherLabel: "${field.otherLabel}"`
          if (field.otherPlaceholder) desc += ` otherPlaceholder: "${field.otherPlaceholder}"`
        }
        return desc
      }).join('\n')

      const additionalContext = extractedFields.find((f: FieldExtraction) => f.additionalContext)?.additionalContext

      userMessage = `Create a form from these extracted fields:\n${fieldsDescription}${additionalContext ? `\n\nAdditional instructions: ${additionalContext}` : ''}${description ? `\n\nUser instructions: ${description}` : ''}`

    } else if (isEdit && currentForm) {
      // Handle form editing
      systemMessage = `You are a form editor. You receive a current form schema and instructions to modify it. Return ONLY the complete updated JSON form schema in this exact format:
{
  "title": "Form Title",
  "fields": [
    {
      "id": "unique_id",
      "type": "text|email|tel|textarea|select|checkbox|radio|date|checkbox-group|radio-with-other|checkbox-with-other",
      "label": "Field Label",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"], // only for select/radio/checkbox-group/radio-with-other/checkbox-with-other
      "allowOther": true|false, // only for radio-with-other/checkbox-with-other
      "otherLabel": "Other:", // only for radio-with-other/checkbox-with-other
      "otherPlaceholder": "Please specify..." // only for radio-with-other/checkbox-with-other
    }
  ]
}

IMPORTANT: 
- Keep all existing fields unless specifically told to remove them
- Add new fields in the requested position (after, before, etc.)
- Generate unique IDs for new fields
- Maintain the structure and formatting of existing fields
- Support new field types: checkbox-group, radio-with-other, checkbox-with-other
- Preserve allowOther, otherLabel, and otherPlaceholder properties when present`

      userMessage = `Current form:
${JSON.stringify(currentForm, null, 2)}

Instructions: ${description}

Return the complete updated form schema.`
    } else {
      // Handle new form creation
      systemMessage = `You are a form generator. Return ONLY valid JSON in this exact format:
{
  "title": "Form Title",
  "fields": [
    {
      "id": "unique_id",
      "type": "text|email|tel|textarea|select|checkbox|radio|date|checkbox-group|radio-with-other|checkbox-with-other",
      "label": "Field Label",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"], // only for select/radio/checkbox-group/radio-with-other/checkbox-with-other
      "allowOther": true|false, // only for radio-with-other/checkbox-with-other
      "otherLabel": "Other:", // only for radio-with-other/checkbox-with-other
      "otherPlaceholder": "Please specify..." // only for radio-with-other/checkbox-with-other
    }
  ]
}

Field type guidelines:
- Use "checkbox-group" for multiple related checkboxes (like languages spoken)
- Use "radio-with-other" for radio buttons that include an "Other" text field
- Use "checkbox-with-other" for checkbox groups that include an "Other" text field
- Set allowOther: true for fields with "Other" options
- Include otherLabel and otherPlaceholder for "Other" fields`

      userMessage = `Create a form for: ${description}`
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: userMessage
        }
      ],
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    console.log('Raw form generation response:', content)

    let formSchema
    try {
      formSchema = JSON.parse(content)
    } catch (parseError) {
      console.error('Form generation JSON parse error:', parseError)
      console.error('Content that failed to parse:', content)
      throw new Error('Failed to parse form generation response')
    }

    // Validate the form schema structure
    if (!formSchema.title || !formSchema.fields || !Array.isArray(formSchema.fields)) {
      console.error('Invalid form schema structure:', formSchema)
      throw new Error('Generated form schema has invalid structure')
    }

    console.log('Generated Form Schema:', JSON.stringify(formSchema, null, 2))
    
    return NextResponse.json({ formSchema })
  } catch (error) {
    console.error('Form generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate form', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}