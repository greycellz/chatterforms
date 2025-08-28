import { notFound } from 'next/navigation'
import { railwayClient } from '@/lib/railway-client'
import PublicFormClient from './PublicFormClient'

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
  submitButtonText?: string // Add button text to interface
}

interface GCPFormData {
  form?: {
    structure?: {
      schema?: FormSchema
      submitButtonText?: string
    }
    metadata?: {
      created_at?: string
    }
  }
  structure?: {
    schema?: FormSchema
    submitButtonText?: string
  }
  metadata?: {
    created_at?: string
  }
}

async function getFormData(formId: string): Promise<FormData | null> {
  const maxRetries = 3;
  const delay = 2000; // 2 seconds between retries

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch form: ${formId}`);
      
      // Get form data from GCP via Railway
      const result = await railwayClient.getFormStructure(formId)
      
      if (!result.success || !result.data) {
        console.error(`❌ Attempt ${attempt} failed:`, result.error)
        
        if (attempt === maxRetries) {
          return null;
        }
        
        // Wait before retrying
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      const gcpData = result.data as GCPFormData
      
      // Debug: Log the actual data structure
      console.log('GCP Form Data Structure:', JSON.stringify(gcpData, null, 2))
      
      // Transform GCP data to expected format
      const formData: FormData = {
        id: formId,
        schema: gcpData.form?.structure?.schema || gcpData.structure?.schema || {
          title: 'Form',
          fields: []
        },
        createdAt: gcpData.form?.metadata?.created_at || gcpData.metadata?.created_at || new Date().toISOString(),
        submissions: [],
        submitButtonText: gcpData.form?.structure?.submitButtonText || gcpData.structure?.submitButtonText || 'Submit Form'
      }
      
      console.log(`✅ Form retrieved successfully on attempt ${attempt}`);
      return formData
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        return null;
      }
      
      // Wait before retrying
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return null;
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
            submitButtonText={formData.submitButtonText} // Pass button text
          />
        </div>
      </div>
    </div>
  )
}