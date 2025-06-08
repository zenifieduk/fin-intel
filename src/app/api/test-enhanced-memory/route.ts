import { NextResponse } from 'next/server'
import { getEnhancedConversationMemory } from '@/utils/conversation-memory-enhanced'

export const GET = async () => {
  try {
    // Test enhanced memory system
    const enhancedMemory = getEnhancedConversationMemory()
    
    // Test analytics
    const analytics = await enhancedMemory.getAnalytics()
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced memory system working!',
      system: 'Redis + Upstash Vector',
      analytics: analytics,
      features: [
        'Semantic conversation search',
        'Vector embeddings with BGE_LARGE_EN_V1_5',
        'Enhanced personalization',
        'Cross-session memory persistence'
      ],
      status: 'ready'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Enhanced memory system test failed'
    }, { status: 500 })
  }
}

export const POST = async (request: Request) => {
  try {
    const { userInput, intent, aaranResponse, actionTaken } = await request.json()
    
    if (!userInput || !intent || !aaranResponse) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userInput, intent, aaranResponse'
      }, { status: 400 })
    }

    // Initialize enhanced memory
    const enhancedMemory = getEnhancedConversationMemory()
    
    // Store test conversation with vector embedding
    await enhancedMemory.storeConversation({
      userInput,
      intent,
      aaranResponse,
      actionTaken
    })
    
    // Test semantic search
    const similarConversations = await enhancedMemory.findSimilarConversations(userInput, 3)
    
    // Test enhanced response
    const enhancedResponse = await enhancedMemory.enhanceResponse(aaranResponse, userInput)
    
    return NextResponse.json({
      success: true,
      message: 'Conversation stored and processed',
      stored: { userInput, intent, aaranResponse, actionTaken },
      similarConversations: similarConversations.map(sc => ({
        similarity: sc.similarity,
        userInput: sc.conversation.userInput,
        intent: sc.conversation.intent
      })),
      enhancedResponse,
      vectorSearch: similarConversations.length > 0 ? 'Working' : 'No similar conversations found'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to process conversation'
    }, { status: 500 })
  }
} 