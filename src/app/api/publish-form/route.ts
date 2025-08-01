import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Generate a unique form ID
function generateFormId(): string {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const { formSchema, submitButtonText } = await request.json()
    
    if (!formSchema || !formSchema.fields || formSchema.fields.length === 0) {
      return NextResponse.json({ error: 'Invalid form schema' }, { status: 400 })
    }

    const formId = generateFormId()
    
    // Save form schema to Redis with button text
    const formData = {
      id: formId,
      schema: formSchema,
      createdAt: new Date().toISOString(),
      submissions: [],
      submitButtonText: submitButtonText || 'Submit Form' // Include button text
    }
    
    await redis.set(`form:${formId}`, formData)
    
    return NextResponse.json({ 
      formId,
      url: `/forms/${formId}`
    })
  } catch (error) {
    console.error('Form publishing error:', error)
    return NextResponse.json({ 
      error: 'Failed to publish form', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}