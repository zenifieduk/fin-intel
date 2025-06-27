import { NextRequest, NextResponse } from 'next/server'
import { Index } from '@upstash/vector'

export async function GET() {
  try {
    console.log('🔍 Testing Upstash Vector SDK connection...')
    
    // Initialize Upstash Vector with your credentials (SDK format)
    const index = new Index({
      url: "https://busy-mosquito-10553-us1-vector.upstash.io",
      token: "ABcFMGJ1c3ktbW9zcXVpdG8tMTA1NTMtdXMxYWRtaW5PVEExTjJVMFpUSXRObVU4TlMwME9EQmxMVGswTmpRdE9HRTNNR1ExTnpnME5qaGs="
    })

    // Test connection with info
    const info = await index.info()
    
    return NextResponse.json({
      success: true,
      message: 'Upstash Vector SDK connection successful! 🎉',
      vectorDatabase: {
        url: "https://busy-mosquito-10553-us1-vector.upstash.io",
        status: 'connected',
        info: info
      }
    })

  } catch (error) {
    console.error('SDK test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Vector SDK test failed'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('🧪 Testing Vector operations...')
    
    // Initialize index
    const index = new Index({
      url: "https://busy-mosquito-10553-us1-vector.upstash.io", 
      token: "ABcFMGJ1c3ktbW9zcXVpdG8tMTA1NTMtdXMxYWRtaW5PVEExTjJVMFpUSXRObVU4TlMwME9EQmxMVGswTmpRdE9HRTNNR1ExTnpnME5qaGs="
    })

    // Test upsert operation
    const testResult = await index.upsert([
      {
        id: 'test-james-williams-basic',
        data: 'James Williams is a professional footballer who signed with Manchester United. His basic contract information includes performance metrics and team assignment details.',
        metadata: {
          player: 'James Williams',
          section: 'Basic Information',
          confidentiality: 'restricted',
          contract_type: 'player',
          timestamp: new Date().toISOString()
        }
      }
    ])

    // Test query operation
    const queryResult = await index.query({
      data: 'James Williams Manchester United contract',
      topK: 3,
      includeMetadata: true
    })

    return NextResponse.json({
      success: true,
      message: 'Vector operations successful! 🚀',
      operations: {
        upsert: {
          status: 'success',
          result: testResult
        },
        query: {
          status: 'success',
          matches: queryResult.length,
          results: queryResult.map(match => ({
            id: match.id,
            score: match.score,
            player: match.metadata?.player,
            section: match.metadata?.section,
            confidentiality: match.metadata?.confidentiality
          }))
        }
      }
    })

  } catch (error) {
    console.error('Operations test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Vector operations test failed'
    }, { status: 500 })
  }
} 