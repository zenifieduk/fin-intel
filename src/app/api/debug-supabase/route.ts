import { NextRequest, NextResponse } from 'next/server'
import { ContractQueries } from '@/lib/contract-queries'

export async function GET(request: NextRequest) {
  try {
    // Test basic connection and table existence
    const activeContracts = await ContractQueries.getAllActiveContracts()
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      tableExists: true,
      contractCount: activeContracts.length,
      contracts: activeContracts
    })
  } catch (error) {
    console.error('Supabase debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to Supabase or tables do not exist'
    }, { status: 500 })
  }
} 