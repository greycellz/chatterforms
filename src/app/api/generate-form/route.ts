import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { description, currentForm, isEdit } = await request.json()
    
    let systemMessage, userMessage

    if (isEdit && currentForm) {
      systemMessage = `You are a form editor. You receive a current form schema and instructions to modify it. Return ONLY the complete updated JSON form schema in this exact format:
{
  "title": "Form Title",
  "fields": [
    {
      "id": "unique_id",
      "type": "text|email|tel|textarea|select|checkbox|radio|date",
      "label": "Field Label",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"] // only for select/radio
    }
  ]
}

IMPORTANT: 
- Keep all existing fields unless specifically told to remove them
- Add new fields in the requested position (after, before, etc.)
- Generate unique IDs for new fields
- Maintain the structure and formatting of existing fields`

      userMessage = `Current form:
${JSON.stringify(currentForm, null, 2)}

Instructions: ${description}

Return the complete updated form schema.`
    } else {
      systemMessage = `You are a form generator. Return ONLY valid JSON in this exact format:
{
  "title": "Form Title",
  "fields": [
    {
      "id": "unique_id",
      "type": "text|email|tel|textarea|select|checkbox|radio|date",
      "label": "Field Label",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"] // only for select/radio
    }
  ]
}`

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

    const formSchema = JSON.parse(content)

    console.log('Form Schema: ',formSchema)
    
    return NextResponse.json({ formSchema })
  } catch (error) {
    console.error('Form generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate form', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}