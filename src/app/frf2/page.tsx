"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign, Users, Settings, Trophy, Play, Pause, Crown, Shield, Crosshair } from 'lucide-react';

const ClubDNAFinancialDashboard = () => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string[]>([]);
  const [previousFinancialData, setPreviousFinancialData] = useState<{
    revenue: { broadcasting: number; commercial: number; matchday: number; total: number }
  } | null>(null);
  const [changePercentages, setChangePercentages] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('--:--:--');
  const [currentDate, setCurrentDate] = useState<string>('');
  
  // Interactive scenario state
  const [currentScenario, setCurrentScenario] = useState({
    premierLeague: 4,
    championsLeague: 'League Stage',
    europaLeague: 'Quarter-Final',
    conferenceLeague: '',
    superCup: '',
    faCup: '',
    eflCup: '',
    eflChampionship: 3,
    championshipParachute: 'No'
  });

  // Competition options
  const competitionOptions = {
    premierLeague: Array.from({length: 20}, (_, i) => i + 1),
    championsLeague: ['', 'League Stage', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    europaLeague: ['', 'League Stage', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    conferenceLeague: ['', 'League Stage', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    cupCompetitions: ['', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    eflChampionship: Array.from({length: 24}, (_, i) => i + 1),
    parachute: ['Yes', 'No']
  };

  // Calculate financial impact based on current scenario
  const calculateFinancialImpact = useCallback((scenario: typeof currentScenario) => {
    let broadcasting = 0;
    let commercial = 15000;
    let matchday = 5000;
    
    // Premier League position impact
    if (scenario.premierLeague <= 4) {
      broadcasting += 120000 + (5 - scenario.premierLeague) * 5000; // Top 4 bonus
      commercial += 25000;
      matchday += 15000;
    } else if (scenario.premierLeague <= 10) {
      broadcasting += 100000 - (scenario.premierLeague - 5) * 2000;
      commercial += 15000;
      matchday += 10000;
    } else {
      broadcasting += 80000 - (scenario.premierLeague - 11) * 1000;
      commercial += 10000;
      matchday += 7000;
    }
    
    // Champions League impact
    const clRevenue: Record<string, number> = {
      'League Stage': 67120,
      'Round of 16': 85000,
      'Quarter-Final': 105000,
      'Semi-Final': 125000,
      'Final': 145000,
      'Winner': 165000
    };
    broadcasting += clRevenue[scenario.championsLeague] || 0;
    
    // Europa League impact
    const elRevenue: Record<string, number> = {
      'League Stage': 19687,
      'Round of 16': 25000,
      'Quarter-Final': 35000,
      'Semi-Final': 45000,
      'Final': 55000,
      'Winner': 65000
    };
    broadcasting += elRevenue[scenario.europaLeague] || 0;
    
    // Conference League impact
    const confRevenue: Record<string, number> = {
      'League Stage': 6828,
      'Round of 16': 12000,
      'Quarter-Final': 18000,
      'Semi-Final': 25000,
      'Final': 32000,
      'Winner': 40000
    };
    broadcasting += confRevenue[scenario.conferenceLeague] || 0;
    
    // EFL Championship impact (if relegated)
    if (scenario.eflChampionship && scenario.eflChampionship <= 6) {
      broadcasting = 10850 + (7 - scenario.eflChampionship) * 2000; // Promotion push
      commercial = 8000;
      matchday = 3000;
    }
    
    // Parachute payments
    if (scenario.championshipParachute === 'Yes') {
      broadcasting += 97658; // Parachute payment
    }
    
    const totalRevenue = broadcasting + commercial + matchday;
    
    // Calculate compliance metrics based on revenue
    const psr = Math.max(0, totalRevenue * 0.1 - 15000);
    const footballEarnings = Math.max(0, totalRevenue * 0.12 - 10000);
    const squadCostRatio = Math.min(70, (totalRevenue / 1000) * 0.3);
    
    return {
      revenue: {
        broadcasting: Math.round(broadcasting),
        commercial: Math.round(commercial),
        matchday: Math.round(matchday),
        total: Math.round(totalRevenue)
      },
      compliance: {
        psr: { 
          value: Math.round(psr), 
          status: psr < 50000 ? 'compliant' : psr < 100000 ? 'monitor' : 'caution',
          threshold: 105000
        },
        footballEarnings: { 
          value: Math.round(footballEarnings), 
          status: footballEarnings < 30000 ? 'compliant' : footballEarnings < 60000 ? 'monitor' : 'caution',
          threshold: 60000
        },
        squadCostRatio: { 
          value: Math.round(squadCostRatio * 10) / 10, 
          status: squadCostRatio < 50 ? 'excellent' : squadCostRatio < 65 ? 'good' : 'monitor',
          threshold: 70
        }
      },
      players: {
        jamesWilliams: { 
          goals: Math.min(45, Math.max(15, 30 + (totalRevenue - 150000) / 10000)), 
          bonus: Math.round((30 + (totalRevenue - 150000) / 10000) * 2000)
        },
        stuartGreen: { 
          cleanSheets: Math.min(25, Math.max(8, 15 + (200000 - scenario.premierLeague * 5000) / 8000)), 
          bonus: Math.round((15 + (200000 - scenario.premierLeague * 5000) / 8000) * 1500)
        },
        chrisTuson: { 
          appearances: Math.min(38, Math.max(20, 32 + (totalRevenue - 120000) / 15000)), 
          bonus: Math.round((32 + (totalRevenue - 120000) / 15000) * 500)
        },
        andyClarke: { 
          appearances: Math.min(38, Math.max(18, 30 + (totalRevenue - 120000) / 15000)), 
          bonus: Math.round((30 + (totalRevenue - 120000) / 15000) * 500)
        },
        philClarke: { 
          appearances: Math.min(38, Math.max(15, 28 + (totalRevenue - 120000) / 15000)), 
          bonus: Math.round((28 + (totalRevenue - 120000) / 15000) * 500)
        }
      }
    };
  }, []); // Empty dependency array since this function doesn't depend on any changing values

  const financialData = useMemo(() => calculateFinancialImpact(currentScenario), [currentScenario, calculateFinancialImpact]);

  // Track changes for visual feedback
  useEffect(() => {
    if (previousFinancialData) {
      const updated: string[] = [];
      const changes: Record<string, number> = {};
      
      // Check revenue changes
      if (financialData.revenue.total !== previousFinancialData.revenue.total) {
        updated.push('total-revenue');
        changes['total-revenue'] = previousFinancialData.revenue.total > 0 
          ? ((financialData.revenue.total - previousFinancialData.revenue.total) / previousFinancialData.revenue.total) * 100
          : 0;
      }
      if (financialData.revenue.broadcasting !== previousFinancialData.revenue.broadcasting) {
        updated.push('broadcasting');
        changes['broadcasting'] = previousFinancialData.revenue.broadcasting > 0 
          ? ((financialData.revenue.broadcasting - previousFinancialData.revenue.broadcasting) / previousFinancialData.revenue.broadcasting) * 100
          : 0;
      }
      if (financialData.revenue.commercial !== previousFinancialData.revenue.commercial) {
        updated.push('commercial');
        changes['commercial'] = previousFinancialData.revenue.commercial > 0 
          ? ((financialData.revenue.commercial - previousFinancialData.revenue.commercial) / previousFinancialData.revenue.commercial) * 100
          : 0;
      }
      if (financialData.revenue.matchday !== previousFinancialData.revenue.matchday) {
        updated.push('matchday');
        changes['matchday'] = previousFinancialData.revenue.matchday > 0 
          ? ((financialData.revenue.matchday - previousFinancialData.revenue.matchday) / previousFinancialData.revenue.matchday) * 100
          : 0;
      }
      
      if (updated.length > 0) {
        setRecentlyUpdated(updated);
        setChangePercentages(changes);
        setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour12: false }));
        
        // Clear highlight after 3 seconds
        const timer = setTimeout(() => {
          setRecentlyUpdated([]);
          setChangePercentages({});
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [financialData, previousFinancialData]);

  // Update previous data separately to avoid infinite loops
  useEffect(() => {
    setPreviousFinancialData(financialData);
  }, [financialData]); // Track financial data changes but guard against infinite loops with the check above

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'monitor': return 'text-yellow-600 bg-yellow-50';
      case 'caution': return 'text-orange-600 bg-orange-50';
      case 'breach': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'compliant':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'monitor':
      case 'caution':
        return <AlertTriangle className="w-4 h-4" />;
      case 'breach':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const revenueBreakdown = [
    { name: 'Broadcasting', value: financialData.revenue.broadcasting, fill: '#3b82f6' },
    { name: 'Commercial', value: financialData.revenue.commercial, fill: '#10b981' },
    { name: 'Matchday', value: financialData.revenue.matchday, fill: '#f59e0b' }
  ];

  const playerBonuses = [
    { name: 'James Williams', position: 'Striker', metric: `${Math.round(financialData.players.jamesWilliams.goals)} goals`, bonus: financialData.players.jamesWilliams.bonus },
    { name: 'Stuart Green', position: 'Goalkeeper', metric: `${Math.round(financialData.players.stuartGreen.cleanSheets)} clean sheets`, bonus: financialData.players.stuartGreen.bonus },
    { name: 'Chris Tuson', position: 'Midfielder', metric: `${Math.round(financialData.players.chrisTuson.appearances)} apps`, bonus: financialData.players.chrisTuson.bonus },
    { name: 'Andy Clarke', position: 'Defender', metric: `${Math.round(financialData.players.andyClarke.appearances)} apps`, bonus: financialData.players.andyClarke.bonus },
    { name: 'Phil Clarke', position: 'Midfielder', metric: `${Math.round(financialData.players.philClarke.appearances)} apps`, bonus: financialData.players.philClarke.bonus }
  ];



  // Initialize timestamp and date on client side to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    setCurrentDate(new Date().toLocaleDateString('en-GB'));
  }, []); // Empty dependency array ensures this runs only once

  // Live mode simulation (currently disabled - would connect to real data feeds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isLiveMode) {
      // In a real implementation, this would connect to live data feeds
      // For now, just update the timestamp every 5 seconds to show it's "live"
      interval = setInterval(() => {
        setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour12: false }));
      }, 5000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLiveMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Club DNA FC Financial Intelligence
                </h1>
                <p className="text-blue-200">Advanced Scenario Modeling & Compliance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isLiveMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isLiveMode ? 'Live Mode' : 'Static Mode'}</span>
              </button>
              <div className="text-sm text-blue-200">
                Season: 2024/25 • Week 23 • {currentDate || '--/--/----'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex space-x-6">
            <a href="/frf" className="text-white/70 hover:text-white transition-colors">
              FRF Analysis
            </a>
            <a href="/frf2" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              FRF2 Interactive
            </a>
            <a href="/frf3" className="text-white/70 hover:text-white transition-colors">
              FRF3 3-Year Model
            </a>
            <a href="/frf4" className="text-white/70 hover:text-white transition-colors">
              FRF4 Progression
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Interactive Scenario Builder */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Scenario Analysis
            </h3>            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Premier League Position */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Premier League Position</label>
                <select 
                  value={currentScenario.premierLeague}
                  onChange={(e) => setCurrentScenario({...currentScenario, premierLeague: parseInt(e.target.value)})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.premierLeague.map(pos => (
                    <option key={pos} value={pos} className="bg-slate-800">{pos}</option>
                  ))}
                </select>
              </div>

              {/* Champions League */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Champions League</label>
                <select 
                  value={currentScenario.championsLeague}
                  onChange={(e) => setCurrentScenario({...currentScenario, championsLeague: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.championsLeague.map(stage => (
                    <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Qualified'}</option>
                  ))}
                </select>
              </div>

              {/* Europa League */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Europa League</label>
                <select 
                  value={currentScenario.europaLeague}
                  onChange={(e) => setCurrentScenario({...currentScenario, europaLeague: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.europaLeague.map(stage => (
                    <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Qualified'}</option>
                  ))}
                </select>
              </div>

              {/* Conference League */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Conference League</label>
                <select 
                  value={currentScenario.conferenceLeague}
                  onChange={(e) => setCurrentScenario({...currentScenario, conferenceLeague: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.conferenceLeague.map(stage => (
                    <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Qualified'}</option>
                  ))}
                </select>
              </div>

              {/* Super Cup */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Super Cup</label>
                <select 
                  value={currentScenario.superCup}
                  onChange={(e) => setCurrentScenario({...currentScenario, superCup: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.cupCompetitions.map(stage => (
                    <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Qualified'}</option>
                  ))}
                </select>
              </div>

              {/* FA Cup */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">FA Cup</label>
                <select 
                  value={currentScenario.faCup}
                  onChange={(e) => setCurrentScenario({...currentScenario, faCup: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.cupCompetitions.map(stage => (
                    <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Participating'}</option>
                  ))}
                </select>
              </div>

              {/* EFL Cup */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">EFL Cup</label>
                <select 
                  value={currentScenario.eflCup}
                  onChange={(e) => setCurrentScenario({...currentScenario, eflCup: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.cupCompetitions.map(stage => (
                    <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Participating'}</option>
                  ))}
                </select>
              </div>

              {/* Championship Parachute */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Championship Parachute</label>
                <select 
                  value={currentScenario.championshipParachute}
                  onChange={(e) => setCurrentScenario({...currentScenario, championshipParachute: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionOptions.parachute.map(option => (
                    <option key={option} value={option} className="bg-slate-800">{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Scenario Presets */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentScenario({
                  premierLeague: 4, championsLeague: 'League Stage', europaLeague: 'Quarter-Final',
                  conferenceLeague: '', superCup: '', faCup: '', eflCup: '', eflChampionship: 3, championshipParachute: 'No'
                })}
                className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-all flex items-center"
              >
                <Crosshair className="w-4 h-4 mr-2" />
                Base Scenario
              </button>
              <button
                onClick={() => setCurrentScenario({
                  premierLeague: 15, championsLeague: '', europaLeague: 'League Stage',
                  conferenceLeague: '', superCup: '', faCup: '', eflCup: '', eflChampionship: 3, championshipParachute: 'No'
                })}
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg text-yellow-200 hover:bg-yellow-500/30 transition-all flex items-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                Relegation Battle
              </button>
              <button
                onClick={() => setCurrentScenario({
                  premierLeague: 1, championsLeague: 'Winner', europaLeague: '',
                  conferenceLeague: '', superCup: 'Winner', faCup: 'Winner', eflCup: 'Winner', eflChampionship: 3, championshipParachute: 'No'
                })}
                className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg text-green-200 hover:bg-green-500/30 transition-all flex items-center"
              >
                <Crown className="w-4 h-4 mr-2" />
                Treble Winners
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold transition-all duration-500 ${
                  recentlyUpdated.includes('total-revenue') ? 'scale-110 text-blue-300' : 'scale-100'
                }`}>
                  £{(financialData.revenue.total / 1000).toFixed(0)}k
                  {recentlyUpdated.includes('total-revenue') && (
                    <span className="ml-1 text-lg animate-bounce">💰</span>
                  )}
                </div>
                <div className="text-blue-200 text-sm">Total Revenue</div>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((financialData.revenue.total / 300000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentScenario.premierLeague}</div>
                <div className="text-green-200 text-sm">League Position</div>
              </div>
            </div>
            <div className="text-xs text-green-200">
              Champions League: {currentScenario.championsLeague || 'Not Qualified'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">£{(financialData.compliance.psr.value / 1000).toFixed(0)}k</div>
                <div className="text-yellow-200 text-sm">PSR Assessment</div>
              </div>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(financialData.compliance.psr.status)}`}>
              {getStatusIcon(financialData.compliance.psr.status)}
              <span>{financialData.compliance.psr.status}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{financialData.compliance.squadCostRatio.value}%</div>
                <div className="text-purple-200 text-sm">Squad Cost Ratio</div>
              </div>
            </div>
            <div className="text-xs text-purple-200">
              Threshold: {financialData.compliance.squadCostRatio.threshold}%
            </div>
          </div>
        </div>
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Financial Projections */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Real-time Financial Impact
              <div className="ml-3 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="ml-2 text-xs text-green-400 font-medium">LIVE</span>
              </div>
            </h3>
            <div className="space-y-4">
              <div className={`flex justify-between items-center p-3 rounded-lg transition-all duration-500 ${
                recentlyUpdated.includes('broadcasting') 
                  ? 'bg-blue-500/30 border-2 border-blue-400 shadow-lg shadow-blue-400/20' 
                  : 'bg-white/5'
              }`}>
                <span className="text-blue-200 flex items-center">
                  Broadcasting Revenue
                  {recentlyUpdated.includes('broadcasting') && (
                    <div className="ml-2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                  )}
                </span>
                                 <div className="flex items-center">
                   {recentlyUpdated.includes('broadcasting') && changePercentages['broadcasting'] && (
                     <div className="mr-2 text-sm text-blue-300 animate-pulse">
                       {changePercentages['broadcasting'] > 0 ? '↗' : '↘'} 
                       {Math.abs(changePercentages['broadcasting']).toFixed(1)}%
                     </div>
                   )}
                   <span className={`text-xl font-bold text-blue-400 transition-all duration-500 ${
                     recentlyUpdated.includes('broadcasting') ? 'scale-110' : 'scale-100'
                   }`}>
                     £{(financialData.revenue.broadcasting / 1000).toFixed(0)}k
                   </span>
                 </div>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg transition-all duration-500 ${
                recentlyUpdated.includes('commercial') 
                  ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-400/20' 
                  : 'bg-white/5'
              }`}>
                <span className="text-green-200 flex items-center">
                  Commercial Revenue
                  {recentlyUpdated.includes('commercial') && (
                    <div className="ml-2 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                  )}
                </span>
                                 <div className="flex items-center">
                   {recentlyUpdated.includes('commercial') && changePercentages['commercial'] && (
                     <div className="mr-2 text-sm text-green-300 animate-pulse">
                       {changePercentages['commercial'] > 0 ? '↗' : '↘'} 
                       {Math.abs(changePercentages['commercial']).toFixed(1)}%
                     </div>
                   )}
                   <span className={`text-xl font-bold text-green-400 transition-all duration-500 ${
                     recentlyUpdated.includes('commercial') ? 'scale-110' : 'scale-100'
                   }`}>
                     £{(financialData.revenue.commercial / 1000).toFixed(0)}k
                   </span>
                 </div>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg transition-all duration-500 ${
                recentlyUpdated.includes('matchday') 
                  ? 'bg-yellow-500/30 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20' 
                  : 'bg-white/5'
              }`}>
                <span className="text-yellow-200 flex items-center">
                  Matchday Revenue
                  {recentlyUpdated.includes('matchday') && (
                    <div className="ml-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                  )}
                </span>
                                 <div className="flex items-center">
                   {recentlyUpdated.includes('matchday') && changePercentages['matchday'] && (
                     <div className="mr-2 text-sm text-yellow-300 animate-pulse">
                       {changePercentages['matchday'] > 0 ? '↗' : '↘'} 
                       {Math.abs(changePercentages['matchday']).toFixed(1)}%
                     </div>
                   )}
                   <span className={`text-xl font-bold text-yellow-400 transition-all duration-500 ${
                     recentlyUpdated.includes('matchday') ? 'scale-110' : 'scale-100'
                   }`}>
                     £{(financialData.revenue.matchday / 1000).toFixed(0)}k
                   </span>
                 </div>
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-lg border transition-all duration-500 ${
                recentlyUpdated.includes('total-revenue') 
                  ? 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 border-purple-400 shadow-xl shadow-purple-400/30' 
                  : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/20'
              }`}>
                <span className="text-white font-semibold flex items-center">
                  Total Revenue
                  {recentlyUpdated.includes('total-revenue') && (
                    <div className="ml-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  )}
                </span>
                                 <div className="flex items-center">
                   {recentlyUpdated.includes('total-revenue') && changePercentages['total-revenue'] && (
                     <div className="mr-3 text-white/80 animate-pulse">
                       <div className="text-lg">{changePercentages['total-revenue'] > 0 ? '📈' : '📉'}</div>
                       <div className="text-xs">
                         {changePercentages['total-revenue'] > 0 ? '+' : ''}{changePercentages['total-revenue'].toFixed(1)}%
                       </div>
                     </div>
                   )}
                   <span className={`text-2xl font-bold text-white transition-all duration-500 ${
                     recentlyUpdated.includes('total-revenue') ? 'scale-110 text-shadow-lg' : 'scale-100'
                   }`}>
                     £{(financialData.revenue.total / 1000).toFixed(0)}k
                   </span>
                 </div>
              </div>
            </div>
            
            {/* Real-time impact summary */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Last Updated:</span>
                <span className="text-blue-400 font-mono">{lastUpdated}</span>
              </div>
              {recentlyUpdated.length > 0 && (
                <div className="mt-2 text-xs text-green-400">
                  ⚡ {recentlyUpdated.length} metric{recentlyUpdated.length !== 1 ? 's' : ''} updated
                </div>
              )}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              Revenue Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: £${(Number(value)/1000).toFixed(0)}k`}
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${(Number(value)/1000).toFixed(0)}k`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Dashboard */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-purple-400" />
            Regulatory Compliance Monitor
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(financialData.compliance).map(([key, data]) => (
              <div key={key} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                    <span>{data.status}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current:</span>
                    <span className="font-semibold">£{(data.value / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Threshold:</span>
                    <span className="font-semibold">{key === 'squadCostRatio' ? `${data.threshold}%` : `£${(data.threshold / 1000).toFixed(0)}k`}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        data.status === 'compliant' || data.status === 'excellent' || data.status === 'good' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min((data.value / data.threshold) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>        {/* Revenue Breakdown & Analysis */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-400" />
            Revenue Breakdown & Analysis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: £${(Number(value)/1000).toFixed(0)}k`}
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => [`£${(Number(value)/1000).toFixed(0)}k`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <h4 className="font-semibold text-blue-200 mb-2">Performance Impact</h4>
                <p className="text-sm text-blue-100">
                  Current league position ({currentScenario.premierLeague}) generates {currentScenario.premierLeague <= 4 ? 'Champions League' : currentScenario.premierLeague <= 6 ? 'Europa League' : 'Conference League'} qualification revenue.
                </p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/20">
                <h4 className="font-semibold text-green-200 mb-2">European Revenue</h4>
                <p className="text-sm text-green-100">
                  {currentScenario.championsLeague ? `Champions League ${currentScenario.championsLeague}` : 'No Champions League participation'} adds significant broadcasting value.
                </p>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                <h4 className="font-semibold text-yellow-200 mb-2">Commercial Growth</h4>
                <p className="text-sm text-yellow-100">
                  Higher league positions unlock premium sponsorship deals and increased matchday revenue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Player Performance & Bonuses */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Key Player Performance & Bonus Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {playerBonuses.map((player, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{player.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <h4 className="font-semibold text-sm">{player.name}</h4>
                  <p className="text-xs text-blue-200 mb-2">{player.position}</p>
                  <div className="text-lg font-bold text-green-400">£{player.bonus.toLocaleString()}</div>
                  <p className="text-xs text-gray-300">{player.metric}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Performance Bonuses:</span>
              <span className="text-xl font-bold text-green-400">
                £{playerBonuses.reduce((sum, player) => sum + player.bonus, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p className="mb-2">
            🚀 <strong>This is just a demonstration</strong> of what&apos;s possible with Club DNA&apos;s financial modeling technology
          </p>
          <p>
            Imagine real-time data feeds, live player performance tracking, and instant scenario adjustments for strategic decision-making
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubDNAFinancialDashboard;