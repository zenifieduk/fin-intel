// Conversation Memory & Learning System for Aaran Voice Assistant
// Provides persistent memory, user preference learning, and personalized responses

export interface UserPreferences {
  responseStyle: 'brief' | 'detailed' | 'explanatory'
  favoriteMetrics: string[]
  preferredScenarios: string[]
  conversationFlow: 'single_command' | 'continuous' | 'guided'
  financialFocus: 'revenue' | 'risk' | 'sustainability' | 'balanced'
  detailLevel: 'basic' | 'intermediate' | 'advanced'
}

export interface ConversationSummary {
  sessionId: string
  timestamp: Date
  duration: number
  topicsDiscussed: string[]
  positionsExplored: number[]
  scenariosUsed: string[]
  successfulActions: string[]
  userSatisfaction?: number
  keyInsights: string[]
}

export interface LearningData {
  frequentQueries: { query: string; count: number; lastUsed: Date }[]
  successfulActions: { action: string; context: string; count: number }[]
  improvementAreas: { area: string; feedback: string; priority: number }[]
  responsePatterns: { pattern: string; effectiveness: number }[]
  financialInterests: { metric: string; frequency: number; depth: string }[]
}

export interface UserProfile {
  id: string
  createdAt: Date
  lastActive: Date
  preferences: UserPreferences
  interactionHistory: ConversationSummary[]
  learningData: LearningData
  personalityTrait: 'analytical' | 'strategic' | 'operational' | 'explorer'
  privacySettings: {
    enableLearning: boolean
    retainHistory: boolean
    shareInsights: boolean
  }
}

export interface ConversationTurn {
  id: string
  timestamp: Date
  userInput: string
  intent: string
  aaranResponse: string
  actionTaken?: string
  newPosition?: number
  newScenario?: string
  financialDataRetrieved?: any
  userSatisfaction?: number
  contextUsed: string[]
}

export interface MemoryContext {
  shortTermMemory: ConversationTurn[]
  currentSession: {
    id: string
    startTime: Date
    turnsCount: number
    topicFocus: string
    lastPosition: number
    lastScenario: string
    financialInsights: string[]
  }
  longTermMemory: {
    patterns: string[]
    preferences: string[]
    expertise: string[]
  }
}

// Main Conversation Memory class
export class ConversationMemory {
  private userProfile: UserProfile
  private memoryContext: MemoryContext
  private readonly maxShortTermMemory = 20
  private readonly maxLongTermHistory = 100

  constructor(userId: string = 'default-user') {
    this.userProfile = this.loadOrCreateUserProfile(userId)
    this.memoryContext = this.initializeMemoryContext()
  }

  // Initialize or load user profile
  private loadOrCreateUserProfile(userId: string): UserProfile {
    // Check if we're on the client side before accessing localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(`aaran-profile-${userId}`)
      
      if (stored) {
        try {
          const profile = JSON.parse(stored) as UserProfile
          profile.lastActive = new Date()
          this.saveUserProfile(profile)
          return profile
        } catch {
          console.warn('Failed to load user profile, creating new one')
        }
      }
    }

