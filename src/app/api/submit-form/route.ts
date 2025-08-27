import { NextRequest, NextResponse } from 'next/server'
import { railwayClient } from '@/lib/railway-client'

interface FormSubmission {
  id: string
  data: Record<string, string | boolean | string[]>
  submittedAt: string
  ipAddress?: string
}

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormSchema {
  title: string
  fields: FormField[]
}

interface FormData {
  id: string
  schema: FormSchema
  createdAt: string
  submissions: FormSubmission[]
}

function generateSubmissionId(): string {
  return 'sub_' + Math.random().toString(36).substring(2, 15)
}

export async function POST(request: NextRequest) {
  try {
    const { formId, data } = await request.json()
    
    if (!formId || !data) {
      return NextResponse.json({ error: 'Missing form ID or data' }, { status: 400 })
    }

    // Create new submission
    const submission: FormSubmission = {
      id: generateSubmissionId(),
      data,
      submittedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    }

    // Submit form data to GCP via Railway
    try {
      const result = await railwayClient.submitForm({
        formId,
        formData: data,
        userId: 'anonymous', // TODO: Add user authentication
        isHipaa: false, // TODO: Add HIPAA detection
        metadata: {
          ipAddress: submission.ipAddress,
          userAgent: request.headers.get('user-agent') || undefined,
          timestamp: submission.submittedAt
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Form submission failed')
      }

      console.log(`✅ Form submission stored in GCP: ${submission.id}`)
    } catch (error) {
      console.error('❌ Failed to submit form to GCP:', error)
      throw new Error('Failed to submit form to GCP')
    }

    return NextResponse.json({ 
      success: true,
      submissionId: submission.id
    })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json({ 
      error: 'Failed to submit form', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}