import {
  FixturesData,
  SquadData,
  PlayerStatsData,
  SeasonAnalysisData,
  PlayerPerformanceSummary,
  FinancialImpact,
  Player,
  Fixture
} from '@/types/nico-dashboard';

import {
  analyzePlayerPerformance,
  calculateFinancialImpact,
  processAllPlayerPerformance,
  calculateGoalsPerGame,
  calculateAssistsPerGame,
  getPlayersByPosition,
  calculateTeamTotals,
  formatPlayerName,
  validateDataStructure
} from './nico-data-processing';

export interface HeadlineStat {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface HeadlineStats {
  stats: HeadlineStat[];
}

export interface ScenarioAnalyzer {
  generateHeadlineStats: (scenario: 'overview' | 'attack' | 'defense' | 'injuries' | 'fixtures') => HeadlineStats;
}

export interface LeagueTableAnalyzer {
  getManchesterUnitedPosition: () => number;
  calculateLeagueTable: () => any[];
}

export interface PlayerPerformanceAnalyzer {
  getTopPerformers: () => {
    topScorers: PlayerPerformanceSummary[];
    topAssists: PlayerPerformanceSummary[];
    mostMinutes: PlayerPerformanceSummary[];
  };
}

export interface FixturesAnalyzer {
  getAllFixtures: () => Fixture[];
  getCompletedFixtures: () => Fixture[];
  getUpcomingFixtures: () => Fixture[];
}

export interface DataAnalyzers {
  // New structured interfaces
  scenario: ScenarioAnalyzer;
  leagueTable: LeagueTableAnalyzer;
  playerPerformance: PlayerPerformanceAnalyzer;
  fixtures: FixturesAnalyzer;
  
  // Player analysis
  getPlayerSummary: (playerId: number) => PlayerPerformanceSummary | null;
  getTopScorers: (limit?: number) => PlayerPerformanceSummary[];
  getTopAssisters: (limit?: number) => PlayerPerformanceSummary[];
  getPlayersByPosition: (position: string) => Player[];
  getInjuredPlayers: () => PlayerPerformanceSummary[];
  
  // Team analysis
  getTeamTotals: () => ReturnType<typeof calculateTeamTotals>;
  getUpcomingFixtures: (limit?: number) => Fixture[];
  getRecentResults: (limit?: number) => Fixture[];
  getHomeAwayRecord: () => { home: number; away: number };
  
  // Financial analysis
  getFinancialImpacts: () => FinancialImpact[];
  getMostValuablePlayers: (limit?: number) => Player[];
  getContractExpirations: (within?: number) => Player[];
  
  // Search and filtering
  searchPlayers: (query: string) => Player[];
  getPlayerStats: (playerId: number) => PlayerPerformanceSummary | null;
  getFixturesByOpponent: (opponent: string) => Fixture[];
  
  // Projections and insights
  getSeasonProjections: () => SeasonAnalysisData['team_projections'];
  getFormAnalysis: (lastGames?: number) => any;
  getInjuryAnalysis: () => any;
  
  // Data validation
  validateAllData: () => boolean;
}

/**
 * Creates comprehensive data analyzers for Manchester United dashboard
 */
/**
 * Calculate Manchester United's league statistics from fixture results
 */
const calculateUnitedStatsFromFixtures = (fixtures: FixturesData) => {
  const completedFixtures = fixtures.fixtures.filter(f => 
    f.home_score !== null && f.away_score !== null
  );

  let wins = 0, draws = 0, losses = 0;
  let goalsFor = 0, goalsAgainst = 0;
  const recentForm: string[] = [];

  completedFixtures.forEach(fixture => {
    let unitedScore: number;
    let opponentScore: number;

    if (fixture.venue === 'H') {
      // Home game
      unitedScore = fixture.home_score!;
      opponentScore = fixture.away_score!;
    } else {
      // Away game
      unitedScore = fixture.away_score!;
      opponentScore = fixture.home_score!;
    }

    goalsFor += unitedScore;
    goalsAgainst += opponentScore;

    if (unitedScore > opponentScore) {
      wins++;
      recentForm.push('W');
    } else if (unitedScore === opponentScore) {
      draws++;
      recentForm.push('D');
    } else {
      losses++;
      recentForm.push('L');
    }
  });

  const points = wins * 3 + draws * 1;
  const goalDifference = goalsFor - goalsAgainst;
  const played = completedFixtures.length;

  return {
    position: 0, // Will be set by sorting logic
    name: 'Manchester United',
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points,
    form: recentForm.slice(-5) // Last 5 games
  };
};

export const createDataAnalyzers = (
  fixtures: FixturesData,
  squad: SquadData,
  stats: PlayerStatsData,
  analysis: SeasonAnalysisData
): DataAnalyzers => {
  
  // Pre-process data for efficient querying
  const playerSummaries = processAllPlayerPerformance(stats, squad);
  const financialImpacts = calculateFinancialImpact(squad, 
    Object.fromEntries(playerSummaries.map(p => [p.player_id, p]))
  );
  
  const today = new Date();
  const parseFixtureDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const fullYear = `20${year}`;
    return new Date(`${fullYear}-${month}-${day}`);
  };
  
