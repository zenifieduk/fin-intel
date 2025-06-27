import { NextRequest, NextResponse } from 'next/server'

// Simple test without the hybrid system to avoid linter issues for now
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || "Tell me about Manchester United's history"
    const userRole = searchParams.get('userRole') || 'general'

    console.log(`🧪 Testing hybrid query: "${query}" for role: ${userRole}`)

    // Test ElevenLabs RAG directly
    const elevenLabsResult = await testElevenLabsRAG(query)
    
    // Test sensitivity detection
    const sensitivity = detectQuerySensitivity(query)
    
    return NextResponse.json({
      success: true,
      message: 'Hybrid knowledge system test',
      query,
      userRole,
      elevenLabsRAG: {
        status: elevenLabsResult.success ? 'working' : 'failed',
        latency: elevenLabsResult.latency,
        results: elevenLabsResult.results?.length || 0,
        error: elevenLabsResult.error
      },
      sensitivityDetection: sensitivity,
      recommendations: [
        "ElevenLabs RAG configured with index: fiL0YfUhYenMdwWTvzgN",
        "Using intfloat/e5-mistral-7b-instruct embeddings",
        "Manchester United PDF successfully indexed (18.8 kB)",
        sensitivity.requiresSecureData ? "⚠️ Sensitive query detected - would route to Upstash Vector" : "✅ Safe query - using fast ElevenLabs RAG"
      ]
    })

  } catch (error) {
    console.error('Hybrid test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Hybrid knowledge test failed'
    }, { status: 500 })
  }
}

async function testElevenLabsRAG(query: string) {
  const startTime = Date.now()
  
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return {
        success: false,
        error: 'ElevenLabs API key not configured',
        latency: 0
      }
    }

    const indexId = 'fiL0YfUhYenMdwWTvzgN' // From your screenshot
    
    const response = await fetch(`https://api.elevenlabs.io/v1/knowledge-base/${indexId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        query: query,
        top_k: 3,
        model: 'intfloat/e5-mistral-7b-instruct'
      })
    })
    
    const latency = Date.now() - startTime
    
    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`,
        latency
      }
    }
    
    const data = await response.json()
    
    return {
      success: true,
      latency,
      results: data.results || [],
      dataFound: data.results?.length > 0
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - startTime
    }
  }
}

function detectQuerySensitivity(query: string): { requiresSecureData: boolean; level: string; keywords: string[] } {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queries } = body
    
    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json({
        success: false,
        message: 'Please provide an array of test queries'
      }, { status: 400 })
    }

    console.log(`🧪 Batch testing ${queries.length} queries`)
    
    const results = []
    for (const query of queries) {
      const result = await testElevenLabsRAG(query)
      const sensitivity = detectQuerySensitivity(query)
      
      results.push({
        query,
        elevenLabsRAG: result,
        sensitivity,
        recommendedSource: sensitivity.requiresSecureData ? 'upstash-vector' : 'elevenlabs-rag'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `Tested ${queries.length} queries`,
      results,
      summary: {
        totalQueries: queries.length,
        elevenLabsWorking: results.filter(r => r.elevenLabsRAG.success).length,
        sensitiveQueries: results.filter(r => r.sensitivity.requiresSecureData).length,
        averageLatency: results.reduce((sum, r) => sum + r.elevenLabsRAG.latency, 0) / results.length
      }
    })

  } catch (error) {
    console.error('Batch test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 