import { Index } from '@upstash/vector'

// Types for the hybrid system
interface QueryResult {
  source: 'elevenlabs-rag' | 'upstash-vector'
  content: string
  confidence: number
  latency: number
  metadata?: Record<string, any>
}

interface HybridQueryResponse {
  results: QueryResult[]
  primarySource: string
  totalLatency: number
  sensitivityDetected: boolean
  recommendations: string[]
}

interface VectorMatch {
  id: string
  score?: number
  metadata?: Record<string, any>
}

export class HybridKnowledgeRetrieval {
  private vectorDb: Index | null
  private elevenLabsIndexId: string
  
  constructor(elevenLabsIndexId: string = 'fiL0YfUhYenMdwWTvzgN') {
    this.elevenLabsIndexId = elevenLabsIndexId
    
    try {
      this.vectorDb = new Index({
        url: process.env.UPSTASH_VECTOR_REST_URL!,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      })
    } catch (error) {
      console.error('❌ Upstash Vector initialization failed:', error)
      this.vectorDb = null
    }
  }

  /**
   * Smart query routing based on content sensitivity detection
   */
  async queryKnowledgeBase(
    query: string, 
    userRole: string = 'general',
    maxResults: number = 5
  ): Promise<HybridQueryResponse> {
    const startTime = Date.now()
    
    // 1. Detect query sensitivity
    const sensitivityLevel = this.detectQuerySensitivity(query)
    const results: QueryResult[] = []
    
    // 2. Always query ElevenLabs RAG first (ultra-fast, non-sensitive)
    const elevenLabsResults = await this.queryElevenLabsRAG(query, maxResults)
    results.push(...elevenLabsResults)
    
    // 3. Query Upstash Vector if sensitive content needed and user authorized
    if (sensitivityLevel.requiresSecureData && this.isAuthorizedForSensitiveData(userRole)) {
      const upstashResults = await this.queryUpstashVector(query, maxResults)
      results.push(...upstashResults)
    }
    
    // 4. Rank and blend results
    const rankedResults = this.rankAndBlendResults(results, query)
    
    return {
      results: rankedResults,
      primarySource: rankedResults[0]?.source || 'none',
      totalLatency: Date.now() - startTime,
      sensitivityDetected: sensitivityLevel.requiresSecureData,
      recommendations: this.generateRecommendations(rankedResults, sensitivityLevel)
    }
  }

