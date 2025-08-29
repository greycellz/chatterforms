import { NextRequest, NextResponse } from 'next/server'
import { railwayClient } from '@/lib/railway-client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const formId = formData.get('formId') as string
    const fieldId = formData.get('fieldId') as string

    if (!file || !formId || !fieldId) {
      return NextResponse.json({ 
        error: 'Missing required fields: file, formId, or fieldId' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size exceeds 10MB limit' 
      }, { status: 400 })
    }

    // Upload file to GCP via Railway backend
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('formId', formId)
      uploadFormData.append('fieldId', fieldId)

      const result = await railwayClient.uploadFile(uploadFormData)

      if (!result.success) {
        throw new Error(result.error || 'File upload failed')
      }

      console.log(`✅ File uploaded successfully: ${file.name}`)
      
      return NextResponse.json({ 
        success: true,
        fileUrl: (result.data as { fileUrl?: string })?.fileUrl || '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })
    } catch (error) {
      console.error('❌ Failed to upload file to GCP:', error)
      throw new Error('Failed to upload file to GCP')
    }
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
