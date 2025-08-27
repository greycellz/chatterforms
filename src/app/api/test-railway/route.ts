import { NextRequest, NextResponse } from 'next/server'
import { railwayClient } from '@/lib/railway-client'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Railway integration...')
    
    // Test Railway connection
    const isConnected = await railwayClient.testConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Railway connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Test GCP integration via Railway
    const gcpTest = await railwayClient.testGCPIntegration()
    
    return NextResponse.json({
      success: true,
      railway: {
        connected: isConnected,
        url: process.env.NEXT_PUBLIC_RAILWAY_URL
      },
      gcp: gcpTest,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Railway test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also add a GET method for easier testing
export async function GET() {
  return NextResponse.json({
    message: 'Railway test endpoint is working',
    timestamp: new Date().toISOString()
  })
}
