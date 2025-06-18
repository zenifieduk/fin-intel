import { NextRequest, NextResponse } from 'next/server'
import { ContractQueries } from '@/lib/contract-queries'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }
    
    // Process the natural language query
    const results = await ContractQueries.processNaturalLanguageQuery(query)
    
    // Handle different result types (arrays vs objects)
    const count = Array.isArray(results) ? results.length : 1
    
    // Format response for AARAN
    return NextResponse.json({
      success: true,
      query: query,
      results: results,
      count: count,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Contract query error:', error)
    return NextResponse.json(
      { error: 'Failed to process contract query' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    let results = []
    
    switch (action) {
      case 'expiring-2025':
        results = await ContractQueries.getPlayersOutOfContract(2025)
        break
      case 'expiring-2026':
        results = await ContractQueries.getPlayersOutOfContract(2026)
        break
      case 'wage-bill':
        results = [await ContractQueries.getClubWageBill()]
        break
      case 'highest-paid':
        results = await ContractQueries.getHighestPaidPlayers(5)
        break
      case 'all-contracts':
      default:
        results = await ContractQueries.getAllActiveContracts()
        break
    }
    
    return NextResponse.json({
      success: true,
      action: action || 'all-contracts',
      results: results,
      count: results.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Contract query error:', error)
    return NextResponse.json(
      { error: 'Failed to process contract query' },
      { status: 500 }
    )
  }
} 