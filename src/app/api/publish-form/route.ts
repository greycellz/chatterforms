import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Generate a unique form ID
function generateFormId(): string {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const { formSchema } = await request.json()
    
    if (!formSchema || !formSchema.fields || formSchema.fields.length === 0) {
      return NextResponse.json({ error: 'Invalid form schema' }, { status: 400 })
    }

    const formId = generateFormId()
    
    // Create the data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data', 'forms')
    try {
      mkdirSync(dataDir, { recursive: true })
    } catch {
      // Directory might already exist
    }
    
    // Save form schema to file system (in production, you'd use a database)
    const formData = {
      id: formId,
      schema: formSchema,
      createdAt: new Date().toISOString(),
      submissions: []
    }
    
    const filePath = join(dataDir, `${formId}.json`)
    writeFileSync(filePath, JSON.stringify(formData, null, 2))
    
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