    // Create new user profile with intelligent defaults
    return {
      id: userId,
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        responseStyle: 'detailed',
        favoriteMetrics: ['revenue', 'risk'],
        preferredScenarios: ['current'],
        conversationFlow: 'continuous',
        financialFocus: 'balanced',
        detailLevel: 'intermediate'
      },
      interactionHistory: [],
      learningData: {
        frequentQueries: [],
        successfulActions: [],
        improvementAreas: [],
        responsePatterns: [],
        financialInterests: []
      },
      personalityTrait: 'analytical',
      privacySettings: {
        enableLearning: true,
        retainHistory: true,
        shareInsights: false
      }
    }
  }

  // Initialize memory context
  private initializeMemoryContext(): MemoryContext {
    return {
      shortTermMemory: [],
      currentSession: {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        turnsCount: 0,
        topicFocus: 'general',
        lastPosition: 12,
        lastScenario: 'current',
        financialInsights: []
      },
      longTermMemory: {
        patterns: this.extractPatterns(),
        preferences: this.extractPreferences(),
        expertise: this.assessExpertise()
      }
    }
  }

  // Learn from user interaction
  learnFromInteraction(interaction: {
    userInput: string
    intent: string
    aaranResponse: string
    actionTaken?: string
    financialData?: any
    userFeedback?: 'positive' | 'negative' | 'neutral'
  }): void {
    if (!this.userProfile.privacySettings.enableLearning) return

    // Record the conversation turn
    const turn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      timestamp: new Date(),
      userInput: interaction.userInput,
      intent: interaction.intent,
      aaranResponse: interaction.aaranResponse,
      actionTaken: interaction.actionTaken,
      contextUsed: this.getActiveContext()
    }

    // Add to short-term memory
    this.memoryContext.shortTermMemory.push(turn)
    if (this.memoryContext.shortTermMemory.length > this.maxShortTermMemory) {
      this.memoryContext.shortTermMemory = this.memoryContext.shortTermMemory.slice(-this.maxShortTermMemory)
    }

    // Update session context
    this.memoryContext.currentSession.turnsCount++
    this.updateTopicFocus(interaction.intent)

    // Learn user patterns
    this.updateLearningData(interaction)
    this.updatePreferences(interaction)

    // Save updated profile
    this.saveUserProfile(this.userProfile)
  }

  // Personalize response based on user profile and context
  personalizeResponse(baseResponse: string, context: {
    intent: string
    financialData?: any
    position?: number
    scenario?: string
  }): string {
    const { preferences } = this.userProfile
    let personalizedResponse = baseResponse

    // Apply response style preference
    personalizedResponse = this.applyResponseStyle(personalizedResponse, preferences.responseStyle)

    // Add financial context based on user's focus
    personalizedResponse = this.enhanceWithFinancialContext(
      personalizedResponse, 
      context, 
      preferences.financialFocus
    )

    // Add conversational continuity
    personalizedResponse = this.addConversationalContinuity(personalizedResponse, context)

    // Apply detail level preference
    personalizedResponse = this.adjustDetailLevel(personalizedResponse, preferences.detailLevel)

    return personalizedResponse
  }

  // Apply user's preferred response style
  private applyResponseStyle(response: string, style: string): string {
    switch (style) {
      case 'brief':
        return this.makeBrief(response)
      case 'explanatory':
        return this.makeExplanatory(response)
      case 'detailed':
      default:
        return response
    }
  }

  // Enhance response with financial context based on user's focus
  private enhanceWithFinancialContext(
    response: string, 
    context: any, 
    focus: string
  ): string {
    if (!context.financialData) return response

    const { financialData, position } = context
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { scenario } = context
    let enhancement = ''

    // Add position-specific financial insights
    if (position && this.shouldAddFinancialInsight()) {
      switch (focus) {
        case 'revenue':
          enhancement = ` Revenue at position ${position} is £${financialData.totalRevenue}M`
          if (this.hasRecentComparison()) {
            const comparison = this.getRevenueComparison(position)
            enhancement += `, ${comparison}`
          }
          break

        case 'risk':
          enhancement = ` Risk score: ${financialData.riskScore}/10 (${financialData.positionRisk})`
          break

        case 'sustainability':
          enhancement = ` Sustainability: ${financialData.sustainabilityDays} days cash flow`
          break

        case 'balanced':
        default:
          if (this.isSignificantChange(financialData)) {
            enhancement = ` Revenue: £${financialData.totalRevenue}M, Risk: ${financialData.riskScore}/10`
          }
          break
      }
    }

    return response + enhancement
  }

  // Add conversational continuity suggestions
  private addConversationalContinuity(response: string, context: any): string {
    if (this.userProfile.preferences.conversationFlow === 'single_command') {
      return response
    }

    // Check if the response already has a follow-up question
    const hasExistingFollowUp = response.match(/[?!]$/) && 
      (response.includes('Want to') || response.includes('Should I') || 
       response.includes('Would you like') || response.includes('Shall I') ||
       response.includes('What') || response.includes('Try') ||
       response.includes('Explore') || response.includes('Check') ||
       response.includes('Compare') || response.includes('See'))

    if (hasExistingFollowUp) {
      // Response already has a conversational follow-up, don't add another
      return response
    }

    const suggestions = this.generateFollowUpSuggestions(context)
    if (suggestions.length > 0) {
      const suggestion = suggestions[0] // Pick most relevant
      return response + ` ${suggestion}`
    }

    return response
  }

  // Generate intelligent follow-up suggestions
  private generateFollowUpSuggestions(context: any): string[] {
    const suggestions: string[] = []
    const recentTopics = this.getRecentTopics()

    if (context.intent === 'POSITION_CHANGE') {
      if (!recentTopics.includes('scenario')) {
        suggestions.push("Would you like to explore different scenarios for this position?")
      }
      if (!recentTopics.includes('revenue')) {
        suggestions.push("Shall I explain the revenue implications?")
      }
    }

    if (context.intent === 'FINANCIAL_QUERY' && !recentTopics.includes('comparison')) {
      suggestions.push("Would you like me to compare this with other positions?")
    }

    return suggestions
  }

  // Get conversation summary for the current session
  getConversationSummary(): ConversationSummary {
    const session = this.memoryContext.currentSession
    const turns = this.memoryContext.shortTermMemory

    return {
      sessionId: session.id,
      timestamp: session.startTime,
      duration: Date.now() - session.startTime.getTime(),
      topicsDiscussed: [...new Set(turns.map(t => t.intent))],
      positionsExplored: [...new Set(turns.map(t => t.newPosition).filter(p => p !== undefined))],
      scenariosUsed: [...new Set(turns.map(t => t.newScenario).filter(s => s !== undefined))],
      successfulActions: turns.filter(t => t.actionTaken).map(t => t.actionTaken!),
      keyInsights: session.financialInsights
    }
  }

  // Get user preferences for external use
  getUserPreferences(): UserPreferences {
    return { ...this.userProfile.preferences }
  }

  // Update user preferences
  updateUserPreferences(updates: Partial<UserPreferences>): void {
    this.userProfile.preferences = { ...this.userProfile.preferences, ...updates }
    this.saveUserProfile(this.userProfile)
  }

  // Get recent conversation context
  getRecentContext(turns: number = 3): string[] {
    return this.memoryContext.shortTermMemory
      .slice(-turns)
      .map(turn => `${turn.intent}: ${turn.userInput}`)
  }

  // Helper methods
  private updateLearningData(interaction: any): void {
    const { learningData } = this.userProfile

    // Update frequent queries
    const existingQuery = learningData.frequentQueries.find(q => 
      q.query.toLowerCase() === interaction.userInput.toLowerCase()
    )

    if (existingQuery) {
      existingQuery.count++
      existingQuery.lastUsed = new Date()
    } else {
      learningData.frequentQueries.push({
        query: interaction.userInput,
        count: 1,
        lastUsed: new Date()
      })
    }

    // Keep only top 50 queries
    learningData.frequentQueries = learningData.frequentQueries
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)
  }

  private updatePreferences(interaction: any): void {
    // Infer preferences from user behavior
    if (interaction.intent === 'FINANCIAL_QUERY' && interaction.actionTaken) {
      const metric = this.extractMetricFromQuery(interaction.userInput)
      if (metric && !this.userProfile.preferences.favoriteMetrics.includes(metric)) {
        this.userProfile.preferences.favoriteMetrics.push(metric)
      }
    }
  }

  private saveUserProfile(profile: UserProfile): void {
    if (profile.privacySettings.retainHistory && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`aaran-profile-${profile.id}`, JSON.stringify(profile))
      } catch (error) {
        console.warn('Failed to save user profile:', error)
      }
    }
  }

  private shouldAddFinancialInsight(): boolean {
    return this.memoryContext.currentSession.turnsCount >= 1 &&
           this.userProfile.preferences.detailLevel !== 'basic'
  }

  private hasRecentComparison(): boolean {
    return this.memoryContext.shortTermMemory.some(turn => 
      turn.intent.includes('COMPARISON') || turn.userInput.includes('compare')
    )
  }

  private isSignificantChange(financialData: any): boolean {
    // Determine if financial change is significant enough to mention
    return Math.abs(financialData.totalRevenue - 150) > 10 || // Revenue change > 10M
           Math.abs(financialData.riskScore - 5) > 1 // Risk change > 1 point
  }

  private getRecentTopics(): string[] {
    return this.memoryContext.shortTermMemory
      .slice(-3)
      .map(turn => turn.intent.toLowerCase())
  }

  private updateTopicFocus(intent: string): void {
    if (intent.includes('FINANCIAL')) {
      this.memoryContext.currentSession.topicFocus = 'financial'
    } else if (intent.includes('POSITION')) {
      this.memoryContext.currentSession.topicFocus = 'position'
    } else if (intent.includes('SCENARIO')) {
      this.memoryContext.currentSession.topicFocus = 'scenario'
    }
  }

  private getActiveContext(): string[] {
    return [
      this.memoryContext.currentSession.topicFocus,
      `position-${this.memoryContext.currentSession.lastPosition}`,
      `scenario-${this.memoryContext.currentSession.lastScenario}`
    ]
  }

  private extractPatterns(): string[] {
    return this.userProfile.learningData.frequentQueries
      .slice(0, 5)
      .map(q => q.query)
  }

  private extractPreferences(): string[] {
    return [
      `style-${this.userProfile.preferences.responseStyle}`,
      `focus-${this.userProfile.preferences.financialFocus}`,
      ...this.userProfile.preferences.favoriteMetrics
    ]
  }

  private assessExpertise(): string[] {
    const turnsCount = this.userProfile.interactionHistory.reduce((sum, session) => 
      sum + (session.successfulActions?.length || 0), 0
    )

    if (turnsCount > 50) return ['expert']
    if (turnsCount > 20) return ['intermediate']
    return ['beginner']
  }

  private makeBrief(response: string): string {
    // Simplify response for brief style
    return response.split('.')[0] + '.'
  }

  private makeExplanatory(response: string): string {
    // Add explanatory context
    return response + " This helps you understand the financial implications better."
  }

  private adjustDetailLevel(response: string, level: string): string {
    if (level === 'basic') {
      return this.makeBrief(response)
    }
    if (level === 'advanced') {
      return this.makeExplanatory(response)
    }
    return response
  }

  private getRevenueComparison(position: number): string {
    // Simple comparison logic - could be enhanced with actual data
    const prevTurn = this.memoryContext.shortTermMemory.slice(-2)[0]
    if (prevTurn?.newPosition) {
      const direction = position < prevTurn.newPosition ? 'up' : 'down'
      return `${direction} from position ${prevTurn.newPosition}`
    }
    return 'showing current league position impact'
  }

  private extractMetricFromQuery(query: string): string | null {
    const metrics = ['revenue', 'risk', 'cash', 'sustainability', 'wages']
    return metrics.find(metric => query.toLowerCase().includes(metric)) || null
  }
}

