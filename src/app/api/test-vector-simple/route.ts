import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing vector database connection...')
    
    // Check environment variables
    const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL
    const vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN
    
    if (!vectorUrl || !vectorToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl: !!vectorUrl,
          hasToken: !!vectorToken,
          envPath: process.cwd() + '/.env.local'
        }
      }, { status: 400 })
    }

    // Test direct API call to Upstash Vector
    const testResponse = await fetch(`${vectorUrl}/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vectorToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('Vector API error:', testResponse.status, errorText)
      
      return NextResponse.json({
        success: false,
        error: `Vector API error: ${testResponse.status}`,
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          errorBody: errorText,
          url: vectorUrl,
          tokenLength: vectorToken.length
        }
      }, { status: 400 })
    }

    const vectorInfo = await testResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Vector database connection successful!',
      vectorDatabase: {
        url: vectorUrl,
        status: 'connected',
        info: vectorInfo
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasEnvFile: true
      }
    })

  } catch (error) {
    console.error('Vector test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Vector database test failed'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Test a simple vector operation
    const vectorUrl = process.env.UPSTASH_VECTOR_REST_URL
    const vectorToken = process.env.UPSTASH_VECTOR_REST_TOKEN
    
    if (!vectorUrl || !vectorToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials'
      }, { status: 400 })
    }

    // Test upsert operation with simple data
    const testVector = {
      id: 'test-contract-chunk',
      data: 'This is a test contract section about James Williams basic information.',
      metadata: {
        player: 'James Williams',
        section: 'Test Section',
        confidentiality: 'restricted',
        timestamp: new Date().toISOString()
      }
    }

    const upsertResponse = await fetch(`${vectorUrl}/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vectorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([testVector])
    })

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text()
      return NextResponse.json({
        success: false,
        error: `Upsert failed: ${upsertResponse.status}`,
        details: errorText
      }, { status: 400 })
    }

    const upsertResult = await upsertResponse.json()

    // Test query operation
    const queryResponse = await fetch(`${vectorUrl}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vectorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: 'James Williams contract information',
        topK: 3,
        includeMetadata: true
      })
    })

    let queryResult = null
    if (queryResponse.ok) {
      queryResult = await queryResponse.json()
    }

    return NextResponse.json({
      success: true,
      message: 'Vector operations test successful!',
      operations: {
        upsert: {
          status: 'success',
          result: upsertResult
        },
        query: {
          status: queryResponse.ok ? 'success' : 'failed',
          result: queryResult,
          matches: queryResult?.length || 0
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 