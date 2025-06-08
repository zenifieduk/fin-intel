// User Profile Management System for Aaran Voice Assistant
// Handles user preferences, privacy settings, and profile customization

import { UserProfile, UserPreferences, ConversationSummary } from './conversation-memory'

export interface ProfileUpdateEvent {
  type: 'preference_change' | 'privacy_update' | 'profile_reset'
  data: any
  timestamp: Date
}

export class UserProfileManager {
  private profile: UserProfile
  private updateListeners: ((event: ProfileUpdateEvent) => void)[] = []

  constructor(profile: UserProfile) {
    this.profile = profile
  }

  // Get current user profile
  getProfile(): UserProfile {
    return { ...this.profile }
  }

  // Update user preferences with validation
  updatePreferences(updates: Partial<UserPreferences>): boolean {
    try {
      const updatedPreferences = { ...this.profile.preferences, ...updates }
      
      // Validate preferences
      if (!this.validatePreferences(updatedPreferences)) {
        console.warn('Invalid preference updates')
        return false
      }

      this.profile.preferences = updatedPreferences
      this.profile.lastActive = new Date()
      
      this.notifyListeners({
        type: 'preference_change',
        data: updates,
        timestamp: new Date()
      })

      this.saveProfile()
      return true
    } catch (error) {
      console.error('Failed to update preferences:', error)
      return false
    }
  }

  // Update privacy settings
  updatePrivacySettings(settings: Partial<UserProfile['privacySettings']>): boolean {
    try {
      this.profile.privacySettings = { ...this.profile.privacySettings, ...settings }
      this.profile.lastActive = new Date()

      this.notifyListeners({
        type: 'privacy_update',
        data: settings,
        timestamp: new Date()
      })

      this.saveProfile()
      return true
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      return false
    }
  }

  // Get personalized dashboard settings
  getDashboardSettings(): {
    theme: 'light' | 'dark' | 'auto'
    layout: 'compact' | 'detailed' | 'minimal'
    defaultView: 'overview' | 'financial' | 'position'
    autoRefresh: boolean
    voiceEnabled: boolean
  } {
    const { preferences } = this.profile

    return {
      theme: 'dark', // Default for financial dashboards
      layout: preferences.detailLevel === 'basic' ? 'minimal' : 
              preferences.detailLevel === 'advanced' ? 'detailed' : 'compact',
      defaultView: preferences.financialFocus === 'balanced' ? 'overview' : 'financial',
      autoRefresh: preferences.conversationFlow === 'continuous',
      voiceEnabled: this.profile.privacySettings.enableLearning
    }
  }

  // Get conversation preferences for UI
  getConversationSettings(): {
    enableContinuousListening: boolean
    responseStyle: string
    showFinancialInsights: boolean
    enableFollowUpSuggestions: boolean
    privacyMode: boolean
  } {
    return {
      enableContinuousListening: this.profile.preferences.conversationFlow === 'continuous',
      responseStyle: this.profile.preferences.responseStyle,
      showFinancialInsights: this.profile.preferences.financialFocus !== 'revenue',
      enableFollowUpSuggestions: this.profile.preferences.conversationFlow !== 'single_command',
      privacyMode: !this.profile.privacySettings.enableLearning
    }
  }

  // Add conversation summary to history
  addConversationSummary(summary: ConversationSummary): void {
    if (!this.profile.privacySettings.retainHistory) return

    this.profile.interactionHistory.push(summary)
    
    // Keep only recent 100 sessions
    if (this.profile.interactionHistory.length > 100) {
      this.profile.interactionHistory = this.profile.interactionHistory.slice(-100)
    }

    this.profile.lastActive = new Date()
    this.saveProfile()
  }

