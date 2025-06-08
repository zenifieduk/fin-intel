export interface IntentResult {
  type: 'query' | 'command' | 'followup' | 'unknown'
  action?: string
  entities?: Record<string, any>
  confidence: number
  followupType?: 'yes' | 'no' | 'more_info' | 'different_scenario'
}

export class VoiceIntentClassifier {
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

  classify(text: string): IntentResult {
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

    // Check for commands
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

  isFollowupExpected(lastResponse: string): boolean {
    return lastResponse.includes('would you like to explore') ||
           lastResponse.includes('shall I') ||
           lastResponse.includes('do you want') ||
           lastResponse.includes('would you prefer')
  }
} 