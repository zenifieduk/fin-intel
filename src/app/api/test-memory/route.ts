import { NextResponse } from 'next/server'
import { getDefaultConversationMemory } from '@/utils/conversation-memory'

export const GET = async () => {
  try {
    // Test Redis environment variables
    const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    
    // Initialize conversation memory
    const memory = getDefaultConversationMemory()
    
    // Test basic functionality
    const testInteraction = {
      userInput: "test query",
      intent: "TEST_INTENT",
      aaranResponse: "test response",
      actionTaken: "test_action"
    }
    
    // Test learning
    if (memory && typeof memory.learnFromInteraction === 'function') {
      memory.learnFromInteraction(testInteraction)
    }
    
    // Test context retrieval
    const recentContext = memory?.getRecentContext ? memory.getRecentContext(3) : []
    
    return NextResponse.json({
      success: true,
      redisConfigured: hasRedisConfig,
      memorySystemType: hasRedisConfig ? 'Redis-based' : 'localStorage-based',
      testResults: {
        memoryInitialized: !!memory,
        hasLearningMethod: typeof memory?.learnFromInteraction === 'function',
        hasContextMethod: typeof memory?.getRecentContext === 'function',
        recentContextItems: recentContext.length
      },
      environment: {
        hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
        hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        isClientSide: typeof window !== 'undefined'
      }
    })
  } catch (error) {
    console.error('Memory test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export const POST = async (request: Request) => {
  try {
    const { action, data } = await request.json()
    
    const memory = getDefaultConversationMemory()
    
    if (action === 'learn') {
      memory.learnFromInteraction(data)
      return NextResponse.json({ 
        success: true, 
        message: 'Learning interaction recorded' 
      })
    }
    
    if (action === 'personalize') {
      const personalizedResponse = memory.personalizeResponse(data.response, data.context)
      return NextResponse.json({ 
        success: true, 
        personalizedResponse 
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unknown action' 
    }, { status: 400 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 