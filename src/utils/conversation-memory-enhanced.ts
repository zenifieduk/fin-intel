// Enhanced Conversation Memory with Vector Semantic Search
import { Redis } from '@upstash/redis'
import { Index } from '@upstash/vector'

export interface ConversationTurn {
  id: string
  timestamp: Date
  userInput: string
  intent: string
  aaranResponse: string
  actionTaken?: string
  financialData?: any
}

export interface SemanticSearchResult {
  conversation: ConversationTurn
  similarity: number
  context: string
}

export class EnhancedConversationMemory {
  private redis: Redis
  private vectorIndex: Index
  private isClient: boolean

  constructor() {
    this.isClient = typeof window !== 'undefined'
    
    try {
      this.redis = Redis.fromEnv()
      this.vectorIndex = new Index({
        url: process.env.UPSTASH_VECTOR_REST_URL || process.env.UPSTASH_VECTOR_UPSTASH_VECTOR_REST_URL!,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN || process.env.UPSTASH_VECTOR_UPSTASH_VECTOR_REST_TOKEN!
      })
      console.log('✅ Enhanced memory system initialized (Redis + Vector)')
    } catch (error) {
      console.error('❌ Enhanced memory initialization failed:', error)
      throw error
    }
  }

  // Store conversation with semantic embeddings
  async storeConversation(data: any): Promise<void> {
    const conversationTurn: ConversationTurn = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userInput: data.userInput,
      intent: data.intent,
      aaranResponse: data.aaranResponse,
      actionTaken: data.actionTaken,
      financialData: data.financialData
    }

    // Store in Redis for quick access
    await this.redis.set(
      `conversation_${conversationTurn.id}`, 
      JSON.stringify(conversationTurn),
      { ex: 86400 * 30 } // 30 days TTL
    )

    // Store in Vector database for semantic search
    const textForEmbedding = this.createEmbeddingText(conversationTurn)
    
    await this.vectorIndex.upsert({
      id: conversationTurn.id,
      data: textForEmbedding,
      metadata: {
        intent: conversationTurn.intent,
        timestamp: conversationTurn.timestamp.toISOString(),
        hasAction: !!conversationTurn.actionTaken
      }
    })

    console.log(`🔍 Stored conversation: ${conversationTurn.id}`)
  }

  private createEmbeddingText(conversation: ConversationTurn): string {
    const parts = [
      `User asked: ${conversation.userInput}`,
      `Intent: ${conversation.intent}`,
      `Aaran responded: ${conversation.aaranResponse}`
    ]

    if (conversation.actionTaken) {
      parts.push(`Action taken: ${conversation.actionTaken}`)
    }

    return parts.join('. ')
  }  // Semantic search for similar conversations
  async findSimilarConversations(query: string, limit: number = 5): Promise<SemanticSearchResult[]> {
    try {
      const results = await this.vectorIndex.query({
        data: query,
        topK: limit,
        includeMetadata: true,
        includeData: true
      })

      const conversations: SemanticSearchResult[] = []

      for (const result of results) {
        const conversationData = await this.redis.get(`conversation_${result.id}`)
        
        if (conversationData) {
          const conversation = typeof conversationData === 'string' 
            ? JSON.parse(conversationData) 
            : conversationData

          conversations.push({
            conversation: {
              ...conversation,
              timestamp: new Date(conversation.timestamp)
            },
            similarity: result.score || 0,
            context: result.data || ''
          })
        }
      }

      return conversations.sort((a, b) => b.similarity - a.similarity)
    } catch (error) {
      console.error('Semantic search failed:', error)
      return []
    }
  }

  // Enhanced personalization
  async enhanceResponse(baseResponse: string, query: string): Promise<string> {
    const similarConversations = await this.findSimilarConversations(query, 3)
    
    if (similarConversations.length > 0) {
      const recentSimilar = similarConversations.find(sc => 
        sc.similarity > 0.8 && 
        Date.now() - sc.conversation.timestamp.getTime() < 86400000 // Within 24 hours
      )

      if (recentSimilar) {
        return baseResponse + ` (This relates to our earlier discussion about ${recentSimilar.conversation.intent.toLowerCase().replace('_', ' ')})`
      }
    }

    return baseResponse
  }  // Get conversation analytics
  async getAnalytics(): Promise<any> {
    try {
      const analytics = await this.vectorIndex.info()
      
      return {
        totalVectors: analytics.vectorCount || 0,
        dimensions: analytics.dimension || 0,
        similarity: analytics.similarityFunction || 'cosine'
      }
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return null
    }
  }
}

// Export enhanced system
export const getEnhancedConversationMemory = (): EnhancedConversationMemory => {
  return new EnhancedConversationMemory()
}