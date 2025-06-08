// Intent Classification System for Aaran Voice Assistant
// Provides sophisticated understanding of user commands beyond pattern matching

export interface Intent {
  type: 'POSITION_CHANGE' | 'SCENARIO_CHANGE' | 'FINANCIAL_QUERY' | 'HELP_REQUEST' | 'GENERAL_CHAT' | 'UNKNOWN'
  confidence: number
  parameters: {
    position?: number
    scenario?: string
    metric?: string
    direction?: 'up' | 'down' | 'to'
    quantity?: number
    comparison?: boolean
  }
  originalText: string
  reasoning: string
}

export interface ClassificationContext {
  currentPosition: number
  currentScenario: string
  recentIntents: Intent[]
  conversationHistory: string[]
}

// Intent classification with semantic understanding
export class VoiceIntentClassifier {
  private positionKeywords = [
    'position', 'place', 'spot', 'rank', 'table', 'league', 'move', 'go', 'switch', 'change'
  ]
  
  private scenarioKeywords = [
    'scenario', 'case', 'optimistic', 'pessimistic', 'best', 'worst', 'current', 'baseline', 'projection'
  ]
  
  private financialKeywords = [
    'revenue', 'money', 'income', 'profit', 'cash', 'risk', 'score', 'ratio', 'wages', 'cost', 
    'million', 'pounds', 'sustainability', 'flow', 'analysis', 'what', 'how much', 'show me'
  ]
  
  private helpKeywords = [
    'help', 'how', 'what does', 'explain', 'tell me', 'guide', 'tutorial', 'show', 'demonstrate'
  ]

  private namedPositions = {
    // Championship/Top Positions
    'champions': 1,
    'championship': 1,
    'top of the league': 1,
    'first place': 1,
    'number one': 1,
    'first': 1,
    'top': 1,
    'winner': 1,
    
    // Title race / Automatic promotion
    'title race': 2,
    'automatic promotion': 2,
    'second place': 2,
    'runners up': 2,
    'promotion': 2,
    
    // Playoffs
    'playoffs': 6,
    'playoff': 6,
    'top six': 6,
    'playoff final': 6,
    'playoff qualification': 6,
    
    // Mid-table
    'mid-table': 12,
    'mid table': 12,
    'midtable': 12,
    'safe': 12,
    'comfortable': 12,
    'middle': 12,
    
    // Survival
    'survival': 17,
    'just safe': 17,
    'above relegation': 17,
    
    // The Cliff (relegation boundary)
    'show the cliff': 18,
    'financial cliff': 18,
    'the drop': 18,
    'cliff edge': 18,
    'relegation boundary': 18,
    'the cliff': 18,
    'cliff': 18,
    
    // Relegation battle
    'relegation battle': 22,
    'bottom three': 22,
    'danger zone': 22,
    'fighting relegation': 22,
    'relegation zone': 22,
    
    // Bottom/Relegated
    'relegation': 24,
    'bottom': 24,
    'last place': 24,
    'relegated': 24,
    'bottom of the league': 24,
    'last': 24
  }

  private scenarios = {
    'optimistic': 'optimistic',
    'best case': 'optimistic',
    'best': 'optimistic',
    'promotion case': 'optimistic',
    'pessimistic': 'pessimistic',
    'worst case': 'pessimistic',
    'worst': 'pessimistic',
    'relegation case': 'pessimistic',
    'current': 'current',
    'baseline': 'current',
    'realistic': 'current'
  }

  classifyIntent(transcript: string, context: ClassificationContext): Intent {
    const normalizedText = transcript.toLowerCase().trim()
    
    // Start with unknown intent - used as fallback if no candidates match
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _intent: Intent = {
      type: 'UNKNOWN',
      confidence: 0,
      parameters: {},
      originalText: transcript,
      reasoning: 'No clear intent detected'
    }

    // Classify by analyzing keywords and patterns
    const candidates = [
      this.classifyPositionChange(normalizedText, context),
      this.classifyScenarioChange(normalizedText, context),
      this.classifyFinancialQuery(normalizedText, context),
      this.classifyHelpRequest(normalizedText, context),
      this.classifyGeneralChat(normalizedText, context)
    ]

    // Return the highest confidence classification
    const bestMatch = candidates.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )

