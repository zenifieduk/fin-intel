// Aaran Agent - Intelligent Voice Assistant for FRF7 Financial Dashboard
// Extends the existing voice command system with context awareness and intelligence

import { defaultIntentClassifier, type Intent, type ClassificationContext } from './voice-intents';
import { defaultKnowledgeRetrieval } from './knowledge-retrieval';
import { defaultResponseGenerator, type ResponseContext, type ResponseStyle } from './response-generation';
import { DashboardController, DashboardAction, ActionResult } from './dashboard-controller';
import { ConversationMemory, getDefaultConversationMemory } from './conversation-memory';
import { EnhancedConversationMemory } from './conversation-memory-enhanced';
import { UserProfileManager, ProfileUtils } from './user-profile';

export interface ConversationContext {
  currentFocus: 'position_analysis' | 'scenario_planning' | 'financial_query' | 'help_request' | 'general_chat'
  dashboardState: {
    selectedPosition: number
    scenario: string
    lastRevenue: number
    lastRiskScore: number
  }
  conversationHistory: string[]
  userIntent: Intent | null
  lastAction: string
  timestamp: Date
}

// Intent interface now imported from voice-intents.ts

export interface FinancialData {
  totalRevenue: number
  monthlyCashFlow: number
  wageRatio: number
  riskScore: number
  positionRisk: string
  sustainabilityDays: number
}

// Agent state management - extends the pattern from chat/route.ts
const agentSessions = new Map<string, ConversationContext>()

export class AaranAgent {
  private sessionId: string
  private context: ConversationContext
  private dashboardController: DashboardController
  private conversationMemory: ConversationMemory
  private enhancedMemory: EnhancedConversationMemory | null
  private profileManager: UserProfileManager

  constructor(sessionId: string = 'default-session') {
    this.sessionId = sessionId
    this.context = this.getOrCreateContext()
    this.dashboardController = new DashboardController()
    
    // Use standard memory system as fallback
    this.conversationMemory = getDefaultConversationMemory()
    
    // Enhanced memory is handled server-side only to avoid environment variable issues
    this.enhancedMemory = null
    
    // Initialize profile manager with user's profile
    this.profileManager = new UserProfileManager(
      ProfileUtils.createDefaultProfile(sessionId)
    )
  }

  private getOrCreateContext(): ConversationContext {
    const existingContext = agentSessions.get(this.sessionId)
    
    if (existingContext) {
      return existingContext
    }

    // Create new context
    const newContext: ConversationContext = {
      currentFocus: 'position_analysis',
      dashboardState: {
        selectedPosition: 12,
        scenario: 'current',
        lastRevenue: 0,
        lastRiskScore: 0
      },
      conversationHistory: [],
      userIntent: null,
      lastAction: '',
      timestamp: new Date()
    }

    agentSessions.set(this.sessionId, newContext)
    return newContext
  }

