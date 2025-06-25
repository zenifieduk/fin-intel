import {
  PlayerStatsData,
  PlayerGameStat,
  SquadData,
  Player,
  PlayerPerformanceSummary,
  FinancialImpact,
  LeagueTableEntry
} from '@/types/nico-dashboard';

/**
 * Analyzes individual player performance from game statistics
 */
export const analyzePlayerPerformance = (
  stats: PlayerStatsData,
  playerId: number
): PlayerPerformanceSummary | null => {
  const playerStats = stats.player_game_stats.filter(
    (stat) => stat.player_id === playerId
  );

  if (playerStats.length === 0) return null;

  const firstStat = playerStats[0];
  
  return {
    player_id: playerId,
    name: firstStat.player_name,
    position: '', // Will be filled from squad data
    totalMinutes: playerStats.reduce((sum, game) => sum + game.minutes_played, 0),
    totalGoals: playerStats.reduce((sum, game) => sum + game.goals_scored, 0),
    totalAssists: playerStats.reduce((sum, game) => sum + game.assists, 0),
    appearances: playerStats.filter((game) => game.minutes_played > 0).length,
    injuryIncidents: playerStats.filter((game) => game.injury_occurred).length,
  };
};

/**
 * Calculates financial impact analysis combining squad and performance data
 */
export const calculateFinancialImpact = (
  squad: SquadData,
  performanceData: { [key: number]: PlayerPerformanceSummary }
): FinancialImpact[] => {
  return squad.players.map((player) => {
    const performance = performanceData[player.player_id];
    const goalValue = (performance?.totalGoals || 0) * 2000000; // £2M per goal
    const assistValue = (performance?.totalAssists || 0) * 1000000; // £1M per assist
    
    return {
      player_id: player.player_id,
      name: player.name,
      market_value_millions: player.market_value_millions,
      performanceValue: goalValue + assistValue,
      injuryRisk: player.injury_proneness * player.market_value_millions,
    };
  });
};

/**
 * Processes all player performance data into summaries
 */
export const processAllPlayerPerformance = (
  stats: PlayerStatsData,
  squad: SquadData
): PlayerPerformanceSummary[] => {
  const summaries: PlayerPerformanceSummary[] = [];
  
  squad.players.forEach((player) => {
    const performance = analyzePlayerPerformance(stats, player.player_id);
    if (performance) {
      // Add position from squad data
      performance.position = player.position;
      summaries.push(performance);
    }
  });
  
  return summaries;
};

/**
 * Calculates average goals per game for a player
 */
export const calculateGoalsPerGame = (summary: PlayerPerformanceSummary): number => {
  if (summary.appearances === 0) return 0;
  return summary.totalGoals / summary.appearances;
};

/**
 * Calculates average assists per game for a player
 */
export const calculateAssistsPerGame = (summary: PlayerPerformanceSummary): number => {
  if (summary.appearances === 0) return 0;
  return summary.totalAssists / summary.appearances;
};

/**
 * Gets players by position from squad data
 */
export const getPlayersByPosition = (
  squad: SquadData,
  position: string
): Player[] => {
  return squad.players.filter((player) => 
    player.position.includes(position)
  );
};

/**
 * Calculates team totals from player performance summaries
 */
export const calculateTeamTotals = (summaries: PlayerPerformanceSummary[]) => {
  return {
    totalGoals: summaries.reduce((sum, p) => sum + p.totalGoals, 0),
    totalAssists: summaries.reduce((sum, p) => sum + p.totalAssists, 0),
    totalMinutes: summaries.reduce((sum, p) => sum + p.totalMinutes, 0),
    totalAppearances: summaries.reduce((sum, p) => sum + p.appearances, 0),
    totalInjuries: summaries.reduce((sum, p) => sum + p.injuryIncidents, 0),
  };
};

/**
 * Formats player name for display
 */
export const formatPlayerName = (name: string): string => {
  // Handle special characters and formatting
  return name.replace(/\\u([0-9a-f]{4})/g, (match, code) => 
    String.fromCharCode(parseInt(code, 16))
  );
};

/**
 * Validates JSON data structure
 */
export const validateDataStructure = {
  fixtures: (data: any): boolean => {
    return data?.fixtures && Array.isArray(data.fixtures) && data.fixtures.length > 0;
  },
  squad: (data: any): boolean => {
    return data?.players && Array.isArray(data.players) && data.squad_size > 0;
  },
  stats: (data: any): boolean => {
    return data?.player_game_stats && Array.isArray(data.player_game_stats);
  },
  analysis: (data: any): boolean => {
    return data?.team_projections && data?.top_scorers_projected;
  },
}; 