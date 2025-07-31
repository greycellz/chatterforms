import { notFound } from 'next/navigation'
import { Redis } from '@upstash/redis'
import PublicFormClient from './PublicFormClient'

const redis = Redis.fromEnv()

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

interface FormSubmission {
  id: string
  data: Record<string, string | boolean | string[]>
  submittedAt: string
  ipAddress?: string
}

interface FormData {
  id: string
  schema: FormSchema
  createdAt: string
  submissions: FormSubmission[]
}

async function getFormData(formId: string): Promise<FormData | null> {
  try {
    const formData = await redis.get(`form:${formId}`)
    return formData as FormData | null
  } catch (error) {
    console.error('Error reading form data:', error)
    return null
  }
}

export default async function PublicFormPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const formData = await getFormData(id)
  
  if (!formData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {formData.schema.title}
            </h1>
            <p className="text-sm text-gray-500">
              Created with ChatterForms
            </p>
          </div>
          
          <PublicFormClient 
            formSchema={formData.schema} 
            formId={formData.id}
          />
        </div>
      </div>
    </div>
  )
}