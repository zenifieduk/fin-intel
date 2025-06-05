import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Get the access code from environment variables
    const ACCESS_CODE = process.env.ACCESS_CODE || 'default123'

    // Simple password check
    if (password === ACCESS_CODE) {
      return NextResponse.json({ success: true }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid access code' }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 