  // Get usage statistics
  getUsageStatistics(): {
    totalSessions: number
    averageSessionDuration: number
    mostUsedFeatures: string[]
    preferredTopics: string[]
    expertiseLevel: string
    learningProgress: number
  } {
    const history = this.profile.interactionHistory
    const totalSessions = history.length

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        mostUsedFeatures: [],
        preferredTopics: [],
        expertiseLevel: 'beginner',
        learningProgress: 0
      }
    }

    const avgDuration = history.reduce((sum, session) => sum + session.duration, 0) / totalSessions
    const allTopics = history.flatMap(session => session.topicsDiscussed)
    const topicFrequency = this.calculateFrequency(allTopics)
    const allActions = history.flatMap(session => session.successfulActions)
    const actionFrequency = this.calculateFrequency(allActions)

    return {
      totalSessions,
      averageSessionDuration: avgDuration,
      mostUsedFeatures: Object.keys(actionFrequency).slice(0, 5),
      preferredTopics: Object.keys(topicFrequency).slice(0, 5),
      expertiseLevel: this.assessExpertiseLevel(totalSessions, allActions.length),
      learningProgress: Math.min(100, (totalSessions / 20) * 100) // Progress to intermediate
    }
  }

  // Reset profile while preserving privacy preferences
  resetProfile(keepPrivacySettings: boolean = true): void {
    const privacySettings = keepPrivacySettings ? this.profile.privacySettings : {
      enableLearning: true,
      retainHistory: true,
      shareInsights: false
    }

    this.profile = {
      ...this.profile,
      preferences: {
        responseStyle: 'detailed',
        favoriteMetrics: ['revenue', 'risk'],
        preferredScenarios: ['current'],
        conversationFlow: 'continuous',
        financialFocus: 'balanced',
        detailLevel: 'intermediate'
      },
      interactionHistory: keepPrivacySettings ? this.profile.interactionHistory : [],
      learningData: {
        frequentQueries: [],
        successfulActions: [],
        improvementAreas: [],
        responsePatterns: [],
        financialInterests: []
      },
      personalityTrait: 'analytical',
      privacySettings
    }

    this.notifyListeners({
      type: 'profile_reset',
      data: { keepPrivacySettings },
      timestamp: new Date()
    })

    this.saveProfile()
  }

  // Export profile data (for backup/transfer)
  exportProfile(): string {
    const exportData = {
      ...this.profile,
      exportDate: new Date(),
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Import profile data (with validation)
  importProfile(profileData: string): boolean {
    try {
      const imported = JSON.parse(profileData) as UserProfile & { version?: string }
      
      if (!this.validateProfile(imported)) {
        console.error('Invalid profile data')
        return false
      }

      // Merge with current profile, preserving critical settings
      this.profile = {
        ...imported,
        id: this.profile.id, // Keep current ID
        lastActive: new Date(),
        privacySettings: {
          ...imported.privacySettings,
          // Ensure privacy settings are explicitly confirmed on import
          enableLearning: false // User must explicitly re-enable
        }
      }

      this.saveProfile()
      return true
    } catch (error) {
      console.error('Failed to import profile:', error)
      return false
    }
  }

  // Subscribe to profile updates
  onUpdate(listener: (event: ProfileUpdateEvent) => void): () => void {
    this.updateListeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.updateListeners.indexOf(listener)
      if (index > -1) {
        this.updateListeners.splice(index, 1)
      }
    }
  }

  // Private helper methods
  private validatePreferences(preferences: UserPreferences): boolean {
    const validResponseStyles = ['brief', 'detailed', 'explanatory']
    const validConversationFlows = ['single_command', 'continuous', 'guided']
    const validFinancialFocus = ['revenue', 'risk', 'sustainability', 'balanced']
    const validDetailLevels = ['basic', 'intermediate', 'advanced']

    return validResponseStyles.includes(preferences.responseStyle) &&
           validConversationFlows.includes(preferences.conversationFlow) &&
           validFinancialFocus.includes(preferences.financialFocus) &&
           validDetailLevels.includes(preferences.detailLevel) &&
           Array.isArray(preferences.favoriteMetrics) &&
           Array.isArray(preferences.preferredScenarios)
  }

  private validateProfile(profile: any): profile is UserProfile {
    return profile &&
           typeof profile.id === 'string' &&
           profile.preferences &&
           profile.learningData &&
           profile.privacySettings &&
           Array.isArray(profile.interactionHistory)
  }

  private calculateFrequency(items: string[]): Record<string, number> {
    return items.reduce((freq, item) => {
      freq[item] = (freq[item] || 0) + 1
      return freq
    }, {} as Record<string, number>)
  }

  private assessExpertiseLevel(sessions: number, actions: number): string {
    if (sessions > 50 && actions > 100) return 'expert'
    if (sessions > 20 && actions > 40) return 'intermediate'
    return 'beginner'
  }

  private notifyListeners(event: ProfileUpdateEvent): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in profile update listener:', error)
      }
    })
  }

  private saveProfile(): void {
    if (this.profile.privacySettings.retainHistory && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`aaran-profile-${this.profile.id}`, JSON.stringify(this.profile))
      } catch (error) {
        console.error('Failed to save profile:', error)
      }
    }
  }
}

// Utility functions for profile management
export const ProfileUtils = {
  // Create default profile
  createDefaultProfile(userId: string): UserProfile {
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
  },

  // Analyze user behavior patterns
  analyzeUserBehavior(profile: UserProfile): {
    primaryInterests: string[]
    responsePreference: string
    activityLevel: 'low' | 'medium' | 'high'
    expertiseGrowth: number
  } {
    const { interactionHistory, learningData } = profile
    
    const totalSessions = interactionHistory.length
    const totalQueries = learningData.frequentQueries.reduce((sum, q) => sum + q.count, 0)
    
    const activityLevel = totalSessions > 30 ? 'high' : 
                         totalSessions > 10 ? 'medium' : 'low'

    const primaryInterests = learningData.financialInterests
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(interest => interest.metric)

    const expertiseGrowth = Math.min(100, (totalQueries / 50) * 100)

    return {
      primaryInterests,
      responsePreference: profile.preferences.responseStyle,
      activityLevel,
      expertiseGrowth
    }
  },

  // Generate personalized recommendations
  generateRecommendations(profile: UserProfile): string[] {
    const recommendations: string[] = []
    const behavior = this.analyzeUserBehavior(profile)

    if (behavior.activityLevel === 'low') {
      recommendations.push("Try exploring different league positions to see revenue impacts")
      recommendations.push("Ask about specific financial metrics like 'What's the risk score?'")
    }

    if (behavior.primaryInterests.includes('revenue')) {
      recommendations.push("Explore scenario planning with 'best case' and 'worst case' commands")
    }

    if (profile.preferences.detailLevel === 'basic') {
      recommendations.push("Consider switching to 'intermediate' detail level for richer insights")
    }

    if (behavior.expertiseGrowth > 70) {
      recommendations.push("You're becoming an expert! Try advanced features like position comparisons")
    }

    return recommendations
  }
}