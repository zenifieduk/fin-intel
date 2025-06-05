import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (PDFs, images, documents)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, image, or document files only.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate safe filename
    const timestamp = Date.now()
    const safeFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Check if we're in development mode or missing token
    const isDevelopment = process.env.NODE_ENV === 'development'
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN

    if (isDevelopment && !hasToken) {
      // Local development fallback - simulate upload
      const mockUrl = `https://example.blob.vercel-storage.com/${safeFilename}`
      
      return NextResponse.json({
        url: mockUrl,
        downloadUrl: mockUrl,
        filename: safeFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        note: 'This is a demo response - file not actually uploaded (missing BLOB_READ_WRITE_TOKEN)'
      })
    }

    // Production upload to Vercel Blob
    const blob = await put(safeFilename, file, {
      access: 'public',
    })

    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      filename: safeFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'File upload API is ready. Use POST to upload files.',
    environment: process.env.NODE_ENV,
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
  })
} 