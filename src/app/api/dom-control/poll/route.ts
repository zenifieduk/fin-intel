import { NextRequest, NextResponse } from 'next/server'

// In production, this would be replaced with Redis or a proper queue system
let pendingCommands: any[] = []

export async function GET() {
  try {
    // Return the next pending command
    const command = pendingCommands.shift()
    
    if (command) {
      console.log('📤 Polling: Returning command:', command)
      return NextResponse.json(command)
    }
    
    // No pending commands
    return NextResponse.json({ action: null })
    
  } catch (error) {
    console.error('❌ Polling Error:', error)
    return NextResponse.json({ action: null }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const command = await request.json()
    
    console.log('📥 Queueing DOM command:', command)
    
    // Add command to queue
    pendingCommands.push({
      ...command,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      queued: true,
      queueLength: pendingCommands.length
    })
    
  } catch (error) {
    console.error('❌ Queue Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to queue command'
    }, { status: 500 })
  }
}

// Clear all pending commands
export async function DELETE() {
  try {
    const clearedCount = pendingCommands.length
    pendingCommands = []
    
    return NextResponse.json({
      success: true,
      cleared: clearedCount
    })
    
  } catch (error) {
    console.error('❌ Clear Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear commands'
    }, { status: 500 })
  }
} 