  /**
   * Query ElevenLabs RAG system (ultra-low latency)
   */
  private async queryElevenLabsRAG(query: string, maxResults: number): Promise<QueryResult[]> {
    const startTime = Date.now()
    
    try {
      // Using the index ID from your screenshot: fiL0YfUhYenMdwWTvzgN
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        console.warn('ElevenLabs API key not found')
        return []
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/knowledge-base/${this.elevenLabsIndexId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          query: query,
          top_k: maxResults,
          model: 'intfloat/e5-mistral-7b-instruct' // From your screenshot
        })
      })
      
      if (!response.ok) {
        throw new Error(`ElevenLabs RAG query failed: ${response.status}`)
      }
      
      const data = await response.json()
      const latency = Date.now() - startTime
      
      return data.results?.map((result: any, index: number) => ({
        source: 'elevenlabs-rag' as const,
        content: result.content || result.text,
        confidence: result.score || (1 - index * 0.1), // Estimated confidence
        latency,
        metadata: {
          chunk_id: result.id,
          embedding_model: 'intfloat/e5-mistral-7b-instruct',
          source_document: 'Manchester United Football Club_ A Complete Histor.pdf'
        }
      })) || []
      
    } catch (error) {
      console.error('ElevenLabs RAG query error:', error)
      return []
    }
  }

  /**
   * Query Upstash Vector for sensitive data
   */
  private async queryUpstashVector(query: string, maxResults: number): Promise<QueryResult[]> {
    if (!this.vectorDb) return []
    
    const startTime = Date.now()
    
    try {
      // Generate embedding for the query (you'd use your embedding service)
      const embedding = await this.generateEmbedding(query)
      
      const results = await this.vectorDb.query({
        vector: embedding,
        topK: maxResults,
        includeMetadata: true,
        filter: {
          // Only query sensitive/contract data
          type: 'contract',
          confidentiality: ['restricted', 'confidential']
        }
      })
      
      const latency = Date.now() - startTime
      
      return results.matches?.map((match: VectorMatch) => ({
        source: 'upstash-vector' as const,
        content: match.metadata?.content || 'Sensitive content available',
        confidence: match.score || 0,
        latency,
        metadata: {
          vector_id: match.id,
          confidentiality: match.metadata?.confidentiality,
          access_required: match.metadata?.access_roles
        }
      })) || []
      
    } catch (error) {
      console.error('Upstash Vector query error:', error)
      return []
    }
  }

  /**
   * Detect if query contains sensitive financial/contract terms
   */
  private detectQuerySensitivity(query: string): { requiresSecureData: boolean; level: string; keywords: string[] } {
    const sensitiveKeywords = [
      'salary', 'wage', 'contract', 'fee', 'transfer', 'bonus', 'clause',
      'termination', 'buy-out', 'release', 'compensation', 'financial',
      'confidential', 'agreement', 'deal', 'payment', 'earnings'
    ]
    
    const foundKeywords = sensitiveKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    )
    
    return {
      requiresSecureData: foundKeywords.length > 0,
      level: foundKeywords.length > 2 ? 'high' : foundKeywords.length > 0 ? 'medium' : 'low',
      keywords: foundKeywords
    }
  }

  /**
   * Check if user role can access sensitive data
   */
  private isAuthorizedForSensitiveData(userRole: string): boolean {
    const authorizedRoles = ['board', 'legal', 'finance', 'management', 'boardroom']
    return authorizedRoles.includes(userRole.toLowerCase())
  }

  /**
   * Rank and blend results from both sources
   */
  private rankAndBlendResults(results: QueryResult[], query: string): QueryResult[] {
    // Sort by relevance (confidence) and latency
    return results
      .sort((a, b) => {
        // Prioritize higher confidence, then lower latency
        if (Math.abs(a.confidence - b.confidence) > 0.1) {
          return b.confidence - a.confidence
        }
        return a.latency - b.latency
      })
      .slice(0, 5) // Return top 5 results
  }

  /**
   * Generate recommendations for NICO's response
   */
  private generateRecommendations(results: QueryResult[], sensitivity: any): string[] {
    const recommendations = []
    
    if (results.length === 0) {
      recommendations.push("No relevant information found in knowledge base")
    }
    
    if (sensitivity.requiresSecureData && !results.some(r => r.source === 'upstash-vector')) {
      recommendations.push("Sensitive data detected but access restricted - consider upgrading user permissions")
    }
    
    if (results.some(r => r.latency > 500)) {
      recommendations.push("High latency detected - consider optimizing vector queries")
    }
    
    const elevenLabsCount = results.filter(r => r.source === 'elevenlabs-rag').length
    const upstashCount = results.filter(r => r.source === 'upstash-vector').length
    
    recommendations.push(`Data sources: ${elevenLabsCount} from ElevenLabs RAG, ${upstashCount} from secure vector DB`)
    
    return recommendations
  }

  /**
   * Placeholder for embedding generation (replace with your embedding service)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // This would integrate with OpenAI embeddings or similar
    // For now, return a dummy embedding
    return new Array(1536).fill(0).map(() => Math.random())
  }

  /**
   * Test both data sources
   */
  async testHybridSystem(): Promise<any> {
    console.log('🧪 Testing Hybrid Knowledge Retrieval System')
    
    // Test queries
    const testQueries = [
      { query: "Tell me about Manchester United's history", expectedSource: "elevenlabs-rag" },
      { query: "What are the salary details in the contract?", expectedSource: "upstash-vector" },
      { query: "Who scored the most goals last season?", expectedSource: "elevenlabs-rag" }
    ]
    
    const results = []
    for (const test of testQueries) {
      console.log(`Testing: "${test.query}"`)
      const result = await this.queryKnowledgeBase(test.query, 'boardroom')
      results.push({
        query: test.query,
        expected: test.expectedSource,
        actual: result.primarySource,
        latency: result.totalLatency,
        results: result.results.length
      })
    }
    
    return {
      testResults: results,
      systemStatus: {
        elevenLabsRAG: this.elevenLabsIndexId ? 'configured' : 'missing',
        upstashVector: this.vectorDb ? 'configured' : 'missing'
      }
    }
  }
}

// Export singleton instance
export const hybridKnowledge = new HybridKnowledgeRetrieval() 