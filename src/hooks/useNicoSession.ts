// React Hook for NICO Session Management
// Provides persistent conversation memory and context tracking

import { useState, useEffect, useCallback, useRef } from 'react'
import { NicoSession, NicoMessage, NicoContext, NicoPreferences } from '@/utils/nico-session-storage'

interface UseNicoSessionOptions {
  userId: string
  clubId?: string
  autoCreate?: boolean
  preferences?: Partial<NicoPreferences>
}

interface UseNicoSessionReturn {
  session: NicoSession | null
  sessionId: string | null
  isLoading: boolean
  error: string | null
  
  // Session management
  createSession: () => Promise<boolean>
  endSession: () => Promise<boolean>
  refreshSession: () => Promise<boolean>
  
  // Message management
  addMessage: (type: 'user' | 'nico' | 'system', content: string, intent?: string, metadata?: any) => Promise<boolean>
  getMessages: () => NicoMessage[]
  
  // Context management
  updateContext: (context: Partial<NicoContext>) => Promise<boolean>
  highlightPlayer: (playerName: string | null) => Promise<boolean>
  setScenario: (scenario: NicoContext['activeScenario']) => Promise<boolean>
  recordAction: (action: string) => Promise<boolean>
  
  // Conversation state
  updateConversationState: (state: NicoSession['conversationFlow']['conversationState'], topic?: string) => Promise<boolean>
  
  // Analytics
  getAnalytics: () => Promise<any>
  
  // Utilities
  isConnected: boolean
  lastActivity: Date | null
}

export const useNicoSession = (options: UseNicoSessionOptions): UseNicoSessionReturn => {
  const { userId, clubId = 'manchester_united', autoCreate = true, preferences } = options
  
  const [session, setSession] = useState<NicoSession | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const sessionRef = useRef<NicoSession | null>(null)
  sessionRef.current = session

  // API call wrapper
  const apiCall = useCallback(async (action: string, params: any = {}) => {
    try {
      const response = await fetch('/api/nico-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API call failed'
      setError(errorMessage)
      console.error(`NICO API call failed (${action}):`, err)
      throw err
    }
  }, [])

  // Create new session
  const createSession = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await apiCall('create_session', { userId, clubId, preferences })
      
      const newSession = result.data.session
      setSession(newSession)
      setSessionId(newSession.sessionId)
      setIsConnected(true)
      
      console.log('🎯 NICO session created:', newSession.sessionId)
      return true
    } catch (err) {
      console.error('Failed to create NICO session:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId, clubId, preferences, apiCall])

  // End current session
  const endSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('end_session', { sessionId })
      
      setSession(null)
      setSessionId(null)
      setIsConnected(false)
      
      console.log('🏁 NICO session ended:', sessionId)
      return true
    } catch (err) {
      console.error('Failed to end NICO session:', err)
      return false
    }
  }, [sessionId, apiCall])

  // Refresh session data
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      const result = await apiCall('get_session', { sessionId })
      
      setSession(result.data.session)
      setIsConnected(true)
      
      return true
    } catch (err) {
      console.error('Failed to refresh NICO session:', err)
      setIsConnected(false)
      return false
    }
  }, [sessionId, apiCall])

  // Add message to conversation
  const addMessage = useCallback(async (
    type: 'user' | 'nico' | 'system', 
    content: string, 
    intent?: string, 
    metadata?: any
  ): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('add_message', {
        sessionId,
        type,
        content,
        intent,
        metadata
      })

      // Refresh session to get updated messages
      await refreshSession()
      
      return true
    } catch (err) {
      console.error('Failed to add message to NICO session:', err)
      return false
    }
  }, [sessionId, apiCall, refreshSession])

  // Get conversation messages
  const getMessages = useCallback((): NicoMessage[] => {
    return session?.conversationFlow.messages || []
  }, [session])

  // Update context
  const updateContext = useCallback(async (context: Partial<NicoContext>): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('update_context', { sessionId, context })
      
      // Update local session
      if (session) {
        setSession({
          ...session,
          context: { ...session.context, ...context }
        })
      }
      
      return true
    } catch (err) {
      console.error('Failed to update NICO context:', err)
      return false
    }
  }, [sessionId, session, apiCall])

  // Highlight player
  const highlightPlayer = useCallback(async (playerName: string | null): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('highlight_player', { sessionId, playerName })
      
      // Update local context
      await updateContext({ highlightedPlayer: playerName })
      
      return true
    } catch (err) {
      console.error('Failed to highlight player in NICO session:', err)
      return false
    }
  }, [sessionId, apiCall, updateContext])

  // Set scenario
  const setScenario = useCallback(async (scenario: NicoContext['activeScenario']): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('set_scenario', { sessionId, scenario })
      
      // Update local context
      await updateContext({ activeScenario: scenario })
      
      return true
    } catch (err) {
      console.error('Failed to set scenario in NICO session:', err)
      return false
    }
  }, [sessionId, apiCall, updateContext])

  // Record action
  const recordAction = useCallback(async (action: string): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('record_action', { sessionId, action })
      
      // Update local context
      await updateContext({ lastAction: action })
      
      return true
    } catch (err) {
      console.error('Failed to record action in NICO session:', err)
      return false
    }
  }, [sessionId, apiCall, updateContext])

  // Update conversation state
  const updateConversationState = useCallback(async (
    state: NicoSession['conversationFlow']['conversationState'], 
    topic?: string
  ): Promise<boolean> => {
    if (!sessionId) return false
    
    try {
      await apiCall('update_conversation_state', { sessionId, state, topic })
      
      // Update local session
      if (session) {
        setSession({
          ...session,
          conversationFlow: {
            ...session.conversationFlow,
            conversationState: state,
            currentTopic: topic || session.conversationFlow.currentTopic
          }
        })
      }
      
      return true
    } catch (err) {
      console.error('Failed to update conversation state:', err)
      return false
    }
  }, [sessionId, session, apiCall])

  // Get analytics
  const getAnalytics = useCallback(async () => {
    try {
      const result = await apiCall('get_analytics', { userId })
      return result.data.analytics
    } catch (err) {
      console.error('Failed to get NICO analytics:', err)
      return null
    }
  }, [userId, apiCall])

  // Auto-create session on mount if needed
  useEffect(() => {
    if (autoCreate && !session && !isLoading) {
      createSession()
    }
  }, [autoCreate, session, isLoading, createSession])

  // Auto-refresh session every 5 minutes
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(() => {
      refreshSession()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [sessionId, refreshSession])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't auto-end session on unmount - keep it alive for continuation
    }
  }, [])

  return {
    session,
    sessionId,
    isLoading,
    error,
    
    createSession,
    endSession,
    refreshSession,
    
    addMessage,
    getMessages,
    
    updateContext,
    highlightPlayer,
    setScenario,
    recordAction,
    
    updateConversationState,
    
    getAnalytics,
    
    isConnected,
    lastActivity: session?.lastActiveAt || null
  }
}