// Financial Knowledge Retrieval System
// Intelligent search and response generation for Aaran voice assistant

import { 
  financialKnowledgeBase, 
  criticalConcepts, 
  dashboardHelp,
  financialConcepts,
  type KnowledgeEntry 
} from '../data/financial-knowledge';
import { type ConversationContext } from './aaran-agent';

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry
  relevanceScore: number
  matchType: 'concept' | 'definition' | 'related_terms' | 'key_facts' | 'examples'
  matchedText: string
}

export interface KnowledgeResponse {
  answer: string
  sources: KnowledgeEntry[]
  confidence: number
  suggestions: string[]
  contextualData?: string
}

export class FinancialKnowledgeRetrieval {
  private knowledgeCache = new Map<string, KnowledgeResponse>()
  
  // Main knowledge retrieval method
  async findRelevantKnowledge(
    query: string, 
    context: ConversationContext,
    currentFinancialData?: any
  ): Promise<KnowledgeResponse> {
    // Check cache first for frequently asked questions
    const cacheKey = this.generateCacheKey(query, context)
    const cached = this.knowledgeCache.get(cacheKey)
    if (cached) {
      return this.addContextualData(cached, currentFinancialData)
    }

    console.log(`🔍 Knowledge search for: "${query}"`)
    
    // Search through knowledge base
    const searchResults = this.searchKnowledge(query)
    
    // Generate response based on results
    const response = this.generateKnowledgeResponse(
      query, 
      searchResults, 
      context, 
      currentFinancialData
    )
    
    // Cache if confidence is high
    if (response.confidence > 0.7) {
      this.knowledgeCache.set(cacheKey, response)
    }
    
    return response
  }

