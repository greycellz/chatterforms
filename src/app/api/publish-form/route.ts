import { NextRequest, NextResponse } from 'next/server'
import { railwayClient } from '@/lib/railway-client'

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
        // Check if form exists in GCP (we'll use the same ID if it exists)
        formId = existingFormId
        console.log(`Updating existing form with ID: ${formId}`)
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

    // Prepare form data for GCP storage
    const formData = {
      id: formId,
      schema: {
        ...formSchema,
        formId // Ensure the schema includes the formId
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), // Track when it was last updated
      submissions: [],
      submitButtonText: submitButtonText || 'Submit Form',
      isPublished: true
    }
    
    // Store form in GCP via Railway
    try {
      console.log(`📝 Storing form in GCP with ID: ${formId}`)
      console.log(`📝 Form data structure:`, JSON.stringify(formData, null, 2))
      
      const result = await railwayClient.storeFormStructure(
        formData,
        'anonymous', // TODO: Add user authentication
        {
          source: 'form-publishing',
          isUpdate: !!existingFormId,
          submitButtonText: submitButtonText || 'Submit Form',
          isPublished: true
        }
      )
      
      if (!result.success) {
        console.error('❌ Failed to store form in GCP:', result.error)
        throw new Error(`Failed to publish form to GCP: ${result.error}`)
      }
      
      console.log(`✅ Form stored in GCP: ${formId}`)
    } catch (error) {
      console.error('❌ Failed to store form in GCP:', error)
      throw new Error('Failed to publish form to GCP')
    }
    
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