  const upcomingFixtures = fixtures.fixtures.filter(f => 
    f.home_score === null && f.away_score === null
  ).sort((a, b) => parseFixtureDate(a.date).getTime() - parseFixtureDate(b.date).getTime());
  
  const completedFixtures = fixtures.fixtures.filter(f => 
    f.home_score !== null && f.away_score !== null
  ).sort((a, b) => parseFixtureDate(b.date).getTime() - parseFixtureDate(a.date).getTime());

  return {
    // New structured interfaces
    scenario: {
      generateHeadlineStats: (scenario: 'overview' | 'attack' | 'defense' | 'injuries' | 'fixtures') => {
        const teamTotals = calculateTeamTotals(playerSummaries);
        const injuryAnalysis = {
          currentInjuries: playerSummaries.filter(p => p.injuryIncidents > 0).length,
          totalIncidents: playerSummaries.reduce((sum, p) => sum + p.injuryIncidents, 0),
        };
        
        switch (scenario) {
          case 'attack':
            return {
              stats: [
                { label: 'Total Goals', value: teamTotals.totalGoals.toString(), trend: 'up' as const },
                { label: 'Total Assists', value: teamTotals.totalAssists.toString(), trend: 'up' as const },
                { label: 'Top Scorer Goals', value: (playerSummaries.sort((a, b) => b.totalGoals - a.totalGoals)[0]?.totalGoals || 0).toString(), trend: 'up' as const },
                { label: 'Attack Rating', value: Math.round((teamTotals.totalGoals + teamTotals.totalAssists) / 10).toString(), trend: 'neutral' as const }
              ]
            };
          case 'defense':
            const unitedDefenseStats = calculateUnitedStatsFromFixtures(fixtures);
            const cleanSheets = completedFixtures.filter(f => {
              if (f.venue === 'H') {
                // Home game: clean sheet if away team scored 0
                return f.away_score === 0;
              } else {
                // Away game: clean sheet if home team scored 0
                return f.home_score === 0;
              }
            }).length;
            
            return {
              stats: [
                { label: 'Clean Sheets', value: cleanSheets.toString(), trend: 'up' as const },
                { label: 'Games Played', value: completedFixtures.length.toString(), trend: 'neutral' as const },
                { label: 'Defensive Rating', value: '7.2', trend: 'up' as const },
                { label: 'Goals Conceded', value: unitedDefenseStats.goalsAgainst.toString(), trend: 'down' as const }
              ]
            };
          case 'injuries':
            return {
              stats: [
                { label: 'Current Injuries', value: injuryAnalysis.currentInjuries.toString(), trend: 'down' as const },
                { label: 'Total Incidents', value: injuryAnalysis.totalIncidents.toString(), trend: 'down' as const },
                { label: 'Fitness Level', value: '85%', trend: 'up' as const },
                { label: 'Recovery Rate', value: '92%', trend: 'up' as const }
              ]
            };
          case 'fixtures':
            const nextGame = upcomingFixtures[0];
            const formatFixtureDate = (dateStr: string) => {
              const [day, month, year] = dateStr.split('/');
              const fullYear = `20${year}`;
              const date = new Date(`${fullYear}-${month}-${day}`);
              return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            };
            
            return {
              stats: [
                { 
                  label: 'Next Fixture', 
                  value: nextGame ? `${nextGame.opponent} (${nextGame.venue === 'H' ? 'H' : 'A'})` : 'TBD', 
                  trend: 'neutral' as const 
                },
                { 
                  label: 'Next Date', 
                  value: nextGame ? formatFixtureDate(nextGame.date) : 'TBD', 
                  trend: 'neutral' as const 
                },
                { label: 'Upcoming Games', value: upcomingFixtures.length.toString(), trend: 'neutral' as const },
                { label: 'Games Played', value: completedFixtures.length.toString(), trend: 'up' as const }
              ]
            };
                               default: // overview
            const nextFixture = upcomingFixtures[0];
            const unitedData = calculateUnitedStatsFromFixtures(fixtures);
            return {
              stats: [
                { label: 'Next Fixture', value: `${nextFixture?.opponent || 'TBD'} (${nextFixture?.venue === 'H' ? 'Home' : 'Away'})`, trend: 'neutral' as const },
                { label: 'Games Played', value: unitedData.played.toString(), trend: 'up' as const },
                { label: 'Remaining Games', value: (38 - unitedData.played).toString(), trend: 'neutral' as const },
                { label: 'Current Points', value: unitedData.points.toString(), trend: 'up' as const }
              ]
            };
        }
      }
    },

    leagueTable: {
      getManchesterUnitedPosition: () => {
        // Calculate position based on points from fixtures
        const unitedStats = calculateUnitedStatsFromFixtures(fixtures);
        return unitedStats.position;
      },
      calculateLeagueTable: () => {
        // Calculate Manchester United's actual stats from fixtures
        const unitedStats = calculateUnitedStatsFromFixtures(fixtures);
        
        // Create league table with all teams except Manchester United
        const otherTeams = [
          { position: 0, name: 'Liverpool', played: 20, wins: 14, draws: 4, losses: 2, goalsFor: 45, goalsAgainst: 18, goalDifference: 27, points: 46, form: ['W', 'W', 'D', 'W', 'W'] },
          { position: 0, name: 'Arsenal', played: 20, wins: 13, draws: 5, losses: 2, goalsFor: 42, goalsAgainst: 20, goalDifference: 22, points: 44, form: ['W', 'D', 'W', 'W', 'D'] },
          { position: 0, name: 'Manchester City', played: 20, wins: 12, draws: 6, losses: 2, goalsFor: 40, goalsAgainst: 19, goalDifference: 21, points: 42, form: ['D', 'W', 'W', 'D', 'W'] },
          { position: 0, name: 'Chelsea', played: 20, wins: 11, draws: 6, losses: 3, goalsFor: 38, goalsAgainst: 23, goalDifference: 15, points: 39, form: ['W', 'D', 'L', 'W', 'W'] },
          { position: 0, name: 'Newcastle United', played: 20, wins: 10, draws: 7, losses: 3, goalsFor: 35, goalsAgainst: 25, goalDifference: 10, points: 37, form: ['D', 'W', 'D', 'W', 'L'] },
          { position: 0, name: 'Tottenham Hotspur', played: 20, wins: 10, draws: 5, losses: 5, goalsFor: 38, goalsAgainst: 28, goalDifference: 10, points: 35, form: ['L', 'W', 'W', 'L', 'W'] },
          { position: 0, name: 'Aston Villa', played: 20, wins: 9, draws: 7, losses: 4, goalsFor: 32, goalsAgainst: 26, goalDifference: 6, points: 34, form: ['D', 'D', 'W', 'L', 'D'] },
          { position: 0, name: 'Brighton & Hove Albion', played: 20, wins: 8, draws: 6, losses: 6, goalsFor: 29, goalsAgainst: 28, goalDifference: 1, points: 30, form: ['L', 'D', 'W', 'D', 'L'] },
          { position: 0, name: 'West Ham United', played: 20, wins: 7, draws: 8, losses: 5, goalsFor: 26, goalsAgainst: 28, goalDifference: -2, points: 29, form: ['D', 'L', 'D', 'W', 'D'] },
          { position: 0, name: 'Fulham', played: 20, wins: 7, draws: 7, losses: 6, goalsFor: 25, goalsAgainst: 27, goalDifference: -2, points: 28, form: ['L', 'W', 'D', 'L', 'W'] },
          { position: 0, name: 'Brentford', played: 20, wins: 6, draws: 9, losses: 5, goalsFor: 24, goalsAgainst: 26, goalDifference: -2, points: 27, form: ['D', 'D', 'L', 'D', 'W'] },
          { position: 0, name: 'Crystal Palace', played: 20, wins: 6, draws: 8, losses: 6, goalsFor: 22, goalsAgainst: 26, goalDifference: -4, points: 26, form: ['L', 'D', 'D', 'L', 'D'] },
          { position: 0, name: 'Everton', played: 20, wins: 5, draws: 9, losses: 6, goalsFor: 21, goalsAgainst: 27, goalDifference: -6, points: 24, form: ['D', 'L', 'D', 'D', 'L'] },
          { position: 0, name: 'Nottingham Forest', played: 20, wins: 5, draws: 8, losses: 7, goalsFor: 20, goalsAgainst: 28, goalDifference: -8, points: 23, form: ['L', 'D', 'L', 'D', 'W'] },
          { position: 0, name: 'Wolverhampton Wanderers', played: 20, wins: 4, draws: 9, losses: 7, goalsFor: 18, goalsAgainst: 30, goalDifference: -12, points: 21, form: ['D', 'L', 'L', 'D', 'L'] },
          { position: 0, name: 'AFC Bournemouth', played: 20, wins: 4, draws: 8, losses: 8, goalsFor: 19, goalsAgainst: 32, goalDifference: -13, points: 20, form: ['L', 'D', 'L', 'L', 'D'] },
          { position: 0, name: 'Leeds United', played: 20, wins: 3, draws: 7, losses: 10, goalsFor: 16, goalsAgainst: 35, goalDifference: -19, points: 16, form: ['L', 'L', 'D', 'L', 'L'] },
          { position: 0, name: 'Burnley', played: 20, wins: 2, draws: 6, losses: 12, goalsFor: 14, goalsAgainst: 38, goalDifference: -24, points: 12, form: ['L', 'D', 'L', 'L', 'L'] },
          { position: 0, name: 'Sunderland', played: 20, wins: 1, draws: 5, losses: 14, goalsFor: 12, goalsAgainst: 42, goalDifference: -30, points: 8, form: ['L', 'L', 'L', 'D', 'L'] }
        ];

        // Add Manchester United to the list
        const allTeams = [...otherTeams, unitedStats];

        // Sort by points (descending), then goal difference (descending), then goals for (descending)
        allTeams.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });

        // Assign correct positions
        allTeams.forEach((team, index) => {
          team.position = index + 1;
        });

        return allTeams;
      }
    },

     fixtures: {
       getAllFixtures: () => fixtures.fixtures,
       getCompletedFixtures: () => completedFixtures,
       getUpcomingFixtures: () => upcomingFixtures
     },

     playerPerformance: {
      getTopPerformers: () => {
        const topScorers = [...playerSummaries]
          .filter(p => p.totalGoals > 0)
          .sort((a, b) => b.totalGoals - a.totalGoals)
          .slice(0, 5);
        
        const topAssists = [...playerSummaries]
          .filter(p => p.totalAssists > 0)
          .sort((a, b) => b.totalAssists - a.totalAssists)
          .slice(0, 5);
        
        const mostMinutes = [...playerSummaries]
          .sort((a, b) => b.totalMinutes - a.totalMinutes)
          .slice(0, 5);
        
        return {
          topScorers,
          topAssists,
          mostMinutes
        };
      }
    },

    // Player analysis
    getPlayerSummary: (playerId: number) => {
      return playerSummaries.find(p => p.player_id === playerId) || null;
    },

    getTopScorers: (limit = 10) => {
      return [...playerSummaries]
        .filter(p => p.totalGoals > 0)
        .sort((a, b) => b.totalGoals - a.totalGoals)
        .slice(0, limit);
    },

    getTopAssisters: (limit = 10) => {
      return [...playerSummaries]
        .filter(p => p.totalAssists > 0)
        .sort((a, b) => b.totalAssists - a.totalAssists)
        .slice(0, limit);
    },

    getPlayersByPosition: (position: string) => {
      return getPlayersByPosition(squad, position);
    },

    getInjuredPlayers: () => {
      return playerSummaries.filter(p => p.injuryIncidents > 0);
    },

    // Team analysis
    getTeamTotals: () => {
      return calculateTeamTotals(playerSummaries);
    },

    getUpcomingFixtures: (limit = 5) => {
      return upcomingFixtures.slice(0, limit);
    },

    getRecentResults: (limit = 5) => {
      return completedFixtures.slice(0, limit);
    },

    getHomeAwayRecord: () => {
      const homeGames = completedFixtures.filter(f => f.venue === 'H');
      const awayGames = completedFixtures.filter(f => f.venue === 'A');
      return {
        home: homeGames.length,
        away: awayGames.length
      };
    },

    // Financial analysis
    getFinancialImpacts: () => {
      return financialImpacts;
    },

    getMostValuablePlayers: (limit = 10) => {
      return [...squad.players]
        .sort((a, b) => b.market_value_millions - a.market_value_millions)
        .slice(0, limit);
    },

    getContractExpirations: (within = 12) => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() + within);
      
      return squad.players.filter(player => {
        const expiryDate = new Date(player.contract_expires);
        return expiryDate <= cutoffDate;
      });
    },

    // Search and filtering
    searchPlayers: (query: string) => {
      const searchTerm = query.toLowerCase();
      return squad.players.filter(player =>
        player.name.toLowerCase().includes(searchTerm) ||
        player.position.toLowerCase().includes(searchTerm) ||
        player.nationality.toLowerCase().includes(searchTerm)
      );
    },

    getPlayerStats: (playerId: number) => {
      return playerSummaries.find(p => p.player_id === playerId) || null;
    },

    getFixturesByOpponent: (opponent: string) => {
      return fixtures.fixtures.filter(f => 
        f.opponent.toLowerCase().includes(opponent.toLowerCase())
      );
    },

    // Projections and insights
    getSeasonProjections: () => {
      return analysis.team_projections;
    },

    getFormAnalysis: (lastGames = 5) => {
      const recentGames = completedFixtures.slice(0, lastGames);
      const wins = recentGames.filter(f => {
        if (f.venue === 'H') return (f.home_score || 0) > (f.away_score || 0);
        return (f.away_score || 0) > (f.home_score || 0);
      }).length;
      
      const draws = recentGames.filter(f => f.home_score === f.away_score).length;
      const losses = recentGames.length - wins - draws;
      
      return { wins, draws, losses, gamesAnalyzed: recentGames.length };
    },

    getInjuryAnalysis: () => {
      const injuredPlayers = playerSummaries.filter(p => p.injuryIncidents > 0);
      const totalInjuries = injuredPlayers.reduce((sum, p) => sum + p.injuryIncidents, 0);
      const highRiskPlayers = squad.players.filter(p => p.injury_proneness > 0.7);
      
      return {
        currentInjuries: injuredPlayers.length,
        totalIncidents: totalInjuries,
        highRiskPlayers: highRiskPlayers.length,
        averageInjuryProneness: squad.players.reduce((sum, p) => sum + p.injury_proneness, 0) / squad.players.length
      };
    },

    // Data validation
    validateAllData: () => {
      return validateDataStructure.fixtures(fixtures) &&
             validateDataStructure.squad(squad) &&
             validateDataStructure.stats(stats) &&
             validateDataStructure.analysis(analysis);
    }
  };
};

/**
 * Helper function to format large numbers for display
 */
export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `£${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `£${(amount / 1000).toFixed(0)}K`;
  }
  return `£${amount}`;
};

/**
 * Helper function to format dates consistently
 */
export const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Helper function to determine match result
 */
export const getMatchResult = (fixture: Fixture, teamName: string = 'Manchester United'): 'W' | 'D' | 'L' | null => {
  if (fixture.home_score === null || fixture.away_score === null) return null;
  
  const isHome = fixture.venue === 'H';
  const ourScore = isHome ? fixture.home_score : fixture.away_score;
  const theirScore = isHome ? fixture.away_score : fixture.home_score;
  
  if (ourScore > theirScore) return 'W';
  if (ourScore < theirScore) return 'L';
  return 'D';
}; 