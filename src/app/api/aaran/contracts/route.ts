import { NextRequest, NextResponse } from 'next/server'
import { ContractQueries } from '@/lib/contract-queries'

interface ToolCallRequest {
  query: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ToolCallRequest = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    console.log('🏴 AARAN Contract Query:', query)

    const result = await processContractQuery(query)

    console.log('✅ AARAN Response:', result)

    return NextResponse.json({
      success: true,
      query: query,
      result: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Contract API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process contract query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processContractQuery(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase()

  try {
    // Contract expiry queries
    if (lowerQuery.includes('out of contract') || lowerQuery.includes('contract expir') || lowerQuery.includes('expiring')) {
      if (lowerQuery.includes('2025') || lowerQuery.includes('this year') || lowerQuery.includes('next year')) {
        const expiring = await ContractQueries.getPlayersOutOfContract(2025)
        if (expiring.length === 0) {
          return "No players have contracts expiring in 2025. All current Manchester United contracts extend beyond 2025."
        }
        
        const playerList = expiring.map((p: any) => {
          const expiryDate = new Date(p.end_date).toLocaleDateString('en-GB')
          return `${p.player_name} (expires ${expiryDate})`
        }).join(', ')
        
        return `${expiring.length} player${expiring.length > 1 ? 's have' : ' has'} contracts expiring in 2025: ${playerList}.`
      }
      
      if (lowerQuery.includes('2026')) {
        const expiring = await ContractQueries.getPlayersOutOfContract(2026)
        if (expiring.length === 0) {
          return "No players have contracts expiring in 2026."
        }
        
        const playerList = expiring.map((p: any) => {
          const expiryDate = new Date(p.end_date).toLocaleDateString('en-GB')
          return `${p.player_name} (expires ${expiryDate})`
        }).join(', ')
        
        return `${expiring.length} player${expiring.length > 1 ? 's have' : ' has'} contracts expiring in 2026: ${playerList}.`
      }

      // Default to current contracts expiring soon
      const expiringContracts = await ContractQueries.getContractsExpiringSoon()
      if (expiringContracts.length === 0) {
        return "No contracts expiring in the near future."
      }
      
      const contractSummary = expiringContracts.map((p: any) => {
        const expiryDate = new Date(p.end_date).toLocaleDateString('en-GB')
        return `${p.player_name} (contract until ${expiryDate})`
      }).join(', ')
      
      return `Contracts expiring soon: ${contractSummary}.`
    }

    // Wage bill queries
    if (lowerQuery.includes('wage') || lowerQuery.includes('salary') || lowerQuery.includes('pay') || lowerQuery.includes('cost')) {
      if (lowerQuery.includes('total') || lowerQuery.includes('bill') || lowerQuery.includes('budget')) {
        const wageBill = await ContractQueries.getClubWageBill()
        const weeklyBill = wageBill.totalWeekly ? `£${Number(wageBill.totalWeekly).toLocaleString()}` : 'Not calculated'
        const annualBill = wageBill.totalAnnual ? `£${Number(wageBill.totalAnnual).toLocaleString()}` : 'Not calculated'
        
        return `Manchester United's total wage bill: Weekly: ${weeklyBill}, Annual: ${annualBill}. This covers ${wageBill.playerCount} players with active contracts.`
      }

      if (lowerQuery.includes('highest') || lowerQuery.includes('top') || lowerQuery.includes('most expensive')) {
        const highestEarners = await ContractQueries.getHighestPaidPlayers(5)
        const earnersList = highestEarners.map((p: any) => {
          const weekly = p.base_weekly_wage ? `£${Number(p.base_weekly_wage).toLocaleString()}/week` : 'Wage not disclosed'
          return `${p.player_name} (${weekly})`
        }).join(', ')
        
        return `Top 5 highest earners at Manchester United: ${earnersList}.`
      }
    }

    // Specific player queries
    const playerNames = ['diogo dalot', 'dalot', 'andré onana', 'onana', 'kobbie mainoo', 'mainoo']
    const foundPlayer = playerNames.find(name => lowerQuery.includes(name))
    
    if (foundPlayer) {
      let searchName = foundPlayer
      // Normalize search terms
      if (foundPlayer.includes('dalot')) searchName = 'dalot'
      if (foundPlayer.includes('onana')) searchName = 'onana'
      if (foundPlayer.includes('mainoo')) searchName = 'mainoo'
      
      const playerDetails = await ContractQueries.searchPlayers(searchName)
      if (playerDetails.length === 0) {
        return `No contract details found for ${foundPlayer}. Available players: Diogo Dalot, André Onana, Kobbie Mainoo.`
      }

      const player = playerDetails[0]
      const startDate = new Date(player.start_date).toLocaleDateString('en-GB')
      const endDate = new Date(player.end_date).toLocaleDateString('en-GB')
      const weeklyWage = player.base_weekly_wage ? `£${Number(player.base_weekly_wage).toLocaleString()}` : 'Undisclosed'
      
      let response = `${player.player_name}: Contract from ${startDate} to ${endDate}, Weekly wage: ${weeklyWage}`
      
      // Add bonus information if available
      if (player.bonuses && typeof player.bonuses === 'object') {
        const bonuses = player.bonuses as any
        const bonusInfo = []
        if (bonuses.signing_bonus) bonusInfo.push(`Signing bonus: £${Number(bonuses.signing_bonus).toLocaleString()}`)
        if (bonuses.goal_bonus) bonusInfo.push(`Goal bonus: £${Number(bonuses.goal_bonus).toLocaleString()} per goal`)
        if (bonuses.clean_sheet_bonus) bonusInfo.push(`Clean sheet bonus: £${Number(bonuses.clean_sheet_bonus).toLocaleString()}`)
        if (bonuses.appearance_bonus) bonusInfo.push(`Appearance bonus: £${Number(bonuses.appearance_bonus).toLocaleString()} per game`)
        
        if (bonusInfo.length > 0) {
          response += `. Bonuses: ${bonusInfo.join(', ')}`
        }
      }
      
      return response + '.'
    }

    // General contract information
    if (lowerQuery.includes('how many') || lowerQuery.includes('total') || lowerQuery.includes('count')) {
      const allContracts = await ContractQueries.getAllActiveContracts()
      return `Manchester United currently has ${allContracts.length} players with active contracts.`
    }

    // Transfer and contract status
    if (lowerQuery.includes('transfer') || lowerQuery.includes('free agent') || lowerQuery.includes('available')) {
      return "For transfer and free agent information, I can help you with current contract statuses. Would you like to know which players have contracts expiring soon, or are you looking for specific player contract details?"
    }

    // Use the natural language processor as fallback
    const naturalResult = await ContractQueries.processNaturalLanguageQuery(query)
    if (naturalResult && Array.isArray(naturalResult) && naturalResult.length > 0) {
      if (typeof naturalResult[0] === 'object' && 'player_name' in naturalResult[0]) {
        // Format player results
        const playerSummary = naturalResult.map((p: any) => `${p.player_name} (${p.position})`).join(', ')
        return `Found ${naturalResult.length} result(s): ${playerSummary}.`
      }
    }

    // Default response with helpful suggestions
    return `I can help you with Manchester United contract information. Try asking about:
    
• "Which players are out of contract in 2025?"
• "What's the total wage bill?"
• "Show me Diogo Dalot's contract details"
• "Who are the highest earners?"
• "How many players have active contracts?"

Current database includes contracts for: Diogo Dalot, André Onana, and Kobbie Mainoo.`

  } catch (error) {
    console.error('Query processing error:', error)
    return `I encountered an error while processing your contract query. Please try asking about specific players, contract expiries, or wage information.`
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AARAN Contract API is running',
    available_endpoints: [
      'POST /api/aaran/contracts - Query contract information'
    ],
    sample_queries: [
      'Which players are out of contract this year?',
      'What is the total wage bill?',
      'Show me contract details for Diogo Dalot'
    ]
  })
} 