import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Generate a unique form ID
function generateFormId(): string {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const { formSchema, submitButtonText, existingFormId } = await request.json()
    
    if (!formSchema || !formSchema.fields || formSchema.fields.length === 0) {
      return NextResponse.json({ error: 'Invalid form schema' }, { status: 400 })
    }

    let formId = existingFormId

    // If we have an existing form ID, try to update the existing form
    if (existingFormId) {
      try {
        const existingForm = await redis.get(`form:${existingFormId}`)
        if (existingForm) {
          // Form exists, we'll update it with the same ID
          formId = existingFormId
          console.log(`Updating existing form with ID: ${formId}`)
        } else {
          // Form doesn't exist anymore, generate new ID
          formId = generateFormId()
          console.log(`Existing form not found, generating new ID: ${formId}`)
        }
      } catch (error) {
        console.warn('Error checking existing form:', error)
        // If there's an error checking, generate new ID as fallback
        formId = generateFormId()
      }
    } else {
      // No existing ID provided, generate new one
      formId = generateFormId()
      console.log(`No existing form ID, generating new ID: ${formId}`)
    }
    
    // Get existing form data if updating
    let existingFormData: {
      createdAt?: string
      submissions?: unknown[]
    } | null = null
    if (existingFormId) {
      try {
        existingFormData = await redis.get(`form:${existingFormId}`) as {
          createdAt?: string
          submissions?: unknown[]
        } | null
      } catch (error) {
        console.warn('Error getting existing form data:', error)
      }
    }

    // Save form schema to Redis with button text
    const formData = {
      id: formId,
      schema: {
        ...formSchema,
        formId // Ensure the schema includes the formId
      },
      createdAt: existingFormData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(), // Track when it was last updated
      submissions: existingFormData?.submissions || [],
      submitButtonText: submitButtonText || 'Submit Form'
    }
    
    await redis.set(`form:${formId}`, formData)
    
    const isUpdate = existingFormId === formId
    
    return NextResponse.json({ 
      formId,
      url: `/forms/${formId}`,
      isUpdate // Let the client know if this was an update or new form
    })
  } catch (error) {
    console.error('Form publishing error:', error)
    return NextResponse.json({ 
      error: 'Failed to publish form', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}