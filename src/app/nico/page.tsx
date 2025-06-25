"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  TrendingUp, PoundSterling, Users, Clock, Shield, 
  AlertTriangle, Calendar, Target, Mic, MicOff, 
  Trophy, BarChart3, Activity, Zap, Play, Pause
} from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { useJsonData } from '@/hooks/useJsonData';
import {
  FixturesData,
  SquadData,
  PlayerStatsData,
  SeasonAnalysisData
} from '@/types/nico-dashboard';
import { createDataAnalyzers } from '@/utils/nico-advanced-processing';

const NICO_MANCHESTER_UNITED_DASHBOARD = () => {
  // Load all Manchester United data
  const { data: fixtures, loading: fixturesLoading, error: fixturesError } = 
    useJsonData<FixturesData>('manchester_united_fixtures_2025_26_corrected');
  
  const { data: squad, loading: squadLoading, error: squadError } = 
    useJsonData<SquadData>('manchester_united_squad_2025_26');
  
  const { data: stats, loading: statsLoading, error: statsError } = 
    useJsonData<PlayerStatsData>('manchester_united_player_stats_2025_26');
  
  const { data: analysis, loading: analysisLoading, error: analysisError } = 
    useJsonData<SeasonAnalysisData>('manchester_united_season_analysis_2025_26');

  // NICO Agent State
  const [hasRequestedMicPermission, setHasRequestedMicPermission] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);
  
  // Dashboard interaction state
  const [highlightedPlayer, setHighlightedPlayer] = useState<string | null>(null);
  const [nicoActionFeedback, setNicoActionFeedback] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<'overview' | 'attack' | 'defense' | 'injuries' | 'fixtures'>('overview');

  // Data processing
  const dataAnalyzers = useMemo(() => {
    if (fixtures && squad && stats && analysis) {
      return createDataAnalyzers(fixtures, squad, stats, analysis);
    }
    return null;
  }, [fixtures, squad, stats, analysis]);

  // Poll for NICO voice control commands
  useEffect(() => {
    let lastKnownUpdate = Date.now();
    
    const pollForNicoCommands = async () => {
      try {
        const response = await fetch('/api/voice-control', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          const state = result.data;
          
          // Only update if there's been a change
          if (state.lastUpdate > lastKnownUpdate) {
            lastKnownUpdate = state.lastUpdate;
            
            console.log('🎮 NICO Command Received (Dashboard):', state);
            
            // Update highlighted player if changed
            if (state.highlightedPlayer !== highlightedPlayer) {
              setHighlightedPlayer(state.highlightedPlayer);
              if (state.highlightedPlayer) {
                setNicoActionFeedback(`🎤 NICO highlighted ${state.highlightedPlayer}`);
              } else {
                setNicoActionFeedback(`🎤 NICO cleared player highlight`);
              }
              setTimeout(() => setNicoActionFeedback(null), 3000);
            }
          }
        }
      } catch (error) {
        console.error('Error polling for NICO commands:', error);
      }
    };
    
    // Poll every 5 seconds for NICO commands
    const interval = setInterval(pollForNicoCommands, 5000);
    
    return () => clearInterval(interval);
  }, [highlightedPlayer]);

  // Agent conversation handlers
  const requestMicrophonePermission = useCallback(async () => {
    setHasRequestedMicPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermissionGranted(false);
      return false;
    }
  }, []);

  // NICO Agent Conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to NICO Agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from NICO Agent');
    },
    onMessage: (message) => {
      console.log('NICO Agent message:', message);
    },
    onError: (error) => {
      console.error('NICO Agent error:', error);
    },
  });

  const startConversationWithAgent = useCallback(async () => {
    try {
      console.log('🎙️ Starting conversation with NICO...');
      
      if (!hasRequestedMicPermission) {
        console.log('🎤 Requesting microphone permission...');
        const granted = await requestMicrophonePermission();
        if (!granted) {
          console.log('❌ Microphone permission denied');
          return;
        }
        console.log('✅ Microphone permission granted');
      }
      
      console.log('🤖 Starting session with NICO agent: agent_01jy1j8n36ee5rp8t5tv0p2nk7');
      
      await conversation.startSession({
        agentId: 'agent_01jy1j8n36ee5rp8t5tv0p2nk7', // NICO Agent ID
      });
      
      console.log('✅ NICO conversation started successfully');
    } catch (error) {
      console.error('❌ Failed to start conversation with NICO:', error);
    }
  }, [conversation, hasRequestedMicPermission, requestMicrophonePermission]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  }, [conversation]);

  const handleToggleAgent = async () => {
    if (conversation.status === 'connected') {
      endConversation();
    } else {
      await startConversationWithAgent();
    }
  };

  // Helper function to check if a player should be highlighted
  const isPlayerHighlighted = (playerName: string) => {
    if (!highlightedPlayer) return false;
    
    const normalizedHighlight = highlightedPlayer.toLowerCase();
    const normalizedPlayer = playerName.toLowerCase();
    
    return normalizedPlayer.includes(normalizedHighlight) || 
           normalizedHighlight.includes(normalizedPlayer) ||
           normalizedPlayer.split(' ').some(part => normalizedHighlight.includes(part)) ||
           normalizedHighlight.split(' ').some(part => normalizedPlayer.includes(part));
  };

  // Team logo mapping function
  const getTeamLogo = (teamName: string): string | null => {
    const logoMap: { [key: string]: string | null } = {
      'AFC Bournemouth': '/images/bournemouth.svg',
      'Arsenal': '/images/arsenal.svg',
      'Aston Villa': '/images/aston-villa.svg',
      'Brentford': '/images/brentford-fc.svg',
      'Brighton & Hove Albion': '/images/brighton-hove-albion.svg',
      'Burnley': '/images/burnley.svg',
      'Chelsea': '/images/chelsea.svg',
      'Crystal Palace': '/images/crystal-palace.svg',
      'Everton': '/images/everton.svg',
      'Fulham': '/images/fulham.svg',
      'Leeds United': '/images/leeds-united.svg',
      'Liverpool': '/images/liverpool.svg',
      'Manchester City': '/images/manchester-city.svg',
      'Manchester United': '/images/manchester-united.svg',
      'Newcastle United': '/images/newcastle-united.svg',
      'Nottingham Forest': '/images/Nottingham-Forest.svg',
      'Sunderland': '/images/Sunderland.svg',
      'Tottenham Hotspur': '/images/tottenham-hotspur.svg',
      'West Ham United': '/images/west-ham-united.svg',
      'Wolverhampton Wanderers': '/images/Wolverhampton-Wanderers.svg',
      
      // Alternative name mappings for fixture data
      'Brighton': '/images/brighton-hove-albion.svg',
      'Newcastle': '/images/newcastle-united.svg',
      'Tottenham': '/images/tottenham-hotspur.svg',
      'West Ham': '/images/west-ham-united.svg',
      'Wolves': '/images/Wolverhampton-Wanderers.svg'
    };

    return logoMap[teamName] || null;
  };

  // Loading state
  if (fixturesLoading || squadLoading || statsLoading || analysisLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Manchester United Data</h2>
          <p className="text-blue-200">Preparing season forecasting dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  const hasErrors = fixturesError || squadError || statsError || analysisError;
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Data Loading Error</h2>
          <div className="bg-blue-800/50 rounded-lg p-4 text-left">
            {fixturesError && <p className="text-blue-200">Fixtures: {fixturesError.message}</p>}
            {squadError && <p className="text-blue-200">Squad: {squadError.message}</p>}
            {statsError && <p className="text-blue-200">Stats: {statsError.message}</p>}
            {analysisError && <p className="text-blue-200">Analysis: {analysisError.message}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Get current headline stats and league position
  const headlineStats = dataAnalyzers?.scenario.generateHeadlineStats(currentScenario);
  const unitedPosition = dataAnalyzers?.leagueTable.getManchesterUnitedPosition();
  const leagueTable = dataAnalyzers?.leagueTable.calculateLeagueTable();
  const allFixtures = dataAnalyzers?.fixtures.getAllFixtures();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-none mx-auto px-6 py-3">
          <nav className="flex space-x-6 items-center">
            <a href="/frf" className="text-white/70 hover:text-white transition-colors">
              FRF Analysis
            </a>
            <a href="/contracts" className="text-white/70 hover:text-white transition-colors">
              Contracts (PL)
            </a>
            <a href="/nico" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              NICO (Man Utd)
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="max-w-none mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            NICO • Manchester United Season Forecasting
          </h1>
          <p className="text-xl text-blue-200 max-w-4xl mx-auto">
            Advanced AI-powered analysis of Manchester United's 2025/26 Premier League campaign
          </p>
          
          {/* NICO Action Feedback */}
          {nicoActionFeedback && (
            <div className="mt-4 mx-auto max-w-md">
              <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-lg p-3 text-yellow-100 text-sm backdrop-blur-sm">
                {nicoActionFeedback}
              </div>
            </div>
          )}
        </div>

        {/* Scenario Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
            <div className="flex space-x-2">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'attack', label: 'Attack', icon: Target },
                { key: 'defense', label: 'Defense', icon: Shield },
                { key: 'injuries', label: 'Injuries', icon: Activity },
                { key: 'fixtures', label: 'Fixtures', icon: Calendar }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentScenario(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentScenario === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Headline Stats */}
        {headlineStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {headlineStats.stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    stat.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    stat.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                     stat.trend === 'down' ? <TrendingUp className="h-4 w-4 rotate-180" /> :
                     <Zap className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* League Table - Takes 2 columns */}
          <div className="xl:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-blue-400 mr-2" />
              Premier League Table
            </h3>
            
            {leagueTable && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-2 text-white/70">Pos</th>
                      <th className="text-left p-2 text-white/70">Team</th>
                      <th className="text-center p-2 text-white/70">P</th>
                      <th className="text-center p-2 text-white/70">W</th>
                      <th className="text-center p-2 text-white/70">D</th>
                      <th className="text-center p-2 text-white/70">L</th>
                      <th className="text-center p-2 text-white/70">GF</th>
                      <th className="text-center p-2 text-white/70">GA</th>
                      <th className="text-center p-2 text-white/70">GD</th>
                      <th className="text-center p-2 text-white/70">Pts</th>
                      <th className="text-center p-2 text-white/70">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueTable.map((team) => (
                      <tr 
                        key={team.position} 
                        className={`border-b border-white/10 ${
                          team.name === 'Manchester United' ? 'bg-blue-600/20 border-blue-400' : ''
                        }`}
                      >
                        <td className="p-2 font-bold text-white">{team.position}</td>
                        <td className={`p-2 font-medium ${
                          team.name === 'Manchester United' ? 'text-blue-300' : 'text-white'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {getTeamLogo(team.name) ? (
                              <img 
                                src={getTeamLogo(team.name)!} 
                                alt={`${team.name} logo`}
                                className="w-5 h-5 object-contain"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white/60">?</span>
                              </div>
                            )}
                            <span>
                              {team.name}
                              {team.name === 'Manchester United' && <span className="ml-2">⭐</span>}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 text-center text-white/80">{team.played}</td>
                        <td className="p-2 text-center text-green-400">{team.wins}</td>
                        <td className="p-2 text-center text-yellow-400">{team.draws}</td>
                        <td className="p-2 text-center text-red-400">{team.losses}</td>
                        <td className="p-2 text-center text-white/80">{team.goalsFor}</td>
                        <td className="p-2 text-center text-white/80">{team.goalsAgainst}</td>
                        <td className={`p-2 text-center font-medium ${
                          team.goalDifference > 0 ? 'text-green-400' : 
                          team.goalDifference < 0 ? 'text-red-400' : 'text-white/80'
                        }`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td className="p-2 text-center font-bold text-white">{team.points}</td>
                        <td className="p-2 text-center">
                          <div className="flex space-x-1">
                            {team.form.slice(-5).map((result: string, i: number) => (
                              <span 
                                key={i}
                                className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                  result === 'W' ? 'bg-green-500 text-white' :
                                  result === 'D' ? 'bg-yellow-500 text-white' :
                                  'bg-red-500 text-white'
                                }`}
                              >
                                {result}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fixtures Sidebar */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-blue-400 mr-2" />
              Fixtures & Results
            </h3>
            
            {allFixtures && (
              <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 p-2 border-b border-white/10 text-xs font-semibold text-white/60">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Opponent</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-3">Score/Result</div>
                </div>
                
                {/* Fixtures */}
                {allFixtures.map((fixture, index) => {
                  const isCompleted = fixture.home_score !== null && fixture.away_score !== null;
                  const result = isCompleted 
                    ? (fixture.venue === 'H' 
                        ? (fixture.home_score! > fixture.away_score! ? 'W' : 
                           fixture.home_score! < fixture.away_score! ? 'L' : 'D')
                        : (fixture.away_score! > fixture.home_score! ? 'W' : 
                           fixture.away_score! < fixture.home_score! ? 'L' : 'D'))
                    : null;
                  
                  const formatDate = (dateStr: string) => {
                    const [day, month, year] = dateStr.split('/');
                    const fullYear = `20${year}`;
                    const date = new Date(`${fullYear}-${month}-${day}`);
                    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  };
                  
                  return (
                                        <div key={index} className={`grid grid-cols-12 gap-2 p-2 rounded text-xs ${
                      isCompleted ? 'bg-white/5' : 'bg-blue-500/10 border border-blue-400/30'
                    }`}>
                      {/* Matchday */}
                      <div className="col-span-1 text-white/60 font-medium">{fixture.matchday}</div>
                      
                      {/* Opponent */}
                      <div className="col-span-5 flex items-center space-x-2">
                        {getTeamLogo(fixture.opponent) ? (
                          <img 
                            src={getTeamLogo(fixture.opponent)!} 
                            alt={`${fixture.opponent} logo`}
                            className="w-4 h-4 object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-white/20 rounded-full flex-shrink-0"></div>
                        )}
                        <span className={`text-white truncate ${!isCompleted ? 'font-medium' : ''}`}>
                          {fixture.opponent}
                        </span>
                        <span className={`text-xs px-1 rounded flex-shrink-0 ${
                          fixture.venue === 'H' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                        }`}>
                          {fixture.venue === 'H' ? 'H' : 'A'}
                        </span>
                      </div>
                      
                      {/* Date */}
                      <div className="col-span-3 text-white/80">
                        {formatDate(fixture.date)}
                      </div>
                      
                      {/* Score/Result */}
                      <div className="col-span-3 flex items-center space-x-2">
                        {isCompleted ? (
                          <>
                            <span className="text-white/80">
                              {fixture.venue === 'H' ? fixture.home_score : fixture.away_score}-{fixture.venue === 'H' ? fixture.away_score : fixture.home_score}
                            </span>
                            <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                              result === 'W' ? 'bg-green-500 text-white' :
                              result === 'D' ? 'bg-yellow-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {result}
                            </span>
                          </>
                        ) : (
                          <span className="text-white/40">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-200 text-sm">
          <p>
            <strong>NICO • Manchester United Intelligence Platform</strong> - Season forecasting with 760 player game records
          </p>
          <p className="mt-1">
            🎯 League table • Player analytics • Voice control • AI insights • Performance forecasting
          </p>
        </div>
      </div>

      {/* NICO Voice Assistant */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2 z-40">
        {/* Status Indicator */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur text-white px-2 py-1 rounded-full text-xs">
          {conversation.status === 'connected' && (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>NICO Connected</span>
            </>
          )}
          {conversation.status === 'connecting' && (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Connecting</span>
            </>
          )}
          {conversation.status === 'disconnected' && (
            <>
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span>NICO</span>
            </>
          )}
        </div>

        {/* Microphone Button */}
        <button
          className={`p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
            conversation.status === 'connected' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          onClick={handleToggleAgent}
          title={conversation.status === 'connected' ? "End conversation with NICO" : "Start conversation with NICO"}
        >
          {conversation.status === 'connected' ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default NICO_MANCHESTER_UNITED_DASHBOARD;