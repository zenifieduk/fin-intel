import { supabase, isSupabaseConfigured } from './supabase'

export class ContractQueries {
  
  // Helper method to check configuration before database operations
  private static checkConfiguration() {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not properly configured - using fallback response')
      return false
    }
    return true
  }
  
  // Players out of contract in a specific year
  static async getPlayersOutOfContract(year: number = new Date().getFullYear()) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase.rpc('get_players_expiring', { 
      target_year: year 
    })
    
    if (error) {
      console.error('Error fetching expiring contracts:', error)
      return []
    }
    
    return data
  }

  // Players with contracts expiring soon (within days)
  static async getContractsExpiringSoon(days: number = 365) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('*')
      .gte('end_date', new Date().toISOString())
      .lte('end_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
      .order('end_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching expiring contracts:', error)
      return []
    }
    
    return data
  }

  // Get total wage bill for a club
  static async getClubWageBill(clubName: string = 'Manchester United') {
    if (!this.checkConfiguration()) {
      return { totalWeekly: 0, totalAnnual: 0, playerCount: 0 }
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('base_weekly_wage')
      .eq('club_name', clubName)
    
    if (error) {
      console.error('Error fetching wage bill:', error)
      return { totalWeekly: 0, totalAnnual: 0, playerCount: 0 }
    }
    
    const totalWeekly = data.reduce((sum, contract) => sum + contract.base_weekly_wage, 0)
    
    return {
      totalWeekly,
      totalAnnual: totalWeekly * 52,
      playerCount: data.length,
      club: clubName
    }
  }

  // Get players by position
  static async getPlayersByPosition(position: string) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('*')
      .eq('position', position)
      .order('base_weekly_wage', { ascending: false })
    
    if (error) {
      console.error('Error fetching players by position:', error)
      return []
    }
    
    return data
  }

  // Search players by name
  static async searchPlayers(searchTerm: string) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('*')
      .ilike('player_name', `%${searchTerm}%`)
    
    if (error) {
      console.error('Error searching players:', error)
      return []
    }
    
    return data
  }

  // Get highest paid players
  static async getHighestPaidPlayers(limit: number = 10) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('*')
      .order('base_weekly_wage', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching highest paid players:', error)
      return []
    }
    
    return data
  }

  // Get players with specific bonus types
  static async getPlayersWithBonuses(bonusType?: string) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('*')
      .not('bonuses', 'eq', '{}')
    
    if (error) {
      console.error('Error fetching players with bonuses:', error)
      return []
    }
    
    return data
  }

  // Natural language query processor
  static async processNaturalLanguageQuery(query: string) {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const lowerQuery = query.toLowerCase()
    
    // Contract expiry queries
    if (lowerQuery.includes('out of contract') || lowerQuery.includes('expiring')) {
      if (lowerQuery.includes('this year') || lowerQuery.includes('2025')) {
        return await this.getPlayersOutOfContract(2025)
      }
      if (lowerQuery.includes('next year') || lowerQuery.includes('2026')) {
        return await this.getPlayersOutOfContract(2026)
      }
      return await this.getContractsExpiringSoon()
    }
    
    // Wage queries
    if (lowerQuery.includes('wage bill') || lowerQuery.includes('total cost')) {
      return await this.getClubWageBill()
    }
    
    // Position queries
    if (lowerQuery.includes('goalkeeper') || lowerQuery.includes('keeper')) {
      return await this.getPlayersByPosition('Goalkeeper')
    }
    if (lowerQuery.includes('defender') || lowerQuery.includes('defence')) {
      return await this.getPlayersByPosition('Defender')
    }
    if (lowerQuery.includes('midfielder') || lowerQuery.includes('midfield')) {
      return await this.getPlayersByPosition('Midfielder')
    }
    if (lowerQuery.includes('forward') || lowerQuery.includes('striker')) {
      return await this.getPlayersByPosition('Forward')
    }
    
    // Highest paid
    if (lowerQuery.includes('highest paid') || lowerQuery.includes('best paid')) {
      return await this.getHighestPaidPlayers()
    }
    
    // Player search
    const playerNames = ['dalot', 'onana', 'mainoo']
    for (const name of playerNames) {
      if (lowerQuery.includes(name)) {
        return await this.searchPlayers(name)
      }
    }
    
    // Default: return all active contracts
    return await this.getAllActiveContracts()
  }

  // Get all active contracts
  static async getAllActiveContracts() {
    if (!this.checkConfiguration()) {
      return []
    }
    
    const { data, error } = await supabase
      .from('active_contracts_view')
      .select('*')
      .order('base_weekly_wage', { ascending: false })
    
    if (error) {
      console.error('Error fetching all contracts:', error)
      return []
    }
    
    return data
  }
} 