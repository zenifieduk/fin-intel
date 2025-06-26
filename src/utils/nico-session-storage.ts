// NICO Session Storage System with Redis + Vector DB
// Multi-tenant design for football club deployment

import { Redis } from '@upstash/redis'
import { Index } from '@upstash/vector'

// Session Types for NICO
export interface NicoSession {
  sessionId: string
  clubId: string
  userId: string
  createdAt: Date
  lastActiveAt: Date
  conversationFlow: NicoConversationFlow
  context: NicoContext
  preferences: NicoPreferences
  analytics: NicoAnalytics
}

export interface NicoConversationFlow {
  messages: NicoMessage[]
  currentTopic: string | null
  intent: string | null
  awaitingResponse: boolean
  conversationState: 'greeting' | 'analysis' | 'query' | 'action' | 'summarizing' | 'ended'
}

export interface NicoMessage {
  id: string
  timestamp: Date
  type: 'user' | 'nico' | 'system'
  content: string
  intent?: string
  context?: any
  metadata?: any
}

export interface NicoContext {
  currentSeason: string
  focusTeam: string
  activeScenario: 'overview' | 'attack' | 'defense' | 'injuries' | 'fixtures'
  highlightedPlayer: string | null
  dashboardState: any
  lastAction: string | null
}

export interface NicoPreferences {
  responseStyle: 'brief' | 'detailed' | 'technical'
  analysisDepth: 'summary' | 'detailed' | 'comprehensive'
  voiceEnabled: boolean
  preferredMetrics: string[]
  alertThresholds: Record<string, number>
}

export interface NicoAnalytics {
  totalSessions: number
  totalMessages: number
  avgSessionDuration: number
  commonQueries: Record<string, number>
  successfulActions: Record<string, number>
  preferredTopics: Record<string, number>
  lastLearningUpdate: Date
}

// Vector storage for semantic conversation search
interface ConversationEmbedding {
  sessionId: string
  messageId: string
  content: string
  intent: string
  timestamp: Date
  metadata: Record<string, any>
}

export class NicoSessionStorage {
  private redis: Redis | null
  private vectorDb: Index | null
  private clubId: string
  private useLocalStorage: boolean
  private isClient: boolean

  constructor(clubId: string = 'manchester_united') {
    this.clubId = clubId
    this.isClient = typeof window !== 'undefined'
    this.useLocalStorage = false
    
    try {
      // Initialize Redis with explicit credentials
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
      console.log('✅ NICO Redis initialized successfully')
    } catch (error) {
      console.error('❌ NICO Redis initialization failed:', error)
      console.error('Redis URL:', process.env.UPSTASH_REDIS_REST_URL)
      console.error('Redis Token exists:', !!process.env.UPSTASH_REDIS_REST_TOKEN)
      console.warn('🔄 Falling back to localStorage mode for development')
      this.redis = null
      this.useLocalStorage = this.isClient
    }

    try {
      // Initialize Upstash Vector DB for conversation embeddings
      const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL || process.env.UPSTASH_VECTOR_UPSTASH_VECTOR_REST_URL
      const vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN || process.env.UPSTASH_VECTOR_UPSTASH_VECTOR_REST_TOKEN
      
      if (!vectorUrl || !vectorToken) {
        console.warn('Vector DB credentials not found, using fallback mode')
        this.vectorDb = null
      } else {
        this.vectorDb = new Index({
          url: vectorUrl,
          token: vectorToken,
        })
        console.log('✅ NICO Vector DB initialized successfully')
      }
    } catch (error) {
      console.error('❌ NICO Vector DB initialization failed:', error)
      console.warn('Vector DB will be disabled for this session')
      this.vectorDb = null
    }
  }

  // localStorage fallback methods
  private getLocalStorageKey(sessionId: string): string {
    return `nico-session-${this.clubId}-${sessionId}`
  }

