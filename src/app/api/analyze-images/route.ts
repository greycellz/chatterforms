import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, systemMessage, userMessage } = await request.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Image URLs are required'
      }, { status: 400 })
    }

    console.log(`🔍 Analyzing ${imageUrls.length} images with GPT-4 Vision...`)

    // Prepare images for GPT-4 Vision
    const imageContents = await Promise.all(
      imageUrls.map(async (url: string) => {
        try {
          const response = await fetch(url)
          const arrayBuffer = await response.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString('base64')
          const mimeType = response.headers.get('content-type') || 'image/png'
          
          return {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64}`
            }
          }
        } catch (error) {
          console.error(`Failed to fetch image ${url}:`, error)
          return null
        }
      })
    )

    // Filter out failed image fetches
    const validImages = imageContents.filter(img => img !== null)

    if (validImages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch all images'
      }, { status: 500 })
    }

    // Call GPT-4 Vision API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemMessage || 'You are a form analysis expert. Extract all form fields from the provided images.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userMessage || 'Analyze these images and extract all form fields.'
            },
            ...validImages
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      return NextResponse.json({
        success: false,
        error: 'No response from GPT-4 Vision'
      }, { status: 500 })
    }

    // Parse JSON response
    let parsedResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        parsedResponse = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse GPT response:', responseText)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse GPT response',
        rawResponse: responseText
      }, { status: 500 })
    }

    console.log(`✅ Successfully analyzed ${validImages.length} images`)

    return NextResponse.json({
      success: true,
      fields: parsedResponse.fields || [],
      rawResponse: responseText,
      imagesAnalyzed: validImages.length
    })

  } catch (error) {
    console.error('❌ Image analysis error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Image analysis failed'
    }, { status: 500 })
  }
}
