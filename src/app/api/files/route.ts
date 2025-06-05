import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    // List all files from Vercel Blob
    const { blobs } = await list()
    
    // Transform blob data to match our UploadedFile interface
    const files = blobs.map(blob => ({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      filename: blob.pathname,
      originalName: blob.pathname,
      size: blob.size,
      type: 'application/octet-stream', // Default type since contentType might not be available
      uploadedAt: blob.uploadedAt
    }))

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
} 