// Export default instance with intelligent fallback system
let defaultConversationMemory: ConversationMemory | null = null
let redisConversationMemory: any = null
let enhancedConversationMemory: any = null

export const getDefaultConversationMemory = (): ConversationMemory => {
  // Fallback to localStorage-based system immediately for synchronous usage
  if (!defaultConversationMemory) {
    defaultConversationMemory = new ConversationMemory()
    console.log('📝 Using localStorage-based conversation memory system')
  }

  return defaultConversationMemory!
}

// Async version for enhanced memory systems
export const getDefaultConversationMemoryAsync = async (): Promise<ConversationMemory> => {
  // Check if Vector + Redis environment variables are available
  const hasVectorConfig = process.env.UPSTASH_VECTOR_UPSTASH_VECTOR_REST_URL && 
                          process.env.UPSTASH_VECTOR_UPSTASH_VECTOR_REST_TOKEN
  const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (hasVectorConfig && hasRedisConfig && typeof window !== 'undefined') {
    // Use Enhanced Vector+Redis system when available
    if (!enhancedConversationMemory) {
      try {
        const enhancedModule = await import('./conversation-memory-enhanced')
        const { getEnhancedConversationMemory } = enhancedModule
        enhancedConversationMemory = getEnhancedConversationMemory()
        console.log('🚀 Using Enhanced Vector+Redis conversation memory system')
        return enhancedConversationMemory
      } catch (error) {
        console.error('Enhanced memory initialization failed, falling back to Redis:', error)
        // Fall through to Redis fallback
      }
    } else {
      return enhancedConversationMemory
    }
  }
  
  if (hasRedisConfig && typeof window !== 'undefined') {
    // Use Redis-based memory system when available
    if (!redisConversationMemory) {
      try {
        const redisModule = await import('./conversation-memory-redis')
        const { getRedisConversationMemory } = redisModule
        redisConversationMemory = getRedisConversationMemory()
        console.log('🔄 Using Redis-based conversation memory system')
        return redisConversationMemory
      } catch (error) {
        console.error('Redis memory initialization failed, falling back to localStorage:', error)
        // Fall through to localStorage fallback
      }
    } else {
      return redisConversationMemory
    }
  }

  // Fallback to localStorage-based system
  return getDefaultConversationMemory()
}