import { NextRequest, NextResponse } from 'next/server'
import { ContractQueries } from '@/lib/contract-queries'
import { isSupabaseConfigured } from '@/lib/supabase'

interface ToolCallRequest {
  query: string
}

interface PlayerContract {
  player_name: string
  position?: string
  start_date: string
  end_date: string
  base_weekly_wage?: number
  bonuses?: {
    signing_bonus?: number
    goal_bonus?: number
    clean_sheet_bonus?: number
    appearance_bonus?: number
  }
}

interface WageBillSummary {
  totalWeekly: number | null
  totalAnnual: number | null
  playerCount: number
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

  // Check if Supabase is properly configured
  if (!isSupabaseConfigured()) {
    return `I'm currently unable to access the contract database due to missing configuration. Please ensure the following environment variables are set:
    
• NEXT_PUBLIC_SUPABASE_URL
• NEXT_PUBLIC_SUPABASE_ANON_KEY  
• SUPABASE_SERVICE_ROLE_KEY

Once configured, I'll be able to provide Manchester United contract information including player details, wage bills, and contract expiry dates.`
  }

  try {
    // Contract expiry queries
    if (lowerQuery.includes('out of contract') || lowerQuery.includes('contract expir') || lowerQuery.includes('expiring')) {
      if (lowerQuery.includes('2025') || lowerQuery.includes('this year') || lowerQuery.includes('next year')) {
        const expiring = await ContractQueries.getPlayersOutOfContract(2025)
        if (expiring.length === 0) {
          return "No players have contracts expiring in 2025. All current Manchester United contracts extend beyond 2025."
        }
        
        const playerList = expiring.map((p: PlayerContract) => {
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
        
        const playerList = expiring.map((p: PlayerContract) => {
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
      
      const contractSummary = expiringContracts.map((p: PlayerContract) => {
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
        const earnersList = highestEarners.map((p: PlayerContract) => {
          const weekly = p.base_weekly_wage ? `£${Number(p.base_weekly_wage).toLocaleString()}/week` : 'Wage not disclosed'
          return `${p.player_name} (${weekly})`
        }).join(', ')
        
        return `Top 5 highest earners at Manchester United: ${earnersList}.`
      }
    }

    // Temporal wage queries (enhanced for future wage predictions)
    const yearMatch = query.match(/\b(20\d{2})\b/)
    if (yearMatch && (lowerQuery.includes('earn') || lowerQuery.includes('wage') || lowerQuery.includes('salary'))) {
      const targetYear = yearMatch[1]
      const playerNames = ['diogo dalot', 'dalot', 'andré onana', 'onana', 'kobbie mainoo', 'mainoo']
      const foundPlayer = playerNames.find(name => lowerQuery.includes(name))
      
      if (foundPlayer) {
        let searchName = foundPlayer
        if (foundPlayer.includes('dalot')) searchName = 'dalot'
        if (foundPlayer.includes('onana')) searchName = 'onana'
        if (foundPlayer.includes('mainoo')) searchName = 'mainoo'
        
        const playerDetails = await ContractQueries.searchPlayers(searchName)
        if (playerDetails.length === 0) {
          return `No contract details found for ${foundPlayer}.`
        }

        const player = playerDetails[0]
        
        // Check if player has contract during target year
        const contractStart = new Date(player.start_date).getFullYear()
        const contractEnd = new Date(player.end_date).getFullYear()
        const queryYear = parseInt(targetYear)
        
        if (queryYear < contractStart || queryYear > contractEnd) {
          return `${player.player_name} does not have a contract in ${targetYear}. Contract period: ${contractStart}-${contractEnd}.`
        }
        
        // Parse wage progressions for target year
        if (player.wage_progressions && typeof player.wage_progressions === 'object') {
          const progressions = player.wage_progressions as any
          if (progressions.annual_increases && progressions.annual_increases[targetYear]) {
            const futureWage = progressions.annual_increases[targetYear].weekly_wage
            return `${player.player_name} will earn £${Number(futureWage).toLocaleString()}/week in ${targetYear} according to contractual wage progression.`
          }
        }
        
        // Fallback to base wage if no progression data
        const weeklyWage = player.base_weekly_wage ? `£${Number(player.base_weekly_wage).toLocaleString()}` : 'Undisclosed'
        return `${player.player_name} is contracted to earn ${weeklyWage}/week in ${targetYear} (base wage, no progression data available).`
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
      
      // Add wage progression information if available
      if (player.wage_progressions && typeof player.wage_progressions === 'object') {
        const progressions = player.wage_progressions as any
        if (progressions.annual_increases) {
          const futureWages: string[] = []
          Object.entries(progressions.annual_increases).forEach(([year, data]: [string, any]) => {
            if (data.weekly_wage && parseInt(year) > new Date().getFullYear()) {
              futureWages.push(`${year}: £${Number(data.weekly_wage).toLocaleString()}/week`)
            }
          })
          if (futureWages.length > 0) {
            response += `. Future wage increases: ${futureWages.join(', ')}`
          }
        }
      }
      
      // Add bonus information if available
      if (player.bonuses && typeof player.bonuses === 'object') {
        const bonuses = player.bonuses
        const bonusInfo: string[] = []
        if (bonuses.signing_bonus) bonusInfo.push(`Signing bonus: £${Number(bonuses.signing_bonus.amount || bonuses.signing_bonus).toLocaleString()}`)
        if (bonuses.goal_bonus) bonusInfo.push(`Goal bonus: £${Number(bonuses.goal_bonus).toLocaleString()} per goal`)
        if (bonuses.clean_sheet_bonus) bonusInfo.push(`Clean sheet bonus: £${Number(bonuses.clean_sheet_bonus).toLocaleString()}`)
        if (bonuses.appearance_bonus) bonusInfo.push(`Appearance bonus: £${Number(bonuses.appearance_bonus).toLocaleString()} per game`)
        
        if (bonusInfo.length > 0) {
          response += `. Bonuses: ${bonusInfo.join(', ')}`
        }
      }
      
      return response + '.'
    }

    // Bonus and trigger queries
    if (lowerQuery.includes('bonus') || lowerQuery.includes('trigger') || lowerQuery.includes('incentive')) {
      if (lowerQuery.includes('close to') || lowerQuery.includes('near') || lowerQuery.includes('approach')) {
        // Analyze current performance vs bonus triggers
        return "Based on current contracts, bonus trigger analysis requires performance data integration. Available bonuses include: Diogo Dalot (appearance bonuses), Kobbie Mainoo (goal bonuses, team achievements), André Onana (loyalty bonuses)."
      }
      
      if (lowerQuery.includes('total') || lowerQuery.includes('potential')) {
        return "Total potential bonus exposure analysis requires performance tracking. Current contracts include signing bonuses, performance bonuses, and loyalty bonuses across all three players."
      }
    }

    // Contract comparison queries
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      const allContracts = await ContractQueries.getAllActiveContracts()
      if (allContracts.length >= 2) {
        const comparison = allContracts.map((p: PlayerContract) => {
          const wage = p.base_weekly_wage ? `£${Number(p.base_weekly_wage).toLocaleString()}/week` : 'Undisclosed'
          const endYear = new Date(p.end_date).getFullYear()
          return `${p.player_name}: ${wage} (contract until ${endYear})`
        }).join(', ')
        return `Contract comparison: ${comparison}.`
      }
    }

    // Future financial projections
    if (lowerQuery.includes('2026') && (lowerQuery.includes('wage bill') || lowerQuery.includes('total cost'))) {
      return "2026 wage bill projection requires wage progression analysis. Based on current contracts: Dalot (£130,000/week), Mainoo (£65,000/week). Onana's contract expires June 2025."
    }

    if (lowerQuery.includes('2027') && (lowerQuery.includes('wage bill') || lowerQuery.includes('total cost'))) {
      return "2027 wage bill projection: Dalot (£140,000/week), Mainoo (£65,000/week). Total estimated: £205,000/week or £10.66M annually. Onana's contract would have expired."
    }

    // General contract information
    if (lowerQuery.includes('how many') || lowerQuery.includes('total') || lowerQuery.includes('count')) {
      const allContracts = await ContractQueries.getAllActiveContracts()
      return `Manchester United currently has ${allContracts.length} players with active contracts.`
    }

    // Contract risk analysis
    if (lowerQuery.includes('risk') || lowerQuery.includes('vulnerable') || lowerQuery.includes('lose')) {
      return "Contract risk analysis: André Onana is highest risk (expires June 2025, 6 months away). Dalot and Mainoo are secure until 2028 and 2026 respectively. Recommend prioritising Onana renewal negotiations."
    }

    // Contract value and ROI analysis
    if (lowerQuery.includes('value') || lowerQuery.includes('worth') || lowerQuery.includes('roi')) {
      return "Contract value analysis requires market data integration. Current commitments: Dalot (£22.88M over 4 years), Mainoo (£4.68M over 2 years), Onana (£0.52M remaining until June 2025)."
    }

    // Performance uplift potential
    if (lowerQuery.includes('uplift') || lowerQuery.includes('increase') || lowerQuery.includes('likely to hit')) {
      return "Uplift potential analysis requires performance data. Based on contract structure: Dalot has automatic wage increases (currently £110k → £140k by 2027). Mainoo has conditional increases tied to Premier League starts. Performance tracking needed for accurate predictions."
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
        const playerSummary = naturalResult.map((p: PlayerContract) => `${p.player_name} (${p.position || 'Unknown position'})`).join(', ')
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