export interface IntentResult {
  type: 'query' | 'command' | 'followup' | 'unknown'
  action?: string
  entities?: Record<string, any>
  confidence: number
  followupType?: 'yes' | 'no' | 'more_info' | 'different_scenario'
}

export class VoiceIntentClassifier {
  // Semantic position mappings - voice commands to specific positions
  private positionMappings = {
    // Championship/Top Positions
    1: [
      'champions', 'championship', 'top of the league', 'first place', 'number one', 'first'
    ],
    2: [
      'title race', 'automatic promotion', 'second place', 'runners up'
    ],
    6: [
      'promotion', 'playoffs', 'top six', 'playoff final', 'playoff qualification'
    ],
    
    // Mid-table
    12: [
      'mid-table', 'safe', 'comfortable', 'middle', 'mid table'
    ],
    
    // Relegation danger
    17: [
      'survival', 'just safe', 'above relegation'
    ],
    18: [
      'show the cliff', 'financial cliff', 'the drop', 'cliff edge', 'relegation boundary'
    ],
    22: [
      'relegation battle', 'bottom three', 'danger zone', 'fighting relegation'
    ],
    24: [
      'relegation', 'bottom', 'last place', 'relegated', 'bottom of the league'
    ]
  }

  private patterns = {
    // Financial queries
    financial: [
      /what.*(revenue|income|money|financial|profit)/i,
      /how much.*(make|earn|revenue)/i,
      /current.*(position|revenue|income)/i,
      /(show|tell).*financial/i
    ],
    
    // Position queries
    position: [
      /what.*(position|place|rank)/i,
      /where.*are.*we/i,
      /(current|our).*(position|place)/i,
      /league.*position/i
    ],
    
    // Movement commands
    movement: [
      /(move|go)\s*(up|higher)/i,
      /(move|go)\s*(down|lower)/i
    ],
    
    // Commands
    commands: [
      /(change|set|move).*position/i,
      /(switch|change).*scenario/i,
      /(show|display|go to)/i,
      /set.*position.*(\d+)/i
    ],
    
    // Follow-up responses
    followups: {
      yes: [/^(yes|yeah|yep|sure|ok|okay|please|go ahead)/i],
      no: [/^(no|nope|not|never)/i],
      more: [/^(more|tell.*more|explain|details|elaborate)/i],
      different: [/^(different|other|alternative|else)/i]
    }
  }

  classify(text: string, currentPosition: number = 12): IntentResult {
    const cleanText = text.trim().toLowerCase()
    
    // Check for follow-up responses first (they're usually short)
    if (cleanText.length < 20) {
      for (const [type, patterns] of Object.entries(this.patterns.followups)) {
        if (patterns.some(pattern => pattern.test(cleanText))) {
          return {
            type: 'followup',
            followupType: type as any,
            confidence: 0.9
          }
        }
      }
    }

    // Check for semantic position commands first (highest priority)
    const semanticPosition = this.findSemanticPosition(cleanText)
    if (semanticPosition !== null) {
      return {
        type: 'command',
        action: 'change_position',
        entities: {
          position: semanticPosition,
          semantic: true
        },
        confidence: 0.95
      }
    }

    // Check for movement commands
    const movementMatch = this.checkMovementCommands(cleanText, currentPosition)
    if (movementMatch !== null) {
      return {
        type: 'command',
        action: 'change_position',
        entities: {
          position: movementMatch,
          movement: true
        },
        confidence: 0.9
      }
    }

    // Check for numeric position commands
    if (this.patterns.commands.some(pattern => pattern.test(cleanText))) {
      const positionMatch = cleanText.match(/(?:position|to)\s*(\d+)/i)
      const scenarioMatch = cleanText.match(/(optimistic|pessimistic|best|worst|current)/i)
      
      return {
        type: 'command',
        action: positionMatch ? 'change_position' : scenarioMatch ? 'change_scenario' : 'navigate',
        entities: {
          position: positionMatch ? parseInt(positionMatch[1]) : null,
          scenario: scenarioMatch ? scenarioMatch[1] : null
        },
        confidence: 0.85
      }
    }

    // Check for financial queries
    if (this.patterns.financial.some(pattern => pattern.test(cleanText))) {
      return {
        type: 'query',
        action: 'financial_info',
        confidence: 0.8
      }
    }

    // Check for position queries  
    if (this.patterns.position.some(pattern => pattern.test(cleanText))) {
      return {
        type: 'query',
        action: 'position_info',
        confidence: 0.8
      }
    }

    // Default fallback
    return {
      type: 'unknown',
      confidence: 0.3
    }
  }

  // Find semantic position based on voice command
  private findSemanticPosition(text: string): number | null {
    for (const [position, keywords] of Object.entries(this.positionMappings)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return parseInt(position)
        }
      }
    }
    return null
  }

  // Handle movement commands (up/down by 5 positions)
  private checkMovementCommands(text: string, currentPosition: number): number | null {
    const upMatch = text.match(/(move|go)\s*(up|higher)/i)
    const downMatch = text.match(/(move|go)\s*(down|lower)/i)
    
    if (upMatch) {
      const newPosition = Math.max(1, currentPosition - 5) // Move up 5 positions (lower number)
      return newPosition
    }
    
    if (downMatch) {
      const newPosition = Math.min(24, currentPosition + 5) // Move down 5 positions (higher number)  
      return newPosition
    }
    
    return null
  }

  isFollowupExpected(lastResponse: string): boolean {
    return lastResponse.includes('would you like to explore') ||
           lastResponse.includes('shall I') ||
           lastResponse.includes('do you want') ||
           lastResponse.includes('would you prefer')
  }
} 