    // Apply context-based confidence adjustments
    return this.adjustConfidenceWithContext(bestMatch, context)
  }

  private classifyPositionChange(text: string, context: ClassificationContext): Intent {
    let confidence = 0
    let position: number | undefined
    let direction: 'up' | 'down' | 'to' | undefined
    let reasoning = ''

    // Check for explicit position numbers
    const positionMatch = text.match(/(?:position|place|spot|rank)\s*(\d+)/i) || 
                         text.match(/(\d+)(?:st|nd|rd|th)?(?:\s+(?:position|place|spot))?/i)
    
    if (positionMatch) {
      position = parseInt(positionMatch[1])
      if (position >= 1 && position <= 24) {
        confidence = 0.95
        reasoning = `Explicit position number ${position} detected`
      }
    }

    // Check for named positions
    for (const [name, pos] of Object.entries(this.namedPositions)) {
      if (text.includes(name)) {
        position = pos
        confidence = Math.max(confidence, 0.85)
        reasoning = `Named position "${name}" mapped to position ${pos}`
        break
      }
    }

    // Check for movement commands with position calculation
    const moveUpMatch = text.match(/(move|go)\s*(up|higher)/i)
    const moveDownMatch = text.match(/(move|go)\s*(down|lower)/i)
    
    if (moveUpMatch) {
      direction = 'up'
      position = Math.max(1, context.currentPosition - 5) // Move up 5 positions
      confidence = Math.max(confidence, 0.9)
      reasoning += `. Movement command (up 5 positions) detected: ${context.currentPosition} → ${position}`
    } else if (moveDownMatch) {
      direction = 'down'
      position = Math.min(24, context.currentPosition + 5) // Move down 5 positions
      confidence = Math.max(confidence, 0.9)
      reasoning += `. Movement command (down 5 positions) detected: ${context.currentPosition} → ${position}`
    }
    
    // Check for general directional movement
    else if (text.includes('up') || text.includes('higher') || text.includes('improve')) {
      direction = 'up'
      confidence = Math.max(confidence, 0.6)
      reasoning += '. Directional movement (up) detected'
    } else if (text.includes('down') || text.includes('lower') || text.includes('drop') || text.includes('fall')) {
      direction = 'down'
      confidence = Math.max(confidence, 0.6)
      reasoning += '. Directional movement (down) detected'
    }

    // Check for position-related keywords
    const positionKeywordCount = this.positionKeywords.filter(keyword => 
      text.includes(keyword)
    ).length

    if (positionKeywordCount > 0) {
      confidence = Math.max(confidence, 0.3 + (positionKeywordCount * 0.15))
      reasoning += `. Position keywords detected: ${positionKeywordCount}`
    }

    return {
      type: 'POSITION_CHANGE',
      confidence,
      parameters: { position, direction },
      originalText: text,
      reasoning: reasoning || 'Position change indicators detected'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private classifyScenarioChange(text: string, _context: ClassificationContext): Intent {
    let confidence = 0
    let scenario: string | undefined
    let reasoning = ''

    // Check for explicit scenario names
    for (const [phrase, scenarioName] of Object.entries(this.scenarios)) {
      if (text.includes(phrase)) {
        scenario = scenarioName
        confidence = 0.9
        reasoning = `Scenario "${phrase}" mapped to ${scenarioName}`
        break
      }
    }

    // Check for scenario-related keywords
    const scenarioKeywordCount = this.scenarioKeywords.filter(keyword => 
      text.includes(keyword)
    ).length

    if (scenarioKeywordCount > 0) {
      confidence = Math.max(confidence, 0.4 + (scenarioKeywordCount * 0.2))
      reasoning += `. Scenario keywords detected: ${scenarioKeywordCount}`
    }

    return {
      type: 'SCENARIO_CHANGE',
      confidence,
      parameters: { scenario },
      originalText: text,
      reasoning: reasoning || 'Scenario change indicators detected'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private classifyFinancialQuery(text: string, _context: ClassificationContext): Intent {
    let confidence = 0
    let metric: string | undefined
    let comparison = false
    let reasoning = ''

    // Check for specific financial metrics
    const metricPatterns = [
      { pattern: /revenue|income/, metric: 'revenue' },
      { pattern: /risk|score/, metric: 'risk' },
      { pattern: /cash|flow/, metric: 'cashflow' },
      { pattern: /wage|salary/, metric: 'wages' },
      { pattern: /ratio/, metric: 'ratio' },
      { pattern: /sustainability/, metric: 'sustainability' }
    ]

    for (const { pattern, metric: metricName } of metricPatterns) {
      if (pattern.test(text)) {
        metric = metricName
        confidence = Math.max(confidence, 0.8)
        reasoning = `Financial metric "${metricName}" detected`
        break
      }
    }

    // Check for question patterns
    const questionPatterns = [
      /what.*(?:revenue|risk|cash|money)/,
      /how much.*(?:money|revenue|cash)/,
      /show me.*(?:data|numbers|financial)/,
      /tell me.*(?:about|financial)/
    ]

    for (const pattern of questionPatterns) {
      if (pattern.test(text)) {
        confidence = Math.max(confidence, 0.75)
        reasoning += '. Question pattern detected'
        break
      }
    }

    // Check for comparison words
    if (text.includes('compare') || text.includes('versus') || text.includes('difference')) {
      comparison = true
      confidence = Math.max(confidence, 0.7)
      reasoning += '. Comparison request detected'
    }

    // Check for financial keywords
    const financialKeywordCount = this.financialKeywords.filter(keyword => 
      text.includes(keyword)
    ).length

    if (financialKeywordCount > 0) {
      confidence = Math.max(confidence, 0.3 + (financialKeywordCount * 0.1))
      reasoning += `. Financial keywords detected: ${financialKeywordCount}`
    }

    return {
      type: 'FINANCIAL_QUERY',
      confidence,
      parameters: { metric, comparison },
      originalText: text,
      reasoning: reasoning || 'Financial query indicators detected'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private classifyHelpRequest(text: string, _context: ClassificationContext): Intent {
    let confidence = 0
    let reasoning = ''

    // Check for explicit help requests
    const helpPatterns = [
      /help/i,
      /how do i/i,
      /what does.*do/i,
      /explain/i,
      /guide/i,
      /tutorial/i,
      /show me how/i
    ]

    for (const pattern of helpPatterns) {
      if (pattern.test(text)) {
        confidence = Math.max(confidence, 0.85)
        reasoning = 'Direct help request pattern detected'
        break
      }
    }

    // Check for help-related keywords
    const helpKeywordCount = this.helpKeywords.filter(keyword => 
      text.includes(keyword)
    ).length

    if (helpKeywordCount > 0) {
      confidence = Math.max(confidence, 0.4 + (helpKeywordCount * 0.15))
      reasoning += `. Help keywords detected: ${helpKeywordCount}`
    }

    return {
      type: 'HELP_REQUEST',
      confidence,
      parameters: {},
      originalText: text,
      reasoning: reasoning || 'Help request indicators detected'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private classifyGeneralChat(text: string, _context: ClassificationContext): Intent {
    let confidence = 0
    let reasoning = ''

    // Check for conversational patterns
    const chatPatterns = [
      /hello|hi|hey/i,
      /thank you|thanks/i,
      /goodbye|bye/i,
      /how are you/i,
      /good job|well done|great/i
    ]

    for (const pattern of chatPatterns) {
      if (pattern.test(text)) {
        confidence = 0.8
        reasoning = 'Conversational pattern detected'
        break
      }
    }

    // If no other intents have high confidence, this might be general chat
    if (confidence === 0 && text.length > 3 && text.length < 30) {
      confidence = 0.3
      reasoning = 'Possibly general conversation based on length and structure'
    }

    return {
      type: 'GENERAL_CHAT',
      confidence,
      parameters: {},
      originalText: text,
      reasoning: reasoning || 'General chat indicators detected'
    }
  }

  private adjustConfidenceWithContext(intent: Intent, context: ClassificationContext): Intent {
    // Boost confidence if similar intent was used recently
    const recentSimilarIntents = context.recentIntents.filter(
      recent => recent.type === intent.type
    ).length

    if (recentSimilarIntents > 0) {
      intent.confidence = Math.min(1.0, intent.confidence + (recentSimilarIntents * 0.05))
      intent.reasoning += `. Context boost: ${recentSimilarIntents} recent similar intents`
    }

    // Reduce confidence for very short or very long inputs
    if (intent.originalText.length < 3) {
      intent.confidence *= 0.5
      intent.reasoning += '. Penalty: very short input'
    } else if (intent.originalText.length > 100) {
      intent.confidence *= 0.7
      intent.reasoning += '. Penalty: very long input'
    }

    return intent
  }

  // Utility method to get readable intent description
  getIntentDescription(intent: Intent): string {
    switch (intent.type) {
      case 'POSITION_CHANGE':
        return `Position change${intent.parameters.position ? ` to ${intent.parameters.position}` : ''}${intent.parameters.direction ? ` (${intent.parameters.direction})` : ''}`
      case 'SCENARIO_CHANGE':
        return `Scenario change${intent.parameters.scenario ? ` to ${intent.parameters.scenario}` : ''}`
      case 'FINANCIAL_QUERY':
        return `Financial query${intent.parameters.metric ? ` about ${intent.parameters.metric}` : ''}${intent.parameters.comparison ? ' (comparison)' : ''}`
      case 'HELP_REQUEST':
        return 'Help request'
      case 'GENERAL_CHAT':
        return 'General conversation'
      default:
        return 'Unknown intent'
    }
  }
}

// Export default classifier instance
export const defaultIntentClassifier = new VoiceIntentClassifier() 