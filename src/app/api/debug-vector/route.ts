import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debugging vector database credentials...')
    
    const vectorUrl = "https://busy-mosquito-10553-us1-vector.upstash.io"
    const vectorToken = "ABcFMGJ1c3ktbW9zcXVpdG8tMTA1NTMtdXMxYWRtaW5PVEExTjJVMFpUSXRObVU4TlMwME9EQmxMVGswTmpRdE9HRTNNR1ExTnpnME5qaGs="
    
    // Test 1: Raw token info
    console.log('Token length:', vectorToken.length)
    console.log('Token starts with:', vectorToken.substring(0, 10))
    
    // Test 2: Try different auth methods
    const authTests = [
      {
        name: 'Bearer Token',
        headers: {
          'Authorization': `Bearer ${vectorToken}`,
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Basic Auth (decoded)',
        headers: {
          'Authorization': `Basic ${vectorToken}`,
          'Content-Type': 'application/json'
        }
      }
    ]
    
    const results = []
    
    for (const test of authTests) {
      try {
        console.log(`Testing: ${test.name}`)
        
        const response = await fetch(`${vectorUrl}/info`, {
          method: 'GET',
          headers: test.headers
        })
        
        const responseText = await response.text()
        
        results.push({
          method: test.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          response: responseText,
          headers: Object.fromEntries(response.headers.entries())
        })
        
      } catch (error) {
        results.push({
          method: test.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })
      }
    }
    
    // Decode the token to check its structure
    let decodedToken = ''
    try {
      decodedToken = Buffer.from(vectorToken, 'base64').toString('utf-8')
    } catch (e) {
      decodedToken = 'Failed to decode as base64'
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication debugging results',
      credentials: {
        url: vectorUrl,
        tokenLength: vectorToken.length,
        tokenPreview: vectorToken.substring(0, 20) + '...',
        decodedToken: decodedToken
      },
      authTests: results,
      recommendations: [
        'Check if vector database is active in Upstash console',
        'Verify token is for Vector database (not Redis)',
        'Ensure URL and token are from same database',
        'Try copying fresh credentials from Upstash console'
      ]
    })

  } catch (error) {
    console.error('Debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Debug test failed'
    }, { status: 500 })
  }
} 