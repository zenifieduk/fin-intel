'use client';

import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Target, Trophy, DollarSign, Users, Calendar, Settings, Play, Pause, Crown, Shield, Crosshair, Star } from 'lucide-react';

interface YearData {
  premierLeague: string | number;
  championsLeague: string;
  europaLeague: string;
  conferenceLeague: string;
  eflChampionship: string | number;
  championshipParachute: string;
}

type ScenarioKey = 'base' | 'low' | 'high';

const scenarioData = {
  base: {
    name: "Base Scenario",
    description: "Championship → PL 4th → PL 1st",
    totalRevenue: 275000,
    psrStatus: "compliant"
  },
  low: {
    name: "Conservative Scenario", 
    description: "Championship → PL Struggle",
    totalRevenue: 185000,
    psrStatus: "monitor"
  },
  high: {
    name: "Championship Victory",
    description: "Championship → PL Champions",
    totalRevenue: 425000,
    psrStatus: "monitor"
  }
};

const ClubDNAFinancialDashboard = () => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('base');
  const [currentScenario, setCurrentScenario] = useState({
    2025: {
      premierLeague: '',
      championsLeague: '',
      europaLeague: 'Quarter-Final',
      conferenceLeague: '',
      eflChampionship: 3,
      championshipParachute: 'No'
    },
    2026: {
      premierLeague: 4,
      championsLeague: 'League Stage',
      europaLeague: '',
      conferenceLeague: '',
      eflChampionship: '',
      championshipParachute: 'No'
    },
    2027: {
      premierLeague: 1,
      championsLeague: 'Play-Off',
      europaLeague: '',
      conferenceLeague: '',
      eflChampionship: '',
      championshipParachute: 'No'
    }
  });

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB'));
  }, []);

  const competitionOptions = {
    premierLeague: ['', ...Array.from({length: 20}, (_, i) => i + 1)],
    championsLeague: ['', 'League Stage', 'Play-Off', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    europaLeague: ['', 'League Stage', 'Play-Off', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    conferenceLeague: ['', 'League Stage', 'Play-Off', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner'],
    eflChampionship: ['', ...Array.from({length: 24}, (_, i) => i + 1)],
    parachute: ['Yes', 'No']
  };

  // Calculate financial impact for each year
  const calculateYearlyFinancials = (yearData: YearData) => {    let broadcasting = 0;
    let commercial = 10000;
    let matchday = 5000;
    
    // EFL Championship (if playing there)
    if (yearData.eflChampionship && yearData.eflChampionship !== '') {
      const position = parseInt(String(yearData.eflChampionship));
      broadcasting = 15000 - (position * 200); // Championship base revenue
      commercial = 8000;
      matchday = 4000;
      
      // Promotion playoff bonus
      if (position <= 6) {
        broadcasting += 5000; // Playoff contention bonus
      }
      
      // Parachute payments
      if (yearData.championshipParachute === 'Yes') {
        broadcasting += 40000; // Parachute payment
      }
      
      return {
        broadcasting: Math.round(broadcasting),
        commercial: Math.round(commercial),
        matchday: Math.round(matchday),
        total: Math.round(broadcasting + commercial + matchday)
      };
    }
    
    // Premier League (if playing there)
    if (yearData.premierLeague && yearData.premierLeague !== '') {
      const position = parseInt(String(yearData.premierLeague));
      
      // Premier League base payment + merit payment
      broadcasting = 100000 + (21 - position) * 2000;
      commercial = 25000 + (position <= 6 ? 15000 : 0); // European qualification bonus
      matchday = 15000 + (position <= 4 ? 10000 : 0); // Top 4 attendance bonus
      
      // Champions League revenue
      if (yearData.championsLeague && yearData.championsLeague !== '') {
        const clBonus: Record<string, number> = {
          'League Stage': 15000,
          'Play-Off': 25000,
          'Round of 16': 35000,
          'Quarter-Final': 45000,
          'Semi-Final': 60000,
          'Final': 75000,
          'Winner': 100000
        };
        broadcasting += clBonus[yearData.championsLeague] || 0;
        commercial += 10000; // CL commercial boost
      }
      
      // Europa League revenue
      if (yearData.europaLeague && yearData.europaLeague !== '') {        const elBonus: Record<string, number> = {
          'League Stage': 8000,
          'Play-Off': 12000,
          'Round of 16': 18000,
          'Quarter-Final': 25000,
          'Semi-Final': 35000,
          'Final': 45000,
          'Winner': 60000
        };
        broadcasting += elBonus[yearData.europaLeague] || 0;
        commercial += 5000; // EL commercial boost
      }
      
      // Conference League revenue
      if (yearData.conferenceLeague && yearData.conferenceLeague !== '') {
        const confBonus: Record<string, number> = {
          'League Stage': 3000,
          'Play-Off': 5000,
          'Round of 16': 8000,
          'Quarter-Final': 12000,
          'Semi-Final': 18000,
          'Final': 25000,
          'Winner': 35000
        };
        broadcasting += confBonus[yearData.conferenceLeague] || 0;
        commercial += 3000; // Conference commercial boost
      }
    }
    
    return {
      broadcasting: Math.round(broadcasting),
      commercial: Math.round(commercial),
      matchday: Math.round(matchday),
      total: Math.round(broadcasting + commercial + matchday)
    };
  };

  // Calculate all years' financials
  const financialData = {
    2025: calculateYearlyFinancials(currentScenario[2025]),
    2026: calculateYearlyFinancials(currentScenario[2026]),
    2027: calculateYearlyFinancials(currentScenario[2027])
  };

  // Calculate total 3-year revenue
  const totalRevenue = financialData[2025].total + financialData[2026].total + financialData[2027].total;

  // Calculate compliance metrics based on total revenue
  const calculateCompliance = () => {
    const avgRevenue = totalRevenue / 3;
    
    const psr = Math.max(0, avgRevenue * 0.15 - 10000);
    const footballEarnings = Math.max(0, avgRevenue * 0.18 - 5000);
    const squadCostRatio = Math.min(70, (avgRevenue / 2000));
    
    return {      psr: {
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
    };
  };

  const compliance = calculateCompliance();

  // Create projection data for charts
  const projectionData = [
    { 
      year: '2025', 
      revenue: financialData[2025].total,
      broadcasting: financialData[2025].broadcasting,
      commercial: financialData[2025].commercial,
      matchday: financialData[2025].matchday
    },
    { 
      year: '2026', 
      revenue: financialData[2026].total,
      broadcasting: financialData[2026].broadcasting,
      commercial: financialData[2026].commercial,
      matchday: financialData[2026].matchday
    },
    { 
      year: '2027', 
      revenue: financialData[2027].total,
      broadcasting: financialData[2027].broadcasting,
      commercial: financialData[2027].commercial,
      matchday: financialData[2027].matchday
    }
  ];

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
  };  const getStatusIcon = (status: string) => {
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

  const getStatusColorForScenario = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500/20 text-green-200';
      case 'monitor':
        return 'bg-yellow-500/20 text-yellow-200';
      case 'breach':
        return 'bg-red-500/20 text-red-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const updateScenario = (year: number, field: string, value: string | number) => {
    setCurrentScenario(prev => ({
      ...prev,
      [year]: {
        ...prev[year as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const setPresetScenario = (preset: string) => {
    setActiveScenario(preset as ScenarioKey);
    switch (preset) {
      case 'base':
        setCurrentScenario({
          2025: { premierLeague: '', championsLeague: '', europaLeague: 'Quarter-Final', conferenceLeague: '', eflChampionship: 3, championshipParachute: 'No' },
          2026: { premierLeague: 4, championsLeague: 'League Stage', europaLeague: '', conferenceLeague: '', eflChampionship: '', championshipParachute: 'No' },
          2027: { premierLeague: 1, championsLeague: 'Play-Off', europaLeague: '', conferenceLeague: '', eflChampionship: '', championshipParachute: 'No' }
        });
        break;
      case 'low':
        setCurrentScenario({
          2025: { premierLeague: '', championsLeague: '', europaLeague: '', conferenceLeague: '', eflChampionship: 15, championshipParachute: 'Yes' },
          2026: { premierLeague: 15, championsLeague: '', europaLeague: 'Play-Off', conferenceLeague: '', eflChampionship: '', championshipParachute: 'No' },
          2027: { premierLeague: 15, championsLeague: '', europaLeague: '', conferenceLeague: '', eflChampionship: '', championshipParachute: 'No' }
        });
        break;
      case 'high':
        setCurrentScenario({
          2025: { premierLeague: '', championsLeague: '', europaLeague: 'Winner', conferenceLeague: '', eflChampionship: 1, championshipParachute: 'No' },
          2026: { premierLeague: 1, championsLeague: 'League Stage', europaLeague: '', conferenceLeague: '', eflChampionship: '', championshipParachute: 'No' },
          2027: { premierLeague: 1, championsLeague: 'Winner', europaLeague: '', conferenceLeague: '', eflChampionship: '', championshipParachute: 'No' }
        });
        break;
    }
  };

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
                <p className="text-blue-200">3-Year Scenario Modeling & Compliance Dashboard (2025-2027)</p>
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
            <a href="/frf2" className="text-white/70 hover:text-white transition-colors">
              FRF2 Interactive
            </a>
            <a href="/frf3" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              FRF3 3-Year Model
            </a>
            <a href="/frf4" className="text-white/70 hover:text-white transition-colors">
              FRF4 Progression
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scenario Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => {
                setActiveScenario('base');
                setPresetScenario('base');
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeScenario === 'base'
                  ? 'border-blue-400 bg-blue-500/20 shadow-xl scale-105'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Base Scenario</h3>
                <div className="text-2xl">
                  <Crosshair className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <p className="text-blue-200 mb-4">Championship → PL 4th → PL 1st</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>3-Year Revenue:</span>
                  <span className="font-semibold">£{(scenarioData.base.totalRevenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span>PSR Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColorForScenario(scenarioData.base.psrStatus)}`}>
                    {scenarioData.base.psrStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average/Year:</span>
                  <span className="font-semibold">£{(scenarioData.base.totalRevenue / 3 / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveScenario('low');
                setPresetScenario('low');
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeScenario === 'low'
                  ? 'border-blue-400 bg-blue-500/20 shadow-xl scale-105'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Conservative Scenario</h3>
                <div className="text-2xl">
                  <Shield className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <p className="text-blue-200 mb-4">Championship → PL Struggle</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>3-Year Revenue:</span>
                  <span className="font-semibold">£{(scenarioData.low.totalRevenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span>PSR Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColorForScenario(scenarioData.low.psrStatus)}`}>
                    {scenarioData.low.psrStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average/Year:</span>
                  <span className="font-semibold">£{(scenarioData.low.totalRevenue / 3 / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveScenario('high');
                setPresetScenario('high');
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeScenario === 'high'
                  ? 'border-blue-400 bg-blue-500/20 shadow-xl scale-105'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Championship Victory</h3>
                <div className="text-2xl">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <p className="text-blue-200 mb-4">Championship → PL Champions</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>3-Year Revenue:</span>
                  <span className="font-semibold">£{(scenarioData.high.totalRevenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span>PSR Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColorForScenario(scenarioData.high.psrStatus)}`}>
                    {scenarioData.high.psrStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average/Year:</span>
                  <span className="font-semibold">£{(scenarioData.high.totalRevenue / 3 / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Scenario Builder */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              3-Year Scenario Analysis (2025-2027)
            </h3>
            
            <div className="grid grid-cols-3 gap-8">
              {[2025, 2026, 2027].map(year => (
                <div key={year} className="space-y-4">
                  <h4 className="text-lg font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {year}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-blue-200 block mb-1">Premier League Position</label>
                      <select 
                        value={currentScenario[year as keyof typeof currentScenario].premierLeague}
                        onChange={(e) => updateScenario(year, 'premierLeague', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {competitionOptions.premierLeague.map(pos => (
                          <option key={pos} value={pos} className="bg-slate-800">{pos || 'Not in PL'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-200 block mb-1">Champions League</label>
                      <select 
                        value={currentScenario[year as keyof typeof currentScenario].championsLeague}
                        onChange={(e) => updateScenario(year, 'championsLeague', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {competitionOptions.championsLeague.map(stage => (
                          <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Qualified'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-200 block mb-1">Europa League</label>
                      <select 
                        value={currentScenario[year as keyof typeof currentScenario].europaLeague}
                        onChange={(e) => updateScenario(year, 'europaLeague', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {competitionOptions.europaLeague.map(stage => (
                          <option key={stage} value={stage} className="bg-slate-800">{stage || 'Not Qualified'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-200 block mb-1">EFL Championship</label>
                      <select 
                        value={currentScenario[year as keyof typeof currentScenario].eflChampionship}
                        onChange={(e) => updateScenario(year, 'eflChampionship', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {competitionOptions.eflChampionship.map(pos => (
                          <option key={pos} value={pos} className="bg-slate-800">{pos || 'Not in Championship'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-200 block mb-1">Parachute Payment</label>
                      <select 
                        value={currentScenario[year as keyof typeof currentScenario].championshipParachute}
                        onChange={(e) => updateScenario(year, 'championshipParachute', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {competitionOptions.parachute.map(option => (
                          <option key={option} value={option} className="bg-slate-800">{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Year Revenue Summary */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">£{(financialData[year as keyof typeof financialData].total / 1000).toFixed(0)}k</div>
                      <div className="text-blue-200 text-sm">Total Revenue</div>
                    </div>
                  </div>
                </div>
              ))}
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
                <div className="text-2xl font-bold">£{(totalRevenue / 1000).toFixed(0)}k</div>
                <div className="text-blue-200 text-sm">3-Year Revenue</div>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalRevenue / 600000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">£{(compliance.psr.value / 1000).toFixed(0)}k</div>
                <div className="text-yellow-200 text-sm">PSR Assessment</div>
              </div>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(compliance.psr.status)}`}>
              {getStatusIcon(compliance.psr.status)}
              <span>{compliance.psr.status}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">£{(compliance.footballEarnings.value / 1000).toFixed(0)}k</div>
                <div className="text-green-200 text-sm">Football Earnings</div>
              </div>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(compliance.footballEarnings.status)}`}>
              {getStatusIcon(compliance.footballEarnings.status)}
              <span>{compliance.footballEarnings.status}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{compliance.squadCostRatio.value}%</div>
                <div className="text-purple-200 text-sm">Squad Cost Ratio</div>
              </div>
            </div>
            <div className="text-xs text-purple-200">
              Threshold: {compliance.squadCostRatio.threshold}%
            </div>
          </div>
        </div>
        
        {/* Revenue Breakdown Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              3-Year Revenue Projection
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`£${(value/1000).toFixed(0)}k`, '']}
                  labelStyle={{ color: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="url(#blueGradient)" 
                  strokeWidth={2} 
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-purple-400" />
              Revenue Breakdown by Source
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`£${(value/1000).toFixed(0)}k`, '']}
                  labelStyle={{ color: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                />
                <Bar dataKey="broadcasting" stackId="a" fill="#3b82f6" name="Broadcasting" />
                <Bar dataKey="commercial" stackId="a" fill="#8b5cf6" name="Commercial" />
                <Bar dataKey="matchday" stackId="a" fill="#10b981" name="Matchday" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Financial Analysis Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-400" />
            Detailed Financial Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-blue-200">Year</th>
                  <th className="text-right py-3 px-4 text-blue-200">Broadcasting</th>
                  <th className="text-right py-3 px-4 text-blue-200">Commercial</th>
                  <th className="text-right py-3 px-4 text-blue-200">Matchday</th>
                  <th className="text-right py-3 px-4 text-blue-200">Total Revenue</th>
                  <th className="text-right py-3 px-4 text-blue-200">Growth</th>
                </tr>
              </thead>
              <tbody>
                {[2025, 2026, 2027].map((year, index) => {
                  const data = financialData[year as keyof typeof financialData];
                  const prevData = index > 0 ? financialData[([2025, 2026, 2027][index - 1]) as keyof typeof financialData] : null;
                  const growth = prevData ? ((data.total - prevData.total) / prevData.total * 100) : 0;
                  
                  return (
                    <tr key={year} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 font-semibold">{year}</td>
                      <td className="py-3 px-4 text-right">£{(data.broadcasting / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4 text-right">£{(data.commercial / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4 text-right">£{(data.matchday / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4 text-right font-bold">£{(data.total / 1000).toFixed(0)}k</td>
                      <td className="py-3 px-4 text-right">
                        {index > 0 && (
                          <span className={growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-white/30 font-bold">
                  <td className="py-3 px-4">3-Year Total</td>
                  <td className="py-3 px-4 text-right">
                    £{((financialData[2025].broadcasting + financialData[2026].broadcasting + financialData[2027].broadcasting) / 1000).toFixed(0)}k
                  </td>
                  <td className="py-3 px-4 text-right">
                    £{((financialData[2025].commercial + financialData[2026].commercial + financialData[2027].commercial) / 1000).toFixed(0)}k
                  </td>
                  <td className="py-3 px-4 text-right">
                    £{((financialData[2025].matchday + financialData[2026].matchday + financialData[2027].matchday) / 1000).toFixed(0)}k
                  </td>
                  <td className="py-3 px-4 text-right text-xl">£{(totalRevenue / 1000).toFixed(0)}k</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-400">Avg: £{(totalRevenue / 3 / 1000).toFixed(0)}k</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Performance Impact */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-400" />
            Player Performance Impact Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Key Player Bonuses</h4>
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Top Scorer Bonus:</span>
                  <span className="font-semibold">£2.5k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Assists Leader:</span>
                  <span className="font-semibold">£1.8k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Clean Sheets:</span>
                  <span className="font-semibold">£1.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Player of Season:</span>
                  <span className="font-semibold">£5.0k</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Team Achievement</h4>
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-200">Promotion Bonus:</span>
                  <span className="font-semibold">£15k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">European Qualification:</span>
                  <span className="font-semibold">£8k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Cup Final Appearance:</span>
                  <span className="font-semibold">£3k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Top 4 Finish:</span>
                  <span className="font-semibold">£12k</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Squad Development</h4>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-200">Youth Promotion:</span>
                  <span className="font-semibold">£800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-200">International Caps:</span>
                  <span className="font-semibold">£1.5k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-200">Contract Extensions:</span>
                  <span className="font-semibold">£2.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-200">Training Excellence:</span>
                  <span className="font-semibold">£900</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Scenario Comparison */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-400" />
            Quick Scenario Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base Scenario */}
            <div className="bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="mb-4">
                  <Crosshair className="w-12 h-12 text-blue-400 mx-auto" />
                </div>
                <h4 className="text-xl font-bold mb-2">Base Scenario</h4>
                <div className="text-3xl font-bold text-white mb-2">£275k</div>
                <div className="text-blue-200 text-sm mb-3">3-Year Revenue</div>
                <div className="text-sm text-blue-300">
                  Championship → PL 4th → PL 1st
                </div>
              </div>
            </div>

            {/* Low Scenario */}
            <div className="bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-600/20 rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="mb-4">
                  <Shield className="w-12 h-12 text-orange-400 mx-auto" />
                </div>
                <h4 className="text-xl font-bold mb-2">Low Scenario</h4>
                <div className="text-3xl font-bold text-white mb-2">£185k</div>
                <div className="text-orange-200 text-sm mb-3">3-Year Revenue</div>
                <div className="text-sm text-orange-300">
                  Championship → PL Struggle
                </div>
              </div>
            </div>

            {/* High Scenario */}
            <div className="bg-gradient-to-br from-green-500/20 via-emerald-600/20 to-teal-600/20 rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <div className="mb-4">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto" />
                </div>
                <h4 className="text-xl font-bold mb-2">High Scenario</h4>
                <div className="text-3xl font-bold text-white mb-2">£425k</div>
                <div className="text-green-200 text-sm mb-3">3-Year Revenue</div>
                <div className="text-sm text-green-300">
                  Championship → PL Champions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200">
              Club DNA FC Financial Intelligence • FRF3 • Scenario Modeling Dashboard
            </div>
            <div className="text-sm text-blue-200">
              Last Updated: {currentDate || '--/--/----'} • {isLiveMode ? 'Live Data' : 'Static Analysis'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function FRF3() {
  return <ClubDNAFinancialDashboard />;
}