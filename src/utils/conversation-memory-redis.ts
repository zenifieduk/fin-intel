// Redis-based Conversation Memory System for Aaran
// Replaces localStorage with Upstash Redis for better performance and SSR compatibility

import { Redis } from '@upstash/redis'

export interface UserProfile {
  userId: string
  name?: string
  createdAt: Date
  lastActiveAt: Date
  preferences: {
    responseStyle: 'brief' | 'detailed' | 'explanatory'
    financialFocus: 'revenue' | 'risk' | 'sustainability' | 'balanced'
    conversationFlow: 'single_command' | 'continuous' | 'guided'
  }
  interactionHistory: Array<{
    timestamp: Date
    userInput: string
    aaranResponse: string
    intent: string
    satisfaction?: number
  }>
  learningData: {
    frequentQueries: Record<string, number>
    successfulActions: Record<string, number>
    preferredPositions: number[]
    expertiseLevel: 'novice' | 'intermediate' | 'expert'
    lastLearningUpdate: Date
  }
  conversationState: {
    currentTopic?: string
    lastIntent?: string
    expectations?: string[]
    lastAction?: string
  }
  usageStats: {
    totalInteractions: number
    totalSessions: number
    averageSessionLength: number
    lastSessionDuration: number
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening'
  }
}

export interface ConversationContext {
  intent: string
  financialData?: any
  position?: number
  scenario?: string
}

export interface LearningData {
  userInput: string
  intent: string
  aaranResponse: string
  actionTaken?: string
  financialData?: any
  timestamp?: Date
}

export class RedisConversationMemory {
  private redis: Redis
  private userProfile: UserProfile | null = null
  private isClient: boolean

  constructor(userId: string = 'default-user') {
    this.isClient = typeof window !== 'undefined'
    
    // Initialize Redis using fromEnv() as recommended by Upstash
    if (this.isClient) {
      try {
        this.redis = Redis.fromEnv()
        console.log('✅ Redis initialized successfully with fromEnv()')
      } catch (error) {
        console.warn('⚠️ Redis initialization failed, using fallback:', error)
        this.redis = null as any
      }
    } else {
      // Fallback for SSR
      this.redis = null as any
    }
    
    if (this.isClient) {
      this.initializeUserProfile(userId)
    }
  }

  private async initializeUserProfile(userId: string): Promise<void> {
    try {
      if (!this.redis) {
        console.warn('Redis not available, using fallback profile')
        this.userProfile = this.createDefaultProfile(userId)
        return
      }

      const stored = await this.redis.get(`aaran-profile-${userId}`)
      
      if (stored) {
        this.userProfile = this.parseStoredProfile(stored)
        this.userProfile.lastActiveAt = new Date()
        await this.saveProfile()
      } else {
        this.userProfile = this.createDefaultProfile(userId)
        await this.saveProfile()
      }
    } catch (error) {
      console.error('Redis profile initialization failed:', error)
      this.userProfile = this.createDefaultProfile(userId)
    }
  }

