import { NextRequest, NextResponse } from 'next/server'
import { getNicoSessionStorage } from '@/utils/nico-session-storage'

// Voice page control commands for NICO
interface VoiceControlCommand {
  action: 'set_position' | 'set_scenario' | 'get_current_state' | 'move_relative' | 'reset_board' | 'highlight_player'
  position?: number
  scenario?: string
  direction?: 'up' | 'down'
  steps?: number
  message?: string
  highlight_player?: string
  sessionId?: string
}

// Global state store for voice page (in production, use Redis/database)
let voicePageState = {
  position: 12,
  scenario: 'safe_midtable',
  highlightedPlayer: null as string | null,
  lastUpdate: Date.now()
}

export async function POST(request: NextRequest) {
  try {
    const command: VoiceControlCommand = await request.json()
    
    console.log('🎮 Voice Control Command:', command)
    
    let response = { success: false, message: '', data: {} }
    
    switch (command.action) {
      case 'set_position':
        if (command.position && command.position >= 1 && command.position <= 24) {
          voicePageState.position = command.position
          voicePageState.lastUpdate = Date.now()
          
          response = {
            success: true,
            message: `Position set to ${command.position}`,
            data: { 
              position: command.position,
              scenario: voicePageState.scenario
            }
          }
        } else {
          response = {
            success: false,
            message: 'Invalid position. Must be between 1 and 24.',
            data: {}
          }
        }
        break
        
      case 'set_scenario':
        const validScenarios = ['title_race', 'promotion_push', 'safe_midtable', 'relegation_battle', 'financial_crisis']
        if (command.scenario && validScenarios.includes(command.scenario)) {
          voicePageState.scenario = command.scenario
          voicePageState.lastUpdate = Date.now()
          
          // Set appropriate position for scenario
          const scenarioPositions: { [key: string]: number } = {
            'title_race': 1,
            'promotion_push': 6,
            'safe_midtable': 12,
            'relegation_battle': 18,
            'financial_crisis': 22
          }
          
          voicePageState.position = scenarioPositions[command.scenario]
          
          response = {
            success: true,
            message: `Scenario set to ${command.scenario} at position ${voicePageState.position}`,
            data: { 
              position: voicePageState.position,
              scenario: command.scenario
            }
          }
        } else {
          response = {
            success: false,
            message: 'Invalid scenario. Valid options: title_race, promotion_push, safe_midtable, relegation_battle, financial_crisis',
            data: {}
          }
        }
        break
        
      case 'move_relative':
        const currentPos = voicePageState.position
        const steps = command.steps || 1
        let newPosition = currentPos
        
        if (command.direction === 'up' && currentPos > steps) {
          newPosition = currentPos - steps
        } else if (command.direction === 'down' && currentPos <= (24 - steps)) {
          newPosition = currentPos + steps
        }
        
        if (newPosition !== currentPos) {
          voicePageState.position = newPosition
          voicePageState.lastUpdate = Date.now()
          
          response = {
            success: true,
            message: `Moved ${command.direction} ${steps} position(s) to ${newPosition}`,
            data: { 
              position: newPosition,
              scenario: voicePageState.scenario,
              previousPosition: currentPos
            }
          }
        } else {
          response = {
            success: false,
            message: `Cannot move ${command.direction} from position ${currentPos}`,
            data: { position: currentPos }
          }
        }
        break
        
      case 'get_current_state':
        response = {
          success: true,
          message: 'Current voice page state',
          data: voicePageState
        }
        break
        
      case 'reset_board':
        voicePageState = {
          position: 12,
          scenario: 'safe_midtable',
          highlightedPlayer: null,
          lastUpdate: Date.now()
        }
        
        response = {
          success: true,
          message: 'Board reset to default state',
          data: voicePageState
        }
        break
        
      case 'highlight_player':
        if (command.highlight_player) {
          voicePageState.highlightedPlayer = command.highlight_player
          voicePageState.lastUpdate = Date.now()
          
          // Also update NICO session if sessionId provided
          if (command.sessionId) {
            try {
              const nicoStorage = getNicoSessionStorage()
              await nicoStorage.highlightPlayer(command.sessionId, command.highlight_player)
              await nicoStorage.recordAction(command.sessionId, `highlight_player_${command.highlight_player}`)
            } catch (error) {
              console.error('Failed to update NICO session:', error)
            }
          }
          
          response = {
            success: true,
            message: `Highlighting player: ${command.highlight_player}`,
            data: voicePageState
          }
        } else {
          // Clear highlight if no player specified
          voicePageState.highlightedPlayer = null
          voicePageState.lastUpdate = Date.now()
          
          // Also clear from NICO session if sessionId provided
          if (command.sessionId) {
            try {
              const nicoStorage = getNicoSessionStorage()
              await nicoStorage.highlightPlayer(command.sessionId, null)
              await nicoStorage.recordAction(command.sessionId, 'clear_player_highlight')
            } catch (error) {
              console.error('Failed to update NICO session:', error)
            }
          }
          
          response = {
            success: true,
            message: 'Player highlight cleared',
            data: voicePageState
          }
        }
        break
        
      default:
        response = {
          success: false,
          message: `Unknown action: ${command.action}`,
          data: {}
        }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Voice control error:', error)
    return NextResponse.json({
      success: false,
      message: 'Voice control processing failed',
      data: {}
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return current state for polling
  return NextResponse.json({
    success: true,
    message: 'Current voice page state',
    data: voicePageState
  })
} 