  // Advanced knowledge search with multiple matching strategies
  private searchKnowledge(query: string): KnowledgeSearchResult[] {
    const normalizedQuery = query.toLowerCase().trim()
    const queryTerms = normalizedQuery.split(/\s+/)
    const results: KnowledgeSearchResult[] = []

    for (const entry of financialKnowledgeBase) {
      let relevanceScore = 0
      let matchType: KnowledgeSearchResult['matchType'] = 'concept'
      let matchedText = ''

      // 1. Direct concept name matching (highest priority)
      const conceptMatch = this.calculateStringMatch(
        normalizedQuery, 
        entry.concept.toLowerCase()
      )
      if (conceptMatch > 0.8) {
        relevanceScore = conceptMatch * 1.0
        matchType = 'concept'
        matchedText = entry.concept
      }

      // 2. Definition content matching
      const definitionMatch = this.calculateContentMatch(
        queryTerms, 
        entry.definition.toLowerCase()
      )
      if (definitionMatch > relevanceScore) {
        relevanceScore = definitionMatch * 0.9
        matchType = 'definition'
        matchedText = entry.definition
      }

      // 3. Related terms matching
      const relatedTermsMatch = this.calculateTermsMatch(
        queryTerms,
        entry.relatedTerms
      )
      if (relatedTermsMatch > relevanceScore) {
        relevanceScore = relatedTermsMatch * 0.8
        matchType = 'related_terms'
        matchedText = entry.relatedTerms.join(', ')
      }

      // 4. Key facts matching
      if (entry.keyFacts) {
        const keyFactsMatch = this.calculateFactsMatch(
          queryTerms,
          entry.keyFacts
        )
        if (keyFactsMatch > relevanceScore) {
          relevanceScore = keyFactsMatch * 0.7
          matchType = 'key_facts'
          matchedText = entry.keyFacts.join('; ')
        }
      }

      // 5. Examples matching
      if (entry.examples) {
        const examplesMatch = this.calculateFactsMatch(
          queryTerms,
          entry.examples
        )
        if (examplesMatch > relevanceScore) {
          relevanceScore = examplesMatch * 0.6
          matchType = 'examples'
          matchedText = entry.examples.join('; ')
        }
      }

      // Include results with meaningful relevance
      if (relevanceScore > 0.3) {
        results.push({
          entry,
          relevanceScore,
          matchType,
          matchedText
        })
      }
    }

    // Sort by relevance score (descending)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  // Generate comprehensive response from search results
  private generateKnowledgeResponse(
    query: string,
    searchResults: KnowledgeSearchResult[],
    context: ConversationContext,
    currentFinancialData?: any
  ): KnowledgeResponse {
    if (searchResults.length === 0) {
      return {
        answer: "I don't have specific information about that topic in my knowledge base. Try asking about league positions, financial metrics, or regulatory rules.",
        sources: [],
        confidence: 0.1,
        suggestions: [
          "What's the revenue impact of league position?",
          "Explain parachute payments",
          "How do wage ratios work?",
          "Tell me about PSR rules"
        ]
      }
    }

    const topResult = searchResults[0]
    const additionalSources = searchResults.slice(1, 3) // Include up to 3 sources

    // Generate main answer based on top result
    let answer = this.formatMainAnswer(topResult, query)
    
    // Add contextual financial data if relevant
    const contextualData = this.generateContextualData(
      topResult.entry, 
      currentFinancialData, 
      context
    )
    if (contextualData) {
      answer += ` ${contextualData}`
    }

    // Add supporting information from additional sources
    if (additionalSources.length > 0) {
      const supportingInfo = this.generateSupportingInfo(additionalSources)
      if (supportingInfo) {
        answer += ` ${supportingInfo}`
      }
    }

    // Generate related suggestions
    const suggestions = this.generateSuggestions(topResult.entry, searchResults)

    return {
      answer,
      sources: [topResult.entry, ...additionalSources.map(r => r.entry)],
      confidence: Math.min(topResult.relevanceScore, 0.95),
      suggestions,
      contextualData
    }
  }

  // Format the main answer based on the top search result
  private formatMainAnswer(result: KnowledgeSearchResult, query: string): string {
    const { entry, matchType } = result

    switch (matchType) {
      case 'concept':
        return `${entry.definition}${this.addKeyFacts(entry)}`
      
      case 'definition':
        return `${entry.concept}: ${entry.definition}${this.addKeyFacts(entry)}`
      
      case 'related_terms':
        return `Regarding ${entry.concept}: ${entry.definition}${this.addKeyFacts(entry)}`
      
      case 'key_facts':
        return `About ${entry.concept}: ${entry.definition}${this.addKeyFacts(entry)}`
      
      case 'examples':
        return `${entry.concept} - ${entry.definition}${this.addExamples(entry)}`
      
      default:
        return `${entry.concept}: ${entry.definition}`
    }
  }

  // Add key facts to the answer if available
  private addKeyFacts(entry: KnowledgeEntry): string {
    if (!entry.keyFacts || entry.keyFacts.length === 0) return ''
    
    const facts = entry.keyFacts.slice(0, 3) // Limit to 3 key facts for voice
    return `. Key facts: ${facts.join(', ')}`
  }

  // Add examples to the answer if available
  private addExamples(entry: KnowledgeEntry): string {
    if (!entry.examples || entry.examples.length === 0) return ''
    
    const examples = entry.examples.slice(0, 2) // Limit to 2 examples for voice
    return `. Examples include: ${examples.join(', ')}`
  }

  // Generate supporting information from additional sources
  private generateSupportingInfo(additionalSources: KnowledgeSearchResult[]): string {
    if (additionalSources.length === 0) return ''
    
    const relatedConcepts = additionalSources
      .filter(source => source.entry.significance === 'high')
      .map(source => source.entry.concept)
      .slice(0, 2)
    
    if (relatedConcepts.length > 0) {
      return ` This is also related to ${relatedConcepts.join(' and ')}.`
    }
    
    return ''
  }

  // Generate contextual data based on current dashboard state
  private generateContextualData(
    entry: KnowledgeEntry, 
    currentFinancialData: any, 
    context: ConversationContext
  ): string | undefined {
    if (!currentFinancialData) return undefined

    const position = context.dashboardState.selectedPosition
    const revenue = currentFinancialData.totalRevenue / 1000000 // Convert to millions
    const risk = currentFinancialData.riskScore

    // Context-specific responses based on knowledge entry
    switch (entry.id) {
      case 'league-position-modeling':
        return `At your current position ${position}, this translates to approximately £${revenue.toFixed(1)} million in annual revenue.`
      
      case 'wage-ratios':
        if (currentFinancialData.wageRatio) {
          const wageRatio = Math.round(currentFinancialData.wageRatio)
          return `Your current wage ratio is ${wageRatio}%, which is ${wageRatio > 70 ? 'concerning' : 'healthy'} compared to Championship averages.`
        }
        break
      
      case 'championship-paradox':
        return `At position ${position}, your club is ${position <= 6 ? 'in the promotion chase' : position >= 18 ? 'in a relegation battle' : 'in the mid-table financial squeeze'}.`
      
      case 'season-ticket-renewals':
        const renewalCategory = position <= 6 ? '85-90%' : position <= 15 ? '75-85%' : '65-75%'
        return `At position ${position}, you can expect approximately ${renewalCategory} season ticket renewal rates.`
      
      default:
        return undefined
    }
  }

  // Generate helpful suggestions based on search results
  private generateSuggestions(topEntry: KnowledgeEntry, allResults: KnowledgeSearchResult[]): string[] {
    const suggestions: string[] = []
    
    // Add related concept suggestions
    const relatedConcepts = allResults
      .slice(1, 4)
      .map(result => `Tell me about ${result.entry.concept.toLowerCase()}`)
    
    suggestions.push(...relatedConcepts)

    // Add category-specific suggestions
    switch (topEntry.category) {
      case 'position-analysis':
        suggestions.push(
          "What happens in the playoff positions?",
          "Show me relegation zone impact"
        )
        break
      
      case 'revenue-streams':
        suggestions.push(
          "How do parachute payments work?",
          "What's the broadcasting revenue split?"
        )
        break
      
      case 'cost-management':
        suggestions.push(
          "What are healthy wage ratios?",
          "Tell me about agent fees"
        )
        break
      
      case 'compliance':
        suggestions.push(
          "What are PSR rules?",
          "Explain SCMP regulations"
        )
        break
    }

    // Ensure we have some suggestions and limit to 4
    if (suggestions.length === 0) {
      suggestions.push(
        "What's the financial impact of promotion?",
        "How do league positions affect revenue?",
        "Tell me about financial regulations"
      )
    }

    return suggestions.slice(0, 4)
  }

  // String matching algorithm for concept names
  private calculateStringMatch(query: string, target: string): number {
    if (query === target) return 1.0
    if (target.includes(query) || query.includes(target)) return 0.8
    
    // Simple character overlap scoring
    const queryChars = new Set(query.replace(/\s/g, ''))
    const targetChars = new Set(target.replace(/\s/g, ''))
    const overlap = [...queryChars].filter(char => targetChars.has(char)).length
    const maxLength = Math.max(queryChars.size, targetChars.size)
    
    return overlap / maxLength
  }

  // Content matching for definitions and descriptions
  private calculateContentMatch(queryTerms: string[], content: string): number {
    const contentWords = content.toLowerCase().split(/\s+/)
    const matchCount = queryTerms.filter(term => 
      contentWords.some(word => word.includes(term) || term.includes(word))
    ).length
    
    return matchCount / queryTerms.length
  }

  // Related terms matching
  private calculateTermsMatch(queryTerms: string[], relatedTerms: string[]): number {
    const normalizedTerms = relatedTerms.map(term => term.toLowerCase())
    const matchCount = queryTerms.filter(term =>
      normalizedTerms.some(relatedTerm => 
        relatedTerm.includes(term) || term.includes(relatedTerm)
      )
    ).length
    
    return matchCount / queryTerms.length
  }

  // Key facts and examples matching
  private calculateFactsMatch(queryTerms: string[], facts: string[]): number {
    const allFactsText = facts.join(' ').toLowerCase()
    const matchCount = queryTerms.filter(term => 
      allFactsText.includes(term)
    ).length
    
    return matchCount / queryTerms.length
  }

  // Cache key generation
  private generateCacheKey(query: string, context: ConversationContext): string {
    const normalizedQuery = query.toLowerCase().trim()
    const contextKey = `${context.currentFocus}_${context.dashboardState.selectedPosition}`
    return `${normalizedQuery}_${contextKey}`
  }

  // Add contextual data to cached responses
  private addContextualData(
    cachedResponse: KnowledgeResponse, 
    currentFinancialData?: any
  ): KnowledgeResponse {
    if (!currentFinancialData || cachedResponse.contextualData) {
      return cachedResponse
    }
    
    // Add fresh contextual data to cached response
    return {
      ...cachedResponse,
      contextualData: this.generateContextualData(
        cachedResponse.sources[0],
        currentFinancialData,
        { dashboardState: { selectedPosition: 12 } } as ConversationContext
      )
    }
  }

  // Quick access methods for specific knowledge areas
  getDashboardHelp(): KnowledgeEntry[] {
    return dashboardHelp
  }

  getCriticalConcepts(): KnowledgeEntry[] {
    return criticalConcepts
  }

  getFinancialConcepts(): KnowledgeEntry[] {
    return financialConcepts
  }

  // Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.knowledgeCache.clear()
  }
}

// Export default instance
export const defaultKnowledgeRetrieval = new FinancialKnowledgeRetrieval() 