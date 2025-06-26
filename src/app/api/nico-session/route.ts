import { NextRequest, NextResponse } from 'next/server'
import { getNicoSessionStorage, NicoSession } from '@/utils/nico-session-storage'

// NICO Session Management API
// Handles session creation, updates, message storage, and analytics

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    const nicoStorage = getNicoSessionStorage()

    switch (action) {
      case 'create_session': {
        const { userId, clubId, preferences } = params
        const session = await nicoStorage.createSession(userId, preferences)
        
        return NextResponse.json({
          success: true,
          message: 'NICO session created successfully',
          data: { sessionId: session.sessionId, session }
        })
      }

      case 'get_session': {
        const { sessionId } = params
        const session = await nicoStorage.getSession(sessionId)
        
        if (!session) {
          return NextResponse.json({
            success: false,
            message: 'Session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Session retrieved successfully',
          data: { session }
        })
      }

      case 'add_message': {
        const { sessionId, type, content, intent, context, metadata } = params
        const success = await nicoStorage.addMessage(sessionId, {
          type,
          content,
          intent,
          context,
          metadata
        })

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to add message - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Message added successfully'
        })
      }

      case 'update_context': {
        const { sessionId, context } = params
        const success = await nicoStorage.updateContext(sessionId, context)

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to update context - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Context updated successfully'
        })
      }

      case 'highlight_player': {
        const { sessionId, playerName } = params
        const success = await nicoStorage.highlightPlayer(sessionId, playerName)

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to highlight player - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: `Player highlight ${playerName ? 'set' : 'cleared'} successfully`,
          data: { highlightedPlayer: playerName }
        })
      }

      case 'set_scenario': {
        const { sessionId, scenario } = params
        const success = await nicoStorage.setScenario(sessionId, scenario)

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to set scenario - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: `Scenario set to ${scenario} successfully`,
          data: { activeScenario: scenario }
        })
      }

      case 'record_action': {
        const { sessionId, action: actionName } = params
        const success = await nicoStorage.recordAction(sessionId, actionName)

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to record action - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: `Action "${actionName}" recorded successfully`
        })
      }

      case 'update_conversation_state': {
        const { sessionId, state, topic } = params
        const success = await nicoStorage.updateConversationState(sessionId, state, topic)

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to update conversation state - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: `Conversation state updated to ${state}`,
          data: { conversationState: state, currentTopic: topic }
        })
      }

      case 'search_conversations': {
        const { query, limit = 5 } = params
        const results = await nicoStorage.searchSimilarConversations(query, limit)

        return NextResponse.json({
          success: true,
          message: `Found ${results.length} similar conversations`,
          data: { results }
        })
      }

      case 'get_analytics': {
        const { userId } = params
        const analytics = await nicoStorage.getSessionAnalytics(userId)

        if (!analytics) {
          return NextResponse.json({
            success: false,
            message: 'No analytics data found for user'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Analytics retrieved successfully',
          data: { analytics }
        })
      }

      case 'end_session': {
        const { sessionId } = params
        const success = await nicoStorage.endSession(sessionId)

        if (!success) {
          return NextResponse.json({
            success: false,
            message: 'Failed to end session - session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Session ended successfully'
        })
      }

      case 'health_check': {
        const health = await nicoStorage.healthCheck()

        return NextResponse.json({
          success: health.redis && health.vector,
          message: `Health check: Redis ${health.redis ? '✅' : '❌'}, Vector DB ${health.vector ? '✅' : '❌'}`,
          data: health
        })
      }

      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`,
          availableActions: [
            'create_session', 'get_session', 'add_message', 'update_context',
            'highlight_player', 'set_scenario', 'record_action', 'update_conversation_state',
            'search_conversations', 'get_analytics', 'end_session', 'health_check'
          ]
        }, { status: 400 })
    }
  } catch (error) {
    console.error('NICO session API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') || 'get_session'

    const nicoStorage = getNicoSessionStorage()

    switch (action) {
      case 'get_session':
        if (!sessionId) {
          return NextResponse.json({
            success: false,
            message: 'sessionId parameter required'
          }, { status: 400 })
        }

        const session = await nicoStorage.getSession(sessionId)
        if (!session) {
          return NextResponse.json({
            success: false,
            message: 'Session not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Session retrieved successfully',
          data: { session }
        })

      case 'get_analytics':
        if (!userId) {
          return NextResponse.json({
            success: false,
            message: 'userId parameter required'
          }, { status: 400 })
        }

        const analytics = await nicoStorage.getSessionAnalytics(userId)
        if (!analytics) {
          return NextResponse.json({
            success: false,
            message: 'No analytics data found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: 'Analytics retrieved successfully',
          data: { analytics }
        })

      case 'health_check':
        const health = await nicoStorage.healthCheck()
        return NextResponse.json({
          success: health.redis && health.vector,
          message: `NICO Storage Health: Redis ${health.redis ? '✅' : '❌'}, Vector DB ${health.vector ? '✅' : '❌'}`,
          data: health
        })

      default:
        return NextResponse.json({
          success: false,
          message: `Unknown GET action: ${action}`,
          availableActions: ['get_session', 'get_analytics', 'health_check']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('NICO session GET API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}