  private parseStoredProfile(stored: any): UserProfile {
    if (typeof stored === 'string') {
      stored = JSON.parse(stored)
    }
    
    return {
      ...stored,
      createdAt: new Date(stored.createdAt),
      lastActiveAt: new Date(stored.lastActiveAt),
      interactionHistory: stored.interactionHistory?.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) || [],
      learningData: {
        ...stored.learningData,
        lastLearningUpdate: new Date(stored.learningData?.lastLearningUpdate || Date.now())
      }
    }
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      preferences: {
        responseStyle: 'detailed',
        financialFocus: 'balanced',
        conversationFlow: 'continuous'
      },
      interactionHistory: [],
      learningData: {
        frequentQueries: {},
        successfulActions: {},
        preferredPositions: [12],
        expertiseLevel: 'novice',
        lastLearningUpdate: new Date()
      },
      conversationState: {},
      usageStats: {
        totalInteractions: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        lastSessionDuration: 0
      }
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.userProfile) {
      await this.initializeUserProfile('default-user')
    }
    return this.userProfile
  }

  async updatePreferences(updates: Partial<UserProfile['preferences']>): Promise<void> {
    if (!this.userProfile) return
    
    this.userProfile.preferences = { ...this.userProfile.preferences, ...updates }
    this.userProfile.lastActiveAt = new Date()
    await this.saveProfile()
  }

  async learnFromInteraction(data: LearningData): Promise<void> {
    if (!this.userProfile) return

    // Add to interaction history
    this.userProfile.interactionHistory.push({
      timestamp: data.timestamp || new Date(),
      userInput: data.userInput,
      aaranResponse: data.aaranResponse,
      intent: data.intent,
      satisfaction: undefined
    })

    // Keep only last 100 interactions
    if (this.userProfile.interactionHistory.length > 100) {
      this.userProfile.interactionHistory = this.userProfile.interactionHistory.slice(-100)
    }

    // Update learning data
    const learningData = this.userProfile.learningData
    learningData.frequentQueries[data.intent] = (learningData.frequentQueries[data.intent] || 0) + 1
    
    if (data.actionTaken) {
      learningData.successfulActions[data.actionTaken] = (learningData.successfulActions[data.actionTaken] || 0) + 1
    }

    // Update usage stats
    this.userProfile.usageStats.totalInteractions++
    this.userProfile.lastActiveAt = new Date()
    learningData.lastLearningUpdate = new Date()

    await this.saveProfile()
  }

  personalizeResponse(baseResponse: string, context: ConversationContext): string {
    if (!this.userProfile) return baseResponse

    const { preferences, learningData } = this.userProfile
    let personalizedResponse = baseResponse

    // Apply response style preferences
    if (preferences.responseStyle === 'brief') {
      // Shorten response while keeping key information
      personalizedResponse = this.shortenResponse(personalizedResponse)
    } else if (preferences.responseStyle === 'explanatory') {
      // Add more context and explanation
      personalizedResponse = this.expandResponse(personalizedResponse, context)
    }

    // Add financial focus-specific information
    if (preferences.financialFocus !== 'balanced' && context.financialData) {
      personalizedResponse = this.addFocusedFinancialContext(personalizedResponse, preferences.financialFocus, context)
    }

    return personalizedResponse
  }

  private shortenResponse(response: string): string {
    // Keep first sentence and key numbers
    const sentences = response.split('. ')
    const keySentence = sentences[0]
    const numberMatches = response.match(/£[\d,]+|[\d.]+%|\d+(?:st|nd|rd|th)/g)
    
    if (numberMatches && sentences.length > 1) {
      return `${keySentence}. Key figures: ${numberMatches.slice(0, 2).join(', ')}.`
    }
    
    return keySentence + '.'
  }

  private expandResponse(response: string, context: ConversationContext): string {
    let expanded = response
    
    if (context.financialData && context.position) {
      expanded += ` This analysis is based on position ${context.position} with current revenue trends and risk assessments.`
    }
    
    return expanded
  }

  private addFocusedFinancialContext(response: string, focus: string, context: ConversationContext): string {
    if (!context.financialData) return response

    const focusAdditions: Record<string, string> = {
      revenue: ` Revenue impact: This directly affects our £${context.financialData.totalRevenue?.toLocaleString() || 'N/A'} annual income.`,
      risk: ` Risk assessment: Current risk level is ${context.financialData.riskScore || 'moderate'} based on league position volatility.`,
      sustainability: ` Sustainability: We can maintain current operations for ${context.financialData.sustainabilityDays || 'unknown'} days at this level.`
    }

    return response + (focusAdditions[focus] || '')
  }

  getRecentContext(limit: number = 5): string[] {
    if (!this.userProfile?.interactionHistory) return []
    
    return this.userProfile.interactionHistory
      .slice(-limit)
      .map(interaction => `${interaction.intent}: ${interaction.userInput}`)
  }

  async getConversationSummary(): Promise<string> {
    if (!this.userProfile) return 'No conversation data available'
    
    const recent = this.userProfile.interactionHistory.slice(-5)
    const topics = [...new Set(recent.map(i => i.intent))]
    
    return `Recent topics: ${topics.join(', ')}. Total interactions: ${this.userProfile.usageStats.totalInteractions}`
  }

  // Compatibility methods to match ConversationMemory interface
  getUserPreferences(): any {
    return this.userProfile?.preferences || {}
  }

  updateUserPreferences(updates: any): void {
    this.updatePreferences(updates)
  }

  generateFollowUpSuggestions(context: any): string[] {
    if (!this.userProfile) return []
    
    const suggestions = []
    const recentIntents = this.userProfile.interactionHistory.slice(-3).map(h => h.intent)
    
    if (recentIntents.includes('POSITION_CHANGE')) {
      suggestions.push("Would you like to see the revenue impact?")
    }
    
    if (recentIntents.includes('FINANCIAL_QUERY')) {
      suggestions.push("Shall I compare this with other positions?")
    }
    
    return suggestions
  }

  // Method compatibility for drop-in replacement
  getCurrentSession(): any {
    return {
      id: this.userProfile?.userId || 'default',
      topicFocus: this.userProfile?.conversationState?.currentTopic || 'general'
    }
  }

  private async saveProfile(): Promise<void> {
    if (!this.redis || !this.userProfile || !this.isClient) return

    try {
      await this.redis.set(`aaran-profile-${this.userProfile.userId}`, JSON.stringify(this.userProfile))
    } catch (error) {
      console.error('Failed to save profile to Redis:', error)
    }
  }

  // Migration helper - import from localStorage
  async migrateFromLocalStorage(userId: string): Promise<void> {
    if (!this.isClient) return

    try {
      const localData = localStorage.getItem(`aaran-profile-${userId}`)
      if (localData) {
        const parsed = JSON.parse(localData)
        this.userProfile = this.parseStoredProfile(parsed)
        await this.saveProfile()
        
        // Clean up localStorage after successful migration
        localStorage.removeItem(`aaran-profile-${userId}`)
        console.log('✅ Successfully migrated conversation memory to Redis')
      }
    } catch (error) {
      console.error('Migration from localStorage failed:', error)
    }
  }

  // Fallback mode for when Redis is unavailable
  private fallbackToLocalStorage(): boolean {
    return this.isClient && typeof localStorage !== 'undefined'
  }
}

// Client-safe instance creator
let defaultRedisMemory: RedisConversationMemory | null = null

export const getRedisConversationMemory = (userId: string = 'default-user'): RedisConversationMemory => {
  if (typeof window !== 'undefined' && !defaultRedisMemory) {
    defaultRedisMemory = new RedisConversationMemory(userId)
  }
  return defaultRedisMemory || new RedisConversationMemory('ssr-fallback')
} 