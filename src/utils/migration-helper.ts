// Migration Helper for Conversation Memory System
// Seamlessly switches from localStorage to Redis when credentials are available

import { ConversationMemory, getDefaultConversationMemory } from './conversation-memory'
import { RedisConversationMemory, getRedisConversationMemory } from './conversation-memory-redis'

export class MigrationHelper {
  private static migrationAttempted = false
  
  static async getConversationMemory(userId: string = 'default-user'): Promise<ConversationMemory | RedisConversationMemory> {
    const hasRedisCredentials = typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL && 
      process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN

    if (hasRedisCredentials) {
      console.log('🔄 Using Redis-based conversation memory')
      const redisMemory = getRedisConversationMemory(userId)
      
      // Auto-migrate localStorage data once
      if (!this.migrationAttempted) {
        this.migrationAttempted = true
        await redisMemory.migrateFromLocalStorage(userId)
      }
      
      return redisMemory
    } else {
      console.log('💾 Using localStorage-based conversation memory (fallback)')
      return getDefaultConversationMemory()
    }
  }

  static async testRedisConnection(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    try {
      const redisMemory = getRedisConversationMemory('test-connection')
      const profile = await redisMemory.getUserProfile()
      console.log('✅ Redis connection successful')
      return true
    } catch (error) {
      console.log('❌ Redis connection failed:', error)
      return false
    }
  }

  static getMemoryType(): 'redis' | 'localStorage' | 'ssr' {
    if (typeof window === 'undefined') return 'ssr'
    
    const hasRedisCredentials = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL && 
      process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN

    return hasRedisCredentials ? 'redis' : 'localStorage'
  }
} 