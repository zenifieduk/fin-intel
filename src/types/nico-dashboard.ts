// NICO Dashboard TypeScript Interfaces
// Manchester United season forecasting dashboard data types

export interface Fixture {
  matchday: number;
  date: string;
  opponent: string;
  venue: 'H' | 'A';
  home_score: number | null;
  away_score: number | null;
}

export interface FixturesData {
  team: string;
  season: string;
  competition: string;
  fixtures: Fixture[];
}

export interface Player {
  player_id: number;
  name: string;
  jersey_number: number;
  position: string;
  age: number;
  nationality: string;
  market_value_millions: number;
  contract_expires: string;
  injury_proneness: number;
  fitness_rating: number;
}

export interface SquadData {
  squad_size: number;
  players: Player[];
}

export interface PlayerGameStat {
  player_id: number;
  player_name: string;
  matchday: number;
  opponent: string;
  venue: 'H' | 'A';
  minutes_played: number;
  goals_scored: number;
  assists: number;
  clean_sheet: number;
  yellow_cards: number;
  red_cards: number;
  injury_occurred: boolean;
}

export interface PlayerStatsData {
  total_records: number;
  player_game_stats: PlayerGameStat[];
}

export interface TopPerformer {
  player_id: number;
  player_name: string;
  projected_total: number;
}

export interface TeamProjections {
  total_goals_projected: number;
  total_assists_projected: number;
  clean_sheets_projected: number;
  injury_incidents: number;
}

export interface SeasonAnalysisData {
  team_projections: TeamProjections;
  top_scorers_projected: TopPerformer[];
  top_assisters_projected: TopPerformer[];
}

// Aggregated data interfaces for component use
export interface PlayerPerformanceSummary {
  player_id: number;
  name: string;
  position: string;
  totalMinutes: number;
  totalGoals: number;
  totalAssists: number;
  appearances: number;
  injuryIncidents: number;
  averageRating?: number;
}

export interface LeagueTableEntry {
  position: number;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
}

export interface FinancialImpact {
  player_id: number;
  name: string;
  market_value_millions: number;
  performanceValue: number;
  injuryRisk: number;
}

// Hook return types
export interface UseJsonDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
} 