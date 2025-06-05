import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const { url } = await request.json()
    
    if (!filename || !url) {
      return NextResponse.json(
        { error: 'Filename and URL are required' },
        { status: 400 }
      )
    }

    // Delete the file from Vercel Blob using its URL
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
} 