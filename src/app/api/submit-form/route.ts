import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

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

    // Read the existing form data
    let formData: FormData
    try {
      const data = await redis.get(`form:${formId}`)
      if (!data) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 })
      }
      formData = data as FormData
    } catch {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Create new submission
    const submission: FormSubmission = {
      id: generateSubmissionId(),
      data,
      submittedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    }

    // Add submission to form data
    formData.submissions.push(submission)

    // Save updated form data to Redis
    await redis.set(`form:${formId}`, formData)

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