  private async saveToLocalStorage(sessionId: string, session: NicoSession): Promise<void> {
    if (!this.isClient) return
    try {
      localStorage.setItem(this.getLocalStorageKey(sessionId), JSON.stringify(session))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  private async loadFromLocalStorage(sessionId: string): Promise<NicoSession | null> {
    if (!this.isClient) return null
    try {
      const data = localStorage.getItem(this.getLocalStorageKey(sessionId))
      return data ? this.parseSession(JSON.parse(data)) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  // Session Management
  async createSession(userId: string, preferences?: Partial<NicoPreferences>): Promise<NicoSession> {
    const sessionId = `nico_${this.clubId}_${userId}_${Date.now()}`
    
    const session: NicoSession = {
      sessionId,
      clubId: this.clubId,
      userId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      conversationFlow: {
        messages: [],
        currentTopic: null,
        intent: null,
        awaitingResponse: false,
        conversationState: 'greeting'
      },
      context: {
        currentSeason: '2025-26',
        focusTeam: 'Manchester United',
        activeScenario: 'overview',
        highlightedPlayer: null,
        dashboardState: {},
        lastAction: null
      },
      preferences: {
        responseStyle: 'detailed',
        analysisDepth: 'detailed',
        voiceEnabled: true,
        preferredMetrics: ['goals', 'assists', 'minutes'],
        alertThresholds: {},
        ...preferences
      },
      analytics: {
        totalSessions: 1,
        totalMessages: 0,
        avgSessionDuration: 0,
        commonQueries: {},
        successfulActions: {},
        preferredTopics: {},
        lastLearningUpdate: new Date()
      }
    }

    // Save to Redis or localStorage
    if (this.redis) {
      try {
        await this.redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session))
        // Update user session count
        await this.updateUserSessionCount(userId)
      } catch (error) {
        console.error('Redis save failed, falling back to localStorage:', error)
        this.useLocalStorage = true
        await this.saveToLocalStorage(sessionId, session)
      }
    } else if (this.useLocalStorage) {
      await this.saveToLocalStorage(sessionId, session)
    }
    
    console.log(`🎯 NICO session created: ${sessionId}`)
    return session
  }

  async getSession(sessionId: string): Promise<NicoSession | null> {
    try {
      if (this.redis && !this.useLocalStorage) {
        try {
          const sessionData = await this.redis.get(`session:${sessionId}`)
          if (sessionData) {
            return this.parseSession(sessionData)
          }
        } catch (error) {
          console.error('Redis get failed, falling back to localStorage:', error)
          this.useLocalStorage = true
        }
      }
      
      if (this.useLocalStorage) {
        return await this.loadFromLocalStorage(sessionId)
      }
      
      return null
    } catch (error) {
      console.error('Failed to get NICO session:', error)
      return null
    }
  }

  async updateSession(sessionId: string, updates: Partial<NicoSession>): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false

      const updatedSession = {
        ...session,
        ...updates,
        lastActiveAt: new Date()
      }

      if (this.redis && !this.useLocalStorage) {
        try {
          await this.redis.setex(`session:${sessionId}`, 86400, JSON.stringify(updatedSession))
          return true
        } catch (error) {
          console.error('Redis update failed, falling back to localStorage:', error)
          this.useLocalStorage = true
        }
      }
      
      if (this.useLocalStorage) {
        await this.saveToLocalStorage(sessionId, updatedSession)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to update NICO session:', error)
      return false
    }
  }

  // Message Management
  async addMessage(sessionId: string, message: Omit<NicoMessage, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false

      const nicoMessage: NicoMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...message
      }

      session.conversationFlow.messages.push(nicoMessage)
      session.analytics.totalMessages++
      session.lastActiveAt = new Date()

      // Update common queries for learning
      if (message.intent) {
        session.analytics.commonQueries[message.intent] = 
          (session.analytics.commonQueries[message.intent] || 0) + 1
      }

      await this.updateSession(sessionId, session)

      // Store in vector DB for semantic search (if user message)
      if (message.type === 'user' && message.content.length > 10) {
        await this.storeMessageEmbedding(sessionId, nicoMessage)
      }

      return true
    } catch (error) {
      console.error('Failed to add message to NICO session:', error)
      return false
    }
  }

  // Context Management
  async updateContext(sessionId: string, contextUpdates: Partial<NicoContext>): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false

      session.context = { ...session.context, ...contextUpdates }
      return await this.updateSession(sessionId, session)
    } catch (error) {
      console.error('Failed to update NICO context:', error)
      return false
    }
  }

  async highlightPlayer(sessionId: string, playerName: string | null): Promise<boolean> {
    return await this.updateContext(sessionId, { highlightedPlayer: playerName })
  }

  async setScenario(sessionId: string, scenario: NicoContext['activeScenario']): Promise<boolean> {
    return await this.updateContext(sessionId, { activeScenario: scenario })
  }

  async recordAction(sessionId: string, action: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false

      session.context.lastAction = action
      session.analytics.successfulActions[action] = 
        (session.analytics.successfulActions[action] || 0) + 1

      return await this.updateSession(sessionId, session)
    } catch (error) {
      console.error('Failed to record NICO action:', error)
      return false
    }
  }

  // Conversation Flow Management
  async updateConversationState(
    sessionId: string, 
    state: NicoConversationFlow['conversationState'],
    topic?: string
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false

      session.conversationFlow.conversationState = state
      if (topic) {
        session.conversationFlow.currentTopic = topic
        // Track topic preferences
        session.analytics.preferredTopics[topic] = 
          (session.analytics.preferredTopics[topic] || 0) + 1
      }

      return await this.updateSession(sessionId, session)
    } catch (error) {
      console.error('Failed to update conversation state:', error)
      return false
    }
  }

  // Vector Search for Conversation History
  private async storeMessageEmbedding(sessionId: string, message: NicoMessage): Promise<void> {
    if (!this.vectorDb) {
      console.warn('Vector DB not available, skipping embedding storage')
      return
    }
    
    try {
      // Create embedding using a simple hash for now (in production, use OpenAI embeddings)
      const embedding = await this.createSimpleEmbedding(message.content)
      
      await this.vectorDb.upsert([{
        id: `${sessionId}_${message.id}`,
        vector: embedding,
        metadata: {
          sessionId,
          messageId: message.id,
          content: message.content,
          intent: message.intent || 'unknown',
          timestamp: message.timestamp.toISOString(),
          type: message.type,
          clubId: this.clubId
        }
      }])
    } catch (error) {
      console.error('Failed to store message embedding:', error)
    }
  }

  async searchSimilarConversations(query: string, limit: number = 5): Promise<ConversationEmbedding[]> {
    if (!this.vectorDb) {
      console.warn('Vector DB not available, returning empty results')
      return []
    }
    
    try {
      const queryEmbedding = await this.createSimpleEmbedding(query)
      
      const results = await this.vectorDb.query({
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
        filter: { clubId: this.clubId }
      })

      return results.matches?.map(match => ({
        sessionId: match.metadata?.sessionId as string,
        messageId: match.metadata?.messageId as string,
        content: match.metadata?.content as string,
        intent: match.metadata?.intent as string,
        timestamp: new Date(match.metadata?.timestamp as string),
        metadata: match.metadata
      })) || []
    } catch (error) {
      console.error('Failed to search conversations:', error)
      return []
    }
  }

  // Analytics and Learning
  async getSessionAnalytics(userId: string): Promise<NicoAnalytics | null> {
    try {
      const userSessions = await this.getUserSessions(userId)
      if (userSessions.length === 0) return null

      // Aggregate analytics across all sessions
      const analytics: NicoAnalytics = {
        totalSessions: userSessions.length,
        totalMessages: 0,
        avgSessionDuration: 0,
        commonQueries: {},
        successfulActions: {},
        preferredTopics: {},
        lastLearningUpdate: new Date()
      }

      let totalDuration = 0
      for (const session of userSessions) {
        analytics.totalMessages += session.analytics.totalMessages
        
        // Merge query counts
        Object.entries(session.analytics.commonQueries).forEach(([query, count]) => {
          analytics.commonQueries[query] = (analytics.commonQueries[query] || 0) + count
        })

        // Merge action counts
        Object.entries(session.analytics.successfulActions).forEach(([action, count]) => {
          analytics.successfulActions[action] = (analytics.successfulActions[action] || 0) + count
        })

        // Merge topic preferences
        Object.entries(session.analytics.preferredTopics).forEach(([topic, count]) => {
          analytics.preferredTopics[topic] = (analytics.preferredTopics[topic] || 0) + count
        })

        // Calculate session duration
        const duration = session.lastActiveAt.getTime() - session.createdAt.getTime()
        totalDuration += duration
      }

      analytics.avgSessionDuration = totalDuration / userSessions.length

      return analytics
    } catch (error) {
      console.error('Failed to get session analytics:', error)
      return null
    }
  }

  // User Management
  private async getUserSessions(userId: string): Promise<NicoSession[]> {
    try {
      // Get all session keys for this user
      const pattern = `session:nico_${this.clubId}_${userId}_*`
      const keys = await this.redis.keys(pattern)
      
      const sessions: NicoSession[] = []
      for (const key of keys) {
        const sessionData = await this.redis.get(key)
        if (sessionData) {
          sessions.push(this.parseSession(sessionData))
        }
      }

      return sessions.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())
    } catch (error) {
      console.error('Failed to get user sessions:', error)
      return []
    }
  }

  private async updateUserSessionCount(userId: string): Promise<void> {
    try {
      const key = `user:${this.clubId}:${userId}:session_count`
      await this.redis.incr(key)
      await this.redis.expire(key, 86400 * 30) // 30 days expiry
    } catch (error) {
      console.error('Failed to update user session count:', error)
    }
  }

  // Utilities
  private parseSession(sessionData: any): NicoSession {
    if (typeof sessionData === 'string') {
      sessionData = JSON.parse(sessionData)
    }

    return {
      ...sessionData,
      createdAt: new Date(sessionData.createdAt),
      lastActiveAt: new Date(sessionData.lastActiveAt),
      conversationFlow: {
        ...sessionData.conversationFlow,
        messages: sessionData.conversationFlow.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      },
      analytics: {
        ...sessionData.analytics,
        lastLearningUpdate: new Date(sessionData.analytics.lastLearningUpdate)
      }
    }
  }

  private async createSimpleEmbedding(text: string): Promise<number[]> {
    // Simple hash-based embedding for development
    // In production, replace with OpenAI embeddings API
    const hash = this.simpleHash(text)
    const embedding = new Array(384).fill(0)
    
    for (let i = 0; i < 384; i++) {
      embedding[i] = Math.sin(hash * (i + 1)) * 0.5
    }
    
    return embedding
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  // Session cleanup
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false

      // Update final analytics
      const sessionDuration = Date.now() - session.createdAt.getTime()
      session.analytics.avgSessionDuration = sessionDuration
      session.conversationFlow.conversationState = 'ended'

      await this.updateSession(sessionId, session)
      
      console.log(`🏁 NICO session ended: ${sessionId}`)
      return true
    } catch (error) {
      console.error('Failed to end NICO session:', error)
      return false
    }
  }

  // Health check
  async healthCheck(): Promise<{ redis: boolean; vector: boolean; localStorage: boolean }> {
    try {
      let redisHealth = false
      if (this.redis && !this.useLocalStorage) {
        try {
          const pingResult = await this.redis.ping()
          redisHealth = pingResult === 'PONG'
        } catch (error) {
          console.error('Redis health check failed:', error)
          redisHealth = false
          this.useLocalStorage = this.isClient
        }
      }
      
      // Simple vector DB health check
      let vectorHealth = false
      if (this.vectorDb) {
        try {
          // Create a simple test embedding
          const testEmbedding = new Array(384).fill(0.1)
          await this.vectorDb.query({ vector: testEmbedding, topK: 1 })
          vectorHealth = true
        } catch (error) {
          console.error('Vector DB health check failed:', error)
          vectorHealth = false
        }
      }

      // localStorage health check
      const localStorageHealth = this.isClient && typeof Storage !== 'undefined'

      return { 
        redis: redisHealth, 
        vector: vectorHealth, 
        localStorage: localStorageHealth 
      }
    } catch (error) {
      console.error('NICO health check failed:', error)
      return { redis: false, vector: false, localStorage: false }
    }
  }
}

// Singleton instance for the default club
let defaultNicoStorage: NicoSessionStorage | null = null

export const getNicoSessionStorage = (clubId?: string): NicoSessionStorage => {
  if (!defaultNicoStorage || (clubId && clubId !== 'manchester_united')) {
    defaultNicoStorage = new NicoSessionStorage(clubId)
  }
  return defaultNicoStorage
}

// Multi-tenant factory for football club deployments
export const createClubNicoStorage = (clubId: string): NicoSessionStorage => {
  return new NicoSessionStorage(clubId)
}