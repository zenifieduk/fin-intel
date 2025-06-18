import { ContractQueries } from './contract-queries'

// OpenAI Function Calling Tools for AARAN
export const contractTools = [
  {
    type: "function" as const,
    function: {
      name: "query_player_contracts",
      description: "Query the football player contract database to answer questions about contracts, wages, expiry dates, bonuses, etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Natural language query about player contracts (e.g., 'Which players are out of contract this year?', 'What is the total wage bill?', 'Show me the highest paid players')"
          },
          action: {
            type: "string",
            enum: ["expiring-2025", "expiring-2026", "wage-bill", "highest-paid", "all-contracts", "natural-language"],
            description: "Specific action to perform, or 'natural-language' to process the query text"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_player_details",
      description: "Get detailed contract information for a specific player",
      parameters: {
        type: "object",
        properties: {
          playerName: {
            type: "string",
            description: "Name of the player to search for (e.g., 'Onana', 'Dalot', 'Mainoo')"
          }
        },
        required: ["playerName"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_club_wage_analysis",
      description: "Get comprehensive wage bill analysis for Manchester United",
      parameters: {
        type: "object",
        properties: {
          clubName: {
            type: "string",
            default: "Manchester United",
            description: "Name of the club to analyse"
          }
        }
      }
    }
  }
]

// Function implementations for AARAN
export const contractFunctions = {
  query_player_contracts: async (args: { query: string; action?: string }) => {
    try {
      if (args.action && args.action !== 'natural-language') {
        // Use specific action
        const response = await fetch(`/api/contracts/query?action=${args.action}`)
        return await response.json()
      } else {
        // Use natural language processing
        const results = await ContractQueries.processNaturalLanguageQuery(args.query)
        return {
          success: true,
          query: args.query,
          results: results,
          count: Array.isArray(results) ? results.length : (results?.playerCount || 1),
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to query contracts: ${error}`,
        results: []
      }
    }
  },

  get_player_details: async (args: { playerName: string }) => {
    try {
      const results = await ContractQueries.searchPlayers(args.playerName)
      return {
        success: true,
        player: args.playerName,
        results: results,
        count: results.length,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get player details: ${error}`,
        results: []
      }
    }
  },

  get_club_wage_analysis: async (args: { clubName?: string }) => {
    try {
      const clubName = args.clubName || 'Manchester United'
      const wageBill = await ContractQueries.getClubWageBill(clubName)
      const highestPaid = await ContractQueries.getHighestPaidPlayers(5)
      const expiring2025 = await ContractQueries.getPlayersOutOfContract(2025)
      
      return {
        success: true,
        club: clubName,
        analysis: {
          wageBill,
          topEarners: highestPaid,
          contractsExpiring2025: expiring2025
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get wage analysis: ${error}`,
        results: []
      }
    }
  }
}

// Helper function to format contract data for AARAN responses
export function formatContractResponse(data: any[], query: string): string {
  if (!data || data.length === 0) {
    return `I couldn't find any results for "${query}".`
  }

  // Handle different types of responses
  if (query.toLowerCase().includes('out of contract') || query.toLowerCase().includes('expiring')) {
    if (data.length === 1) {
      const player = data[0]
      return `${player.player_name} (${player.position}) is out of contract on ${player.end_date}. Current wage: £${player.base_weekly_wage?.toLocaleString()}/week.`
    } else {
      const playerList = data.map(p => `${p.player_name} (${p.end_date})`).join(', ')
      return `${data.length} players have contracts expiring: ${playerList}.`
    }
  }

  if (query.toLowerCase().includes('wage bill')) {
    const wageBill = data[0]
    return `Manchester United's total wage bill is £${wageBill.totalWeekly?.toLocaleString()}/week (£${wageBill.totalAnnual?.toLocaleString()}/year) across ${wageBill.playerCount} players.`
  }

  if (query.toLowerCase().includes('highest paid')) {
    const topPlayer = data[0]
    const playerList = data.slice(0, 3).map(p => `${p.player_name} (£${p.base_weekly_wage?.toLocaleString()}/week)`).join(', ')
    return `Top earners: ${playerList}.`
  }

  // Default response
  if (data.length === 1) {
    const player = data[0]
    return `${player.player_name} (${player.position}) - Contract: ${player.start_date} to ${player.end_date}, Wage: £${player.base_weekly_wage?.toLocaleString()}/week.`
  }

  return `Found ${data.length} results for "${query}".`
} 