  // Main processing method with intelligent intent classification
  async processVoiceCommand(
    transcript: string, 
    currentDashboardState: { selectedPosition: number; scenario: string },
    financialData?: FinancialData
  ): Promise<{
    response: string
    newPosition?: number
    newScenario?: string
    shouldSpeak: boolean
    context: ConversationContext
    intent: Intent
    actionResult?: ActionResult
  }> {
    console.log(`🧠 Aaran processing: "${transcript}"`)
    
    // Update context with current dashboard state
    this.updateContext(transcript, currentDashboardState, financialData)
    
    // ENHANCED: Get conversation context from memory system and map to intents
    const recentContext = this.conversationMemory.getRecentContext(3)
    
    // Use intelligent intent classification system with memory context
    const classificationContext: ClassificationContext = {
      currentPosition: currentDashboardState.selectedPosition,
      currentScenario: currentDashboardState.scenario,
      recentIntents: [], // Keep simplified for now, enhance later
      conversationHistory: [...this.context.conversationHistory, ...recentContext]
    }
    
    const intent = defaultIntentClassifier.classifyIntent(transcript, classificationContext)
    this.context.userIntent = intent
    
    console.log(`🎯 Intent classified:`, {
      type: intent.type,
      confidence: intent.confidence.toFixed(2),
      reasoning: intent.reasoning
    })
    
    // Enhanced: Check if this is a follow-up response to a question
    console.log(`🔍 Checking for follow-up: lastAction="${this.context.lastAction}", transcript="${transcript}"`);
    
    if (this.context.lastAction === 'followup_expected') {
      console.log(`✅ Follow-up detected! Processing: "${transcript}"`);
      
      const followupResult = this.handleFollowupResponse(transcript, intent, financialData);
      if (followupResult) {
        console.log(`🎯 Follow-up processed successfully: "${followupResult.response}"`);
        // Update conversation history
        this.context.conversationHistory.push(transcript.toLowerCase());
        this.context.lastAction = 'followup_processed';
        agentSessions.set(this.sessionId, this.context);
        
        return {
          response: followupResult.response,
          newPosition: followupResult.newPosition,
          newScenario: followupResult.newScenario,
          shouldSpeak: true,
          context: this.context,
          intent: intent,
          actionResult: followupResult.actionResult
        };
      } else {
        console.log(`❌ Follow-up not recognized, falling back to normal processing`);
      }
    } else {
      console.log(`⏭️ Not a follow-up (lastAction: "${this.context.lastAction}")`);
    }

    // Process command based on classified intent
    const result = await this.processIntentBasedCommand(intent, financialData)
    
    // ENHANCED: Make responses more conversational with dashboard context
    const conversationalResponse = this.enhanceResponseWithContext(result.response, {
      currentPosition: currentDashboardState.selectedPosition,
      newPosition: result.newPosition,
      scenario: currentDashboardState.scenario,
      newScenario: result.newScenario,
      financialData: financialData,
      intent: intent.type,
      conversationHistory: this.context.conversationHistory
    })

    // Update conversation history (keep last 10 interactions)
    this.context.conversationHistory.push(transcript.toLowerCase())
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-10)
    }
    
    // Save updated context
    agentSessions.set(this.sessionId, this.context)
    
    console.log(`🔄 Context state: lastAction="${this.context.lastAction}", expects followup: ${this.context.lastAction === 'followup_expected'}`)
    
    // ENHANCED: Personalize response using conversation memory and enhanced semantic search
    const personalizedResponse = this.conversationMemory.personalizeResponse(conversationalResponse, {
      intent: intent.type,
      financialData: financialData,
      position: result.newPosition || currentDashboardState.selectedPosition,
      scenario: result.newScenario || currentDashboardState.scenario
    })

    // Enhanced memory handled server-side via API endpoints

    // ENHANCED: Learn from this interaction
    this.conversationMemory.learnFromInteraction({
      userInput: transcript,
      intent: intent.type,
      aaranResponse: personalizedResponse,
      actionTaken: result.actionResult?.success ? 'dashboard_action' : undefined,
      financialData: financialData
    })

    // Enhanced memory storage handled server-side via API endpoints

    console.log(`🎯 Aaran response: "${personalizedResponse}"`)
    console.log(`📊 Context updated:`, {
      focus: this.context.currentFocus,
      historyLength: this.context.conversationHistory.length,
      dashboardState: this.context.dashboardState,
      intentDescription: defaultIntentClassifier.getIntentDescription(intent),
      memoryEnhanced: true
    })
    
    return {
      ...result,
      response: personalizedResponse, // Use enhanced response
      context: this.context,
      intent
    }
  }

  private updateContext(
    transcript: string, 
    dashboardState: { selectedPosition: number; scenario: string },
    financialData?: FinancialData
  ): void {
    // Update dashboard state
    this.context.dashboardState = {
      selectedPosition: dashboardState.selectedPosition,
      scenario: dashboardState.scenario,
      lastRevenue: financialData?.totalRevenue || this.context.dashboardState.lastRevenue,
      lastRiskScore: financialData?.riskScore || this.context.dashboardState.lastRiskScore
    }

    this.context.timestamp = new Date()
  }

  // Intent-based command processing with intelligent classification
  private async processIntentBasedCommand(intent: Intent, financialData?: FinancialData): Promise<{
    response: string
    newPosition?: number
    newScenario?: string
    shouldSpeak: boolean
    actionResult?: ActionResult
  }> {
    let response = "I didn't understand that command"
    let newPosition: number | undefined
    let newScenario: string | undefined
    let shouldSpeak = true
    let actionResult: ActionResult | undefined

    // Handle low confidence intents
    if (intent.confidence < 0.3) {
      response = "I'm not sure what you meant. Try saying something like 'position 5' or 'best case scenario'"
      this.context.lastAction = 'low_confidence_response'
      return { response, shouldSpeak }
    }

    // Process based on intent type and extracted parameters
    switch (intent.type) {
      case 'POSITION_CHANGE':
        if (intent.parameters.position !== undefined) {
          newPosition = Math.min(24, Math.max(1, intent.parameters.position))
          response = await this.generateSemanticPositionResponse(intent, financialData, newPosition)
          this.context.lastAction = `position_change_to_${newPosition}`
        } else if (intent.parameters.direction) {
          const currentPos = this.context.dashboardState.selectedPosition
          if (intent.parameters.direction === 'up' && currentPos > 1) {
            newPosition = currentPos - 1
            response = await this.generateContextualResponse(intent, financialData, newPosition)
          } else if (intent.parameters.direction === 'down' && currentPos < 24) {
            newPosition = currentPos + 1
            response = await this.generateContextualResponse(intent, financialData, newPosition)
          } else {
            response = `Already at ${intent.parameters.direction === 'up' ? 'the top' : 'the bottom'} position`
            shouldSpeak = true
          }
          this.context.lastAction = `position_move_${intent.parameters.direction}`
        } else {
          response = "Which position would you like to move to? Try 'champions', 'playoffs', 'relegation battle', or 'show the cliff'."
          this.context.lastAction = 'position_clarification_needed'
        }
        break

      case 'SCENARIO_CHANGE':
        if (intent.parameters.scenario) {
          newScenario = intent.parameters.scenario
          response = await this.generateContextualResponse(intent, financialData)
          this.context.lastAction = `scenario_change_to_${intent.parameters.scenario}`
        } else {
          response = "Which scenario? Say 'best case', 'worst case', or 'current'"
          this.context.lastAction = 'scenario_clarification_needed'
        }
        break

      case 'FINANCIAL_QUERY':
        response = await this.generateIntelligentFinancialResponse(intent, financialData)
        this.context.lastAction = `financial_query_${intent.parameters.metric || 'knowledge_based'}`
        break

      case 'HELP_REQUEST':
        response = "I can help you navigate the financial dashboard. Try saying 'position 6' to change league position, 'best case scenario' to change projections, or ask 'what's the revenue?' for financial data."
        this.context.lastAction = 'help_provided'
        break

      case 'GENERAL_CHAT':
        response = this.generateChatResponse(intent.originalText)
        this.context.lastAction = 'general_chat'
        break

      default:
        response = "I understand you want to interact with the dashboard, but I'm not sure exactly what to do. Try being more specific."
        this.context.lastAction = 'unknown_intent'
    }

    // Update context focus based on intent
    this.updateContextFocus(intent.type)

    // Check for advanced commands first
    const advancedCommandResult = await this.processAdvancedCommand(intent, financialData)
    if (advancedCommandResult) {
      return advancedCommandResult
    }

    return {
      response,
      newPosition: newPosition !== this.context.dashboardState.selectedPosition ? newPosition : undefined,
      newScenario: newScenario !== this.context.dashboardState.scenario ? newScenario : undefined,
      shouldSpeak,
      actionResult
    }
  }

  private generateFinancialResponse(metric: string, financialData?: FinancialData): string {
    const position = this.context.dashboardState.selectedPosition
    const revenue = this.context.dashboardState.lastRevenue
    const risk = this.context.dashboardState.lastRiskScore

    switch (metric) {
      case 'revenue':
        return `At position ${position}, the club generates ${(revenue / 1000000).toFixed(1)} million pounds annually`
      case 'risk':
        return `Current risk score is ${Math.round(risk || 50)} out of 100`
      case 'cashflow':
        if (financialData?.monthlyCashFlow) {
          const monthly = financialData.monthlyCashFlow / 1000000
          return `Monthly cash flow is ${monthly > 0 ? 'positive' : 'negative'} ${Math.abs(monthly).toFixed(1)} million pounds`
        }
        return "Cash flow data is being calculated"
      case 'wages':
        if (financialData?.wageRatio) {
          return `Wage ratio is ${Math.round(financialData.wageRatio)}% of revenue`
        }
        return "Wage ratio data is being calculated"
      case 'sustainability':
        if (financialData?.sustainabilityDays) {
          return `Club can sustain current operations for ${Math.round(financialData.sustainabilityDays)} days`
        }
        return "Sustainability analysis is being calculated"
      default:
        return `Financial metric "${metric}" is being analyzed for position ${position}`
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateGeneralFinancialResponse(_financialData?: FinancialData): string {
    const position = this.context.dashboardState.selectedPosition
    const revenue = (this.context.dashboardState.lastRevenue / 1000000).toFixed(1)
    const risk = Math.round(this.context.dashboardState.lastRiskScore || 50)
    
    return `At position ${position}: Revenue is ${revenue} million pounds, risk score is ${risk}. What specific financial data would you like to know more about?`
  }

  // Generate intelligent response using knowledge retrieval and context-aware generation
  private async generateIntelligentFinancialResponse(intent: Intent, financialData?: FinancialData): Promise<string> {
    try {
      // For general queries, try knowledge retrieval first
      const knowledgeResponse = await defaultKnowledgeRetrieval.findRelevantKnowledge(
        intent.originalText,
        this.context,
        financialData
      )

      // If we have good knowledge results, use context-aware response generation
      if (knowledgeResponse.confidence > 0.5) {
        console.log(`📚 Knowledge retrieval successful: ${knowledgeResponse.confidence.toFixed(2)} confidence`)
        
        // Create context for response generation
        const responseContext: ResponseContext = {
          intent: intent,
          knowledgeResults: knowledgeResponse.sources,
          dashboardData: financialData || this.getDefaultFinancialData(),
          conversationHistory: this.context.conversationHistory,
          userPreferences: 'conversational' as ResponseStyle,
          currentPosition: this.context.dashboardState.selectedPosition,
          scenario: this.context.dashboardState.scenario
        }

        // Generate contextual response
        const generatedResponse = defaultResponseGenerator.generateResponse(responseContext)
        
        console.log(`🎭 Context-aware response generated with ${generatedResponse.confidence.toFixed(2)} confidence`)
        console.log(`💡 Follow-ups available: ${generatedResponse.followUpQuestions.length}`)
        console.log(`📊 Data points: ${generatedResponse.dataPoints.join(', ')}`)
        
        return generatedResponse.text
      } else {
        console.log(`📚 Knowledge retrieval low confidence, using contextual fallback`)
        
        // Even for low knowledge confidence, use context-aware generation
        const responseContext: ResponseContext = {
          intent: intent,
          knowledgeResults: [],
          dashboardData: financialData || this.getDefaultFinancialData(),
          conversationHistory: this.context.conversationHistory,
          userPreferences: 'conversational' as ResponseStyle,
          currentPosition: this.context.dashboardState.selectedPosition,
          scenario: this.context.dashboardState.scenario
        }

        const generatedResponse = defaultResponseGenerator.generateResponse(responseContext)
        return generatedResponse.text
      }
    } catch (error) {
      console.error('Intelligent response generation error:', error)
      return this.generateGeneralFinancialResponse(financialData)
    }
  }

  // Get default financial data when none provided
  private getDefaultFinancialData(): FinancialData {
    return {
      totalRevenue: this.context.dashboardState.lastRevenue || 22000000,
      monthlyCashFlow: 200000,
      wageRatio: 75,
      riskScore: this.context.dashboardState.lastRiskScore || 50,
      positionRisk: 'Medium',
      sustainabilityDays: 180
    }
  }

  // Generate contextual response for any intent type
  private async generateContextualResponse(intent: Intent, financialData?: FinancialData, targetPosition?: number): Promise<string> {
    try {
      // Create context for response generation
      const responseContext: ResponseContext = {
        intent: intent,
        knowledgeResults: [],
        dashboardData: financialData || this.getDefaultFinancialData(),
        conversationHistory: this.context.conversationHistory,
        userPreferences: 'conversational' as ResponseStyle,
        currentPosition: targetPosition || this.context.dashboardState.selectedPosition,
        scenario: this.context.dashboardState.scenario
      }

      // Generate contextual response
      const generatedResponse = defaultResponseGenerator.generateResponse(responseContext)
      
      console.log(`🎭 Contextual response generated for ${intent.type}: ${generatedResponse.confidence.toFixed(2)} confidence`)
      
      return generatedResponse.text
    } catch (error) {
      console.error('Contextual response generation error:', error)
      // Fallback to basic response
      return `Processing ${intent.type.toLowerCase().replace('_', ' ')} request`
    }
  }

  // Generate semantic response for position changes with contextual understanding
  private async generateSemanticPositionResponse(intent: Intent, financialData?: FinancialData, targetPosition?: number): Promise<string> {
    const position = targetPosition || this.context.dashboardState.selectedPosition
    const currentPosition = this.context.dashboardState.selectedPosition
    
    // Get semantic context for the position
    const positionContext = this.getPositionContext(position)
    const financialContext = this.getFinancialContext(position, financialData)
    
    // Detect if this was a semantic command
    const semanticTrigger = this.detectSemanticTrigger(intent.originalText.toLowerCase())
    
    let response = ''
    
    if (semanticTrigger) {
      // Use semantic trigger in response for better understanding
      response = `Moving to ${semanticTrigger} - that's ${positionContext.description}. `
    } else {
      response = `Moving to position ${position} - ${positionContext.description}. `
    }
    
    // Add financial impact
    response += financialContext.impact
    
    // Add follow-up suggestion based on position category
    response += ` ${positionContext.followUp}`
    
    console.log(`🎯 Semantic position response generated: ${currentPosition} → ${position} (${semanticTrigger || 'numeric'})`)
    
    return response
  }

  // Get contextual information about a position
  private getPositionContext(position: number): { description: string; followUp: string } {
    if (position === 1) {
      return {
        description: "the top of the league! Champions territory with maximum revenue and prestige",
        followUp: "Want to see how title-winning finances look in different scenarios?"
      }
    } else if (position === 2) {
      return {
        description: "title race position! Automatic promotion with massive commercial benefits",
        followUp: "Shall I show you the playoff pressure by comparing to 6th place?"
      }
    } else if (position === 6) {
      return {
        description: "playoff qualification! The crucial cut-off for promotion opportunities",
        followUp: "Want to see the financial cliff by dropping to mid-table?"
      }
    } else if (position === 12) {
      return {
        description: "safe mid-table territory with steady, predictable finances",
        followUp: "Would you like to explore what relegation battle looks like?"
      }
    } else if (position === 17) {
      return {
        description: "survival mode - just above the relegation battle with increasing pressure",
        followUp: "Want to see the cliff edge by dropping one more position?"
      }
    } else if (position === 18) {
      return {
        description: "the financial cliff! This is where relegation panic begins and revenues plummet",
        followUp: "Shall I show you the full relegation battle at 22nd?"
      }
    } else if (position === 22) {
      return {
        description: "relegation battle! Bottom three territory with severe financial consequences",
        followUp: "Want to see rock bottom at last place?"
      }
    } else if (position === 24) {
      return {
        description: "bottom of the league - relegated with devastating financial impact",
        followUp: "Shall I show you the recovery path back to safety?"
      }
    } else if (position <= 6) {
      return {
        description: `position ${position} - in the promotion race with enhanced commercial appeal`,
        followUp: "Want to explore different promotion scenarios?"
      }
    } else if (position >= 18) {
      return {
        description: `position ${position} - in the relegation zone with reduced revenue and high risk`,
        followUp: "Shall I show you the escape routes to safety?"
      }
    } else {
      return {
        description: `position ${position} - mid-table with moderate financial stability`,
        followUp: "Want to see the contrast with promotion or relegation positions?"
      }
    }
  }

  // Get financial context for position
  private getFinancialContext(position: number, financialData?: FinancialData): { impact: string } {
    const revenue = financialData?.totalRevenue || this.context.dashboardState.lastRevenue || 30000000
    const riskScore = financialData?.riskScore || this.context.dashboardState.lastRiskScore || 50
    
    if (position <= 2) {
      return {
        impact: `Revenue spikes to £${(revenue / 1000000).toFixed(1)}M with championship bonuses and maximum commercial appeal.`
      }
    } else if (position <= 6) {
      return {
        impact: `Strong revenue of £${(revenue / 1000000).toFixed(1)}M with playoff bonuses and increased sponsorship value.`
      }
    } else if (position <= 17) {
      return {
        impact: `Steady revenue of £${(revenue / 1000000).toFixed(1)}M with risk score ${Math.round(riskScore)}/100.`
      }
    } else {
      return {
        impact: `Revenue drops to £${(revenue / 1000000).toFixed(1)}M with high risk score of ${Math.round(riskScore)}/100 due to relegation threat.`
      }
    }
  }

  // Detect what semantic trigger was used
  private detectSemanticTrigger(text: string): string | null {
    const triggers = {
      'champions': 'champions',
      'championship': 'championship',
      'title race': 'title race',
      'playoffs': 'playoffs', 
      'playoff': 'playoffs',
      'promotion': 'promotion',
      'mid-table': 'mid-table',
      'safe': 'safe position',
      'survival': 'survival position',
      'cliff': 'the financial cliff',
      'financial cliff': 'the financial cliff',
      'show the cliff': 'the cliff',
      'relegation battle': 'relegation battle',
      'bottom three': 'bottom three',
      'danger zone': 'danger zone',
      'relegation': 'relegation',
      'bottom': 'bottom position'
    }
    
    for (const [trigger, description] of Object.entries(triggers)) {
      if (text.includes(trigger)) {
        return description
      }
    }
    
    // Check for movement commands
    if (text.includes('move up') || text.includes('go up')) {
      return 'moving up the table'
    }
    if (text.includes('move down') || text.includes('go down')) {
      return 'moving down the table'
    }
    
    return null
  }

  private generateChatResponse(text: string): string {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return "Hello! I'm Aaran, your voice assistant for the financial dashboard. How can I help you today?"
    } else if (lowerText.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about the club's financial position?"
    } else if (lowerText.includes('good') || lowerText.includes('great')) {
      return "I'm glad you're finding the dashboard useful! Feel free to ask me about any financial metrics or change positions."
    } else {
      return "I'm here to help with the financial dashboard. Try asking about positions, scenarios, or financial data."
    }
  }

  private updateContextFocus(intentType: Intent['type']): void {
    switch (intentType) {
      case 'POSITION_CHANGE':
        this.context.currentFocus = 'position_analysis'
        break
      case 'SCENARIO_CHANGE':
        this.context.currentFocus = 'scenario_planning'
        break
      case 'FINANCIAL_QUERY':
        this.context.currentFocus = 'financial_query'
        break
      case 'HELP_REQUEST':
        this.context.currentFocus = 'help_request'
        break
      default:
        this.context.currentFocus = 'general_chat'
    }
  }

  // Utility methods for context access
  getContext(): ConversationContext {
    return this.context
  }

  getDashboardState() {
    return this.context.dashboardState
  }

  getConversationHistory(): string[] {
    return this.context.conversationHistory
  }

  getCurrentFocus(): string {
    return this.context.currentFocus
  }

  // Clear context (useful for testing or reset)
  clearContext(): void {
    agentSessions.delete(this.sessionId)
    this.context = this.getOrCreateContext()
  }

  // ENHANCED: Memory and personalization methods
  getUserPreferences() {
    return this.conversationMemory.getUserPreferences()
  }

  updateUserPreferences(updates: Record<string, unknown>) {
    this.conversationMemory.updateUserPreferences(updates)
  }

  getConversationSummary() {
    return this.conversationMemory.getConversationSummary()
  }

  enableContinuousConversation(enable: boolean = true) {
    this.conversationMemory.updateUserPreferences({
      conversationFlow: enable ? 'continuous' : 'single_command'
    })
  }

  setFinancialFocus(focus: 'revenue' | 'risk' | 'sustainability' | 'balanced') {
    this.conversationMemory.updateUserPreferences({
      financialFocus: focus
    })
  }

  setResponseStyle(style: 'brief' | 'detailed' | 'explanatory') {
    this.conversationMemory.updateUserPreferences({
      responseStyle: style
    })
  }

  // Initialize dashboard controller with UI callbacks
  initializeDashboard(callbacks: {
    onPositionChange: (position: number) => void;
    onScenarioChange: (scenario: string) => void;
  }): void {
    this.dashboardController.initialize(callbacks);
  }

  // Process advanced commands that require dashboard controller
  private async processAdvancedCommand(
    intent: Intent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    financialData?: FinancialData
  ): Promise<any> {
    const lowerTranscript = intent.originalText.toLowerCase();

    // Bulk comparison commands
    if (lowerTranscript.includes('compare') && (lowerTranscript.includes('positions') || lowerTranscript.includes('multiple'))) {
              return await this.handleBulkComparison(intent);
    }

    // Export commands
    if (lowerTranscript.includes('export') || lowerTranscript.includes('download')) {
              return await this.handleExportCommand(intent);
    }

    // Undo/rollback commands
    if (lowerTranscript.includes('undo') || lowerTranscript.includes('go back') || lowerTranscript.includes('rollback')) {
              return await this.handleUndoCommand(intent);
    }

    // Reset commands
    if (lowerTranscript.includes('reset') || lowerTranscript.includes('clear') || lowerTranscript.includes('default')) {
              return await this.handleResetCommand();
    }

    // Analysis commands
    if (lowerTranscript.includes('analyze') || lowerTranscript.includes('analysis') || lowerTranscript.includes('run analysis')) {
              return await this.handleAnalysisCommand(intent);
    }

    // Confirmation commands
    if (lowerTranscript.startsWith('confirm')) {
              return await this.handleConfirmationCommand(intent);
    }

    return null; // No advanced command detected
  }

  // Handle bulk comparison requests
  private async handleBulkComparison(
    intent: Intent
  ): Promise<any> {
    // Extract positions from transcript (basic parsing)
    const positionMatches = intent.originalText.match(/\d+/g);
    const currentPosition = intent.parameters.position || 12;
    const positions = positionMatches 
      ? positionMatches.map(p => parseInt(p)).filter(p => p >= 1 && p <= 24).slice(0, 6)
      : [currentPosition, Math.max(1, currentPosition - 3), Math.min(24, currentPosition + 3)];

    const scenarios = ['current', 'optimistic', 'pessimistic'];
    const analysisType = intent.originalText.includes('revenue') ? 'revenue' : 
                        intent.originalText.includes('risk') ? 'risk' : 
                        intent.originalText.includes('sustainability') ? 'sustainability' : 'all';

    const action: DashboardAction = {
      type: 'BULK_COMPARE',
      parameters: { positions, scenarios, analysisType },
      requiresConfirmation: positions.length > 4,
      isReversible: false,
      timestamp: Date.now()
    };

    const actionResult = await this.dashboardController.executeAction(action);
    
    const response = actionResult.success 
      ? `I've compared positions ${positions.join(', ')} across all scenarios. ${actionResult.message}. The analysis shows significant variation in ${analysisType} metrics between positions.`
      : `I couldn't complete the bulk comparison: ${actionResult.message}`;

    return {
      response,
      shouldSpeak: true,
      context: this.context,
      intent: { type: 'POSITION_CHANGE', confidence: 0.9, parameters: {}, reasoning: 'Bulk comparison' },
      actionResult
    };
  }

  // Handle export commands
  private async handleExportCommand(
    intent: Intent
  ): Promise<any> {
    const format = intent.originalText.includes('csv') ? 'csv' : 
                  intent.originalText.includes('pdf') ? 'pdf' : 'json';
    
    const includeCharts = intent.originalText.includes('charts') || intent.originalText.includes('graphs');
    const selectedData = ['revenue', 'risk', 'sustainability', 'position'];

    const action: DashboardAction = {
      type: 'EXPORT_DATA',
      parameters: { format, includeCharts, selectedData },
      requiresConfirmation: true,
      isReversible: false,
      timestamp: Date.now()
    };

    const actionResult = await this.dashboardController.executeAction(action);
    
    const response = actionResult.success 
      ? actionResult.message
      : `Export request: ${actionResult.message}`;

    return {
      response,
      shouldSpeak: true,
      context: this.context,
      intent: { type: 'HELP_REQUEST', confidence: 0.9, parameters: {}, reasoning: 'Data export' },
      actionResult
    };
  }

  // Handle undo commands
  private async handleUndoCommand(
    intent: Intent
  ): Promise<any> {
    const steps = intent.originalText.includes('two') || intent.originalText.includes('2') ? 2 : 1;
    
    const actionResult = await this.dashboardController.rollback(steps);
    
    const response = actionResult.success 
      ? `${actionResult.message}. The dashboard has been restored to the previous state.`
      : `I couldn't undo the action: ${actionResult.message}`;

    return {
      response,
      shouldSpeak: true,
      context: this.context,
      intent: { type: 'POSITION_CHANGE', confidence: 0.9, parameters: {}, reasoning: 'Undo action' },
      actionResult
    };
  }

  // Handle reset commands
  private async handleResetCommand(): Promise<{
    response: string;
    newPosition?: number;
    newScenario?: string;
    shouldSpeak: boolean;
    actionResult?: ActionResult;
  }> {
    const action: DashboardAction = {
      type: 'RESET_VIEW',
      parameters: {},
      requiresConfirmation: true,
      isReversible: true,
      timestamp: Date.now()
    };

    const actionResult = await this.dashboardController.executeAction(action);
    
    const response = actionResult.success 
      ? `${actionResult.message}. We're now viewing the mid-table position with current scenario data.`
      : `Reset request: ${actionResult.message}`;

    return {
      response,
      newPosition: 12,
      newScenario: 'current',
      shouldSpeak: true,
      actionResult
    };
  }

  // Handle analysis commands
  private async handleAnalysisCommand(
    intent: Intent
  ): Promise<any> {
    const analysisType = intent.originalText.includes('comprehensive') ? 'comprehensive' :
                        intent.originalText.includes('risk') ? 'risk' :
                        intent.originalText.includes('revenue') ? 'revenue' : 'quick';

    const action: DashboardAction = {
      type: 'RUN_ANALYSIS',
      parameters: { type: analysisType, position: intent.parameters.position || 12, scenario: intent.parameters.scenario || 'current' },
      requiresConfirmation: false,
      isReversible: false,
      timestamp: Date.now()
    };

    const actionResult = await this.dashboardController.executeAction(action);
    
    const response = actionResult.success 
      ? `${actionResult.message}. Based on position ${intent.parameters.position || 12}, I've identified key financial insights and risk factors for your current scenario.`
      : `Analysis failed: ${actionResult.message}`;

    return {
      response,
      shouldSpeak: true,
      actionResult
    };
  }

  // Handle confirmation commands
  private async handleConfirmationCommand(
    intent: Intent
  ): Promise<any> {
    const confirmationMatch = intent.originalText.match(/confirm\s+(\w+)/i);
    if (!confirmationMatch) {
      return {
        response: "I didn't understand which action to confirm. Please include the confirmation code.",
        shouldSpeak: true
      };
    }

    const confirmationId = `confirm_${Date.now()}_${confirmationMatch[1]}`;
    const actionResult = await this.dashboardController.confirmAction(confirmationId);
    
    const response = actionResult.success 
      ? `Action confirmed! ${actionResult.message}`
      : `Confirmation failed: ${actionResult.message}`;

    return {
      response,
      shouldSpeak: true,
      actionResult
    };
  }

  // Determine focus based on intent
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private determineFocus(intent: Intent, _financialData?: FinancialData): string {
    switch (intent.type) {
      case 'POSITION_CHANGE':
        return 'position_analysis'
      case 'SCENARIO_CHANGE':
        return 'scenario_planning'
      case 'FINANCIAL_QUERY':
        return 'financial_query'
      case 'HELP_REQUEST':
        return 'help_request'
      default:
        return 'general_chat'
    }
  }

  // Handle follow-up responses to questions like "Would you like to explore different scenarios?"
  private handleFollowupResponse(
    transcript: string, 
    intent: Intent, 
    financialData?: FinancialData
  ): { response: string; newPosition?: number; newScenario?: string; actionResult?: ActionResult } | null {
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Positive responses - made broader to catch more variations
    if (lowerTranscript.match(/^(yes|yeah|yep|sure|ok|okay|please|go ahead|absolutely|definitely|why not|sounds good|let's do it)/)) {
      this.context.lastAction = 'followup_accepted';
      
      // If we just changed position, show different scenarios
      const previousAction = agentSessions.get(this.sessionId)?.lastAction || '';
      if (previousAction.includes('position_change')) {
        return {
          response: "Excellent! Let me show you the best case scenario first. This represents a promotion push with increased commercial revenue, higher attendance, and playoff bonuses. Would you like to see the worst case scenario next?",
          newScenario: 'optimistic'
        };
      }
      
      // General exploration with more specific options
      const currentPos = this.context.dashboardState.selectedPosition;
      if (currentPos <= 6) {
        return {
          response: "Great! Since we're in playoff territory, shall I show you the promotion bonuses and commercial benefits?",
          newScenario: 'optimistic'
        };
      } else if (currentPos >= 18) {
        return {
          response: "Okay! Let's look at relegation scenarios and how they affect our finances. Want to see the worst case impact?",
          newScenario: 'pessimistic'
        };
      } else {
        return {
          response: "Perfect! I can show you different league positions or scenario outcomes. What interests you most?"
        };
      }
    }
    
    // Negative responses - also broadened
    if (lowerTranscript.match(/^(no|nope|not|never|skip|pass|no thanks|not now|maybe later)/)) {
      this.context.lastAction = 'followup_declined';
      return {
        response: "No problem! Is there anything else about our financial position you'd like to analyze?"
      };
    }
    
    // Requests for more information - expanded patterns
    if (lowerTranscript.match(/(more|tell.*more|explain|details|elaborate|info|information|break.*down)/)) {
      this.context.lastAction = 'followup_more_info';
      const currentPos = this.context.dashboardState.selectedPosition;
      const revenue = financialData?.totalRevenue || 30500000;
      
      return {
        response: `Here are the detailed financials for position ${currentPos}: Annual revenue is £${(revenue/1000000).toFixed(1)}M, which includes TV money, commercial deals, and matchday income. Our wage ratio is currently ${financialData?.wageRatio?.toFixed(1) || '95'}%, putting us in the ${financialData?.riskScore && financialData.riskScore > 70 ? 'high' : 'medium'} risk category. Want to see how different positions change this?`
      };
    }
    
    // Scenario requests - expanded to catch more variations
    if (lowerTranscript.match(/(best|optimistic|promotion|good|positive|up)/)) {
      this.context.lastAction = 'scenario_change_optimistic';
      return {
        response: "Switching to the best case scenario. This shows promotion push benefits with higher commercial multipliers, increased attendance, and potential playoff bonuses. Want to compare with the worst case?",
        newScenario: 'optimistic'
      };
    }
    
    if (lowerTranscript.match(/(worst|pessimistic|relegation|bad|negative|down)/)) {
      this.context.lastAction = 'scenario_change_pessimistic';
      return {
        response: "Switching to worst case scenario. This shows relegation battle impact with reduced commercial income, lower attendance, and financial penalties. Shall I show the optimistic view instead?",
        newScenario: 'pessimistic'
      };
    }

    // Position requests - new addition to handle position follow-ups
    if (lowerTranscript.match(/(position|place|spot|different|other|another)/)) {
      this.context.lastAction = 'followup_position_request';
      return {
        response: "Which position would you like to explore? Just say a number between 1 and 24, or try 'move up' or 'move down'."
      };
    }

    // Comparison requests - new addition
    if (lowerTranscript.match(/(compare|comparison|versus|vs|against|difference)/)) {
      this.context.lastAction = 'followup_comparison_request';
      return {
        response: "I can compare positions, scenarios, or financial metrics. What would you like to compare?"
      };
    }
    
    // If we don't recognize the follow-up, return null to let normal processing handle it
    return null;
  }

  // ENHANCED: Enhance response with dashboard context
  private enhanceResponseWithContext(response: string, context: {
    currentPosition: number
    newPosition?: number
    scenario: string
    newScenario?: string
    financialData?: FinancialData
    intent: string
    conversationHistory: string[]
  }): string {
    let enhancedResponse = response

    // Add concise dashboard context only for major changes
    if (context.newPosition && context.newPosition !== context.currentPosition) {
      const positionChange = context.newPosition - context.currentPosition
      const positions = Math.abs(positionChange)
      
      // Only mention revenue impact for significant moves (3+ positions)
      if (positions >= 3 && context.financialData) {
        const revenueImpact = this.calculateRevenueImpact(context.currentPosition, context.newPosition, context.financialData)
        if (Math.abs(revenueImpact) > 1000000) { // Only mention if over £1M impact
          const impact = revenueImpact > 0 ? 'increases' : 'decreases'
          enhancedResponse += ` This ${impact} revenue by £${(Math.abs(revenueImpact) / 1000000).toFixed(1)}M.`
        }
      }
    }

    // Add conversational follow-ups based on intent and context
    const originalResponse = enhancedResponse
    enhancedResponse = this.addConversationalFollowUp(enhancedResponse, context)

    // Only mark that we expect a follow-up if we actually added one
    if (enhancedResponse !== originalResponse) {
      this.context.lastAction = 'followup_expected'
    }

    return enhancedResponse
  }

  private addConversationalFollowUp(response: string, context: {
    intent: string;
    currentPosition: number;
    newPosition?: number;
    scenario: string;
    newScenario?: string;
    financialData?: FinancialData;
    conversationHistory: string[];
  }): string {
    const { intent, currentPosition, newPosition, financialData } = context
    
    console.log(`🗣️ Adding follow-up for intent: ${intent}, position: ${newPosition || currentPosition}`);
    
    // Position-based follow-ups - keep them short and simple
    if (intent === 'POSITION_CHANGE') {
      const targetPosition = newPosition || currentPosition
      
      if (targetPosition <= 6) {
        const enhanced = response + " Want to see the playoff bonuses?";
        console.log(`✨ Added playoff follow-up: "${enhanced}"`);
        return enhanced;
      } else if (targetPosition >= 18) {
        const enhanced = response + " Should I show relegation impact?";
        console.log(`✨ Added relegation follow-up: "${enhanced}"`);
        return enhanced;
      } else {
        const enhanced = response + " Try a different position?";
        console.log(`✨ Added position follow-up: "${enhanced}"`);
        return enhanced;
      }
    }

    // Financial query follow-ups
    if (intent === 'FINANCIAL_QUERY') {
      if (financialData?.wageRatio && financialData.wageRatio > 90) {
        return response + " Want to see how position affects this?"
      } else {
        return response + " Check other scenarios?"
      }
    }

    // Scenario change follow-ups
    if (intent === 'SCENARIO_CHANGE') {
      const scenario = context.newScenario || context.scenario
      if (scenario === 'optimistic') {
        return response + " Compare with worst case?"
      } else if (scenario === 'pessimistic') {
        return response + " See the optimistic view?"
      } else {
        return response + " Try different scenarios?"
      }
    }

    // Help request follow-ups
    if (intent === 'HELP_REQUEST') {
      return response + " What would you like to explore?"
    }

    // General conversation follow-ups - make them more engaging
    const followUps = [
      " What else would you like to see?",
      " Shall we look at something else?", 
      " Want to explore more?",
      " What's next on your mind?",
      " Anything else to analyze?"
    ]
    
    // Pick a random follow-up to keep it fresh
    const randomFollowUp = followUps[Math.floor(Math.random() * followUps.length)]
    return response + randomFollowUp
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateRevenueImpact(currentPos: number, newPos: number, _financialData: FinancialData): number {
    // Simplified revenue impact calculation - each position is worth roughly £400K-500K
    const positionDifference = currentPos - newPos // Negative means moving up (better)
    const averageImpactPerPosition = 450000 // £450K per position
    
    // Moving up increases revenue, moving down decreases it
    return positionDifference * averageImpactPerPosition
  }
}

// Export singleton instance for easy access
export const defaultAaranAgent = new AaranAgent('frf7-main-session') 