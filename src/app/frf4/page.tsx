"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Trophy, DollarSign, Users, Calendar, Settings, Play, Pause, Crosshair, Shield } from 'lucide-react';

type ScenarioYear = 2025 | 2026 | 2027;

interface YearData2025 {
  eflLeague1Position: number;
  faCupProgress: string;
  eflCupProgress: string;
  relegatedFromChampionship: boolean;
}

interface YearData2026 {
  league: string;
  position: number;
  championsLeague: string;
  europaLeague: string;
  conferenceLeague: string;
  faCupProgress: string;
  eflCupProgress: string;
  parachutePayment: boolean;
}

interface YearData2027 {
  league: string;
  position: number;
  championsLeague: string;
  europaLeague: string;
  conferenceLeague: string;
  faCupProgress: string;
  eflCupProgress: string;
  parachutePayment: boolean;
}

interface ScenarioData {
  2025: YearData2025;
  2026: YearData2026;
  2027: YearData2027;
}

const ClubDNAFinancialDashboard = () => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<ScenarioData>({
    2025: {
      eflLeague1Position: 3, // Starting in EFL League 1
      faCupProgress: '',
      eflCupProgress: '',
      relegatedFromChampionship: false
    },
    2026: {
      league: 'championship', // Promoted to Championship
      position: 10,
      championsLeague: '',
      europaLeague: '',
      conferenceLeague: '',
      faCupProgress: '',
      eflCupProgress: '',
      parachutePayment: false
    },
    2027: {
      league: 'premierLeague', // Promoted to Premier League
      position: 15,
      championsLeague: '',
      europaLeague: '',
      conferenceLeague: '',
      faCupProgress: '',
      eflCupProgress: '',
      parachutePayment: false
    }
  });

  const getAvailableOptions = (year) => {
    const prevYear = year - 1;
    const prevScenario = currentScenario[prevYear];
    
    if (year === 2025) {
      // Starting in EFL League 1
      return {
        leagues: [{ value: 'eflLeague1', label: 'EFL League 1' }],
        positions: Array.from({length: 24}, (_, i) => i + 1),
        europeanComps: [], // No European competitions available from League 1
        domesticCups: ['', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner']
      };
    }
    
    if (year === 2026) {
      // Determine league based on 2025 performance
      let availableLeagues = [];
      let positions = [];
      let europeanComps = [];
      
      if (prevScenario.eflLeague1Position <= 2) {
        // Automatic promotion to Championship
        availableLeagues = [{ value: 'championship', label: 'EFL Championship' }];
        positions = Array.from({length: 24}, (_, i) => i + 1);
      } else if (prevScenario.eflLeague1Position <= 6) {
        // Playoff contention - could go either way
        availableLeagues = [
          { value: 'championship', label: 'EFL Championship (Promoted)' },
          { value: 'eflLeague1', label: 'EFL League 1 (Playoff Failure)' }
        ];
        positions = Array.from({length: 24}, (_, i) => i + 1);
      } else if (prevScenario.eflLeague1Position >= 22) {
        // Relegation zone
        availableLeagues = [
          { value: 'eflLeague1', label: 'EFL League 1 (Survived)' },
          { value: 'eflLeague2', label: 'EFL League 2 (Relegated)' }
        ];
        positions = Array.from({length: 24}, (_, i) => i + 1);
      } else {
        // Mid-table - staying in League 1
        availableLeagues = [{ value: 'eflLeague1', label: 'EFL League 1' }];
        positions = Array.from({length: 24}, (_, i) => i + 1);
      }
      
      // European competitions only if won FA Cup in 2025
      if (prevScenario.faCupProgress === 'Winner') {
        europeanComps = ['', 'Conference League Group', 'Conference League Knockout', 'Conference League Quarter-Final', 'Conference League Semi-Final', 'Conference League Final', 'Conference League Winner'];
      }
      
      return {
        leagues: availableLeagues,
        positions: positions,
        europeanComps: europeanComps,
        domesticCups: ['', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner']
      };
    }
    
    if (year === 2027) {
      // Determine league based on 2026 performance
      let availableLeagues = [];
      let positions = [];
      let europeanComps = [];
      
      const prev2026 = currentScenario[2026];
      
      if (prev2026.league === 'championship') {
        if (prev2026.position <= 2) {
          // Automatic promotion to Premier League
          availableLeagues = [{ value: 'premierLeague', label: 'Premier League' }];
          positions = Array.from({length: 20}, (_, i) => i + 1);
          europeanComps = ['', 'Champions League Group', 'Champions League R16', 'Champions League Quarter-Final', 'Champions League Semi-Final', 'Champions League Final', 'Champions League Winner',
                          'Europa League Group', 'Europa League R16', 'Europa League Quarter-Final', 'Europa League Semi-Final', 'Europa League Final', 'Europa League Winner',
                          'Conference League Group', 'Conference League R16', 'Conference League Quarter-Final', 'Conference League Semi-Final', 'Conference League Final', 'Conference League Winner'];
        } else if (prev2026.position <= 6) {
          // Playoff contention
          availableLeagues = [
            { value: 'premierLeague', label: 'Premier League (Promoted)' },
            { value: 'championship', label: 'EFL Championship (Playoff Failure)' }
          ];
          positions = prev2026.league === 'premierLeague' ? Array.from({length: 20}, (_, i) => i + 1) : Array.from({length: 24}, (_, i) => i + 1);
        } else if (prev2026.position >= 22) {
          // Relegation from Championship
          availableLeagues = [
            { value: 'championship', label: 'EFL Championship (Survived)' },
            { value: 'eflLeague1', label: 'EFL League 1 (Relegated)' }
          ];
          positions = Array.from({length: 24}, (_, i) => i + 1);
        } else {
          // Mid-table Championship
          availableLeagues = [{ value: 'championship', label: 'EFL Championship' }];
          positions = Array.from({length: 24}, (_, i) => i + 1);
        }
      } else if (prev2026.league === 'eflLeague1') {
        // Similar logic for League 1 teams
        availableLeagues = [{ value: 'eflLeague1', label: 'EFL League 1' }];
        positions = Array.from({length: 24}, (_, i) => i + 1);
      }
      
      // European competitions based on cup wins or league position
      if (prev2026.faCupProgress === 'Winner' || (prev2026.league === 'premierLeague' && prev2026.position <= 7)) {
        europeanComps = ['', 'Champions League Group', 'Champions League R16', 'Champions League Quarter-Final', 'Champions League Semi-Final', 'Champions League Final', 'Champions League Winner',
                        'Europa League Group', 'Europa League R16', 'Europa League Quarter-Final', 'Europa League Semi-Final', 'Europa League Final', 'Europa League Winner',
                        'Conference League Group', 'Conference League R16', 'Conference League Quarter-Final', 'Conference League Semi-Final', 'Conference League Final', 'Conference League Winner'];
      }
      
      return {
        leagues: availableLeagues,
        positions: positions,
        europeanComps: europeanComps,
        domesticCups: ['', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Quarter-Final', 'Semi-Final', 'Final', 'Winner']
      };
    }
    
    return { leagues: [], positions: [], europeanComps: [], domesticCups: [] };
  };

  // Calculate financial impact for each year with realistic league progression
  const calculateYearlyFinancials = (yearData, year) => {
    let broadcasting = 0;
    let commercial = 8000;
    let matchday = 3000;
    
    // 2025: EFL League 1
    if (year === 2025) {
      const position = yearData.eflLeague1Position;
      broadcasting = 2500 - (position * 50); // League 1 base revenue
      commercial = 5000;
      matchday = 2500;
      
      // Promotion playoff bonus
      if (position <= 6) {
        broadcasting += 1000; // Playoff contention bonus
        commercial += 500;
      }
      
      // FA Cup progress bonus
      const faCupBonus = {
        'Round 3': 100, 'Round 4': 200, 'Round 5': 500,
        'Quarter-Final': 1000, 'Semi-Final': 2000,
        'Final': 3000, 'Winner': 5000
      };
      broadcasting += faCupBonus[yearData.faCupProgress] || 0;
      
      return {
        broadcasting: Math.round(broadcasting),
        commercial: Math.round(commercial),
        matchday: Math.round(matchday),
        total: Math.round(broadcasting + commercial + matchday)
      };
    }
    
    // Continue with 2026 and 2027 calculations...
    if (year === 2026) {
      if (yearData.league === 'championship') {
        const position = yearData.position;
        broadcasting = 8000 - (position * 150); // Championship revenue
        commercial = 12000 + (position <= 6 ? 3000 : 0); // Promotion contention bonus
        matchday = 6000 + (position <= 2 ? 2000 : 0); // Automatic promotion bonus
        
        // Parachute payment if relegated from Premier League
        if (yearData.parachutePayment) {
          broadcasting += 15000;
        }
        
      } else if (yearData.league === 'eflLeague1') {
        // Stayed in League 1
        const position = yearData.position;
        broadcasting = 2500 - (position * 50);
        commercial = 5000;
        matchday = 2500;
      } else if (yearData.league === 'eflLeague2') {
        // Relegated to League 2
        broadcasting = 1500;
        commercial = 3000;
        matchday = 1500;
      }
      
      // European competition revenue (if won FA Cup in 2025)
      const confLeagueBonus = {
        'Conference League Group': 1500,
        'Conference League Knockout': 2000,
        'Conference League Quarter-Final': 3000,
        'Conference League Semi-Final': 4000,
        'Conference League Final': 5000,
        'Conference League Winner': 7000
      };
      broadcasting += confLeagueBonus[yearData.conferenceLeague] || 0;
      
      return {
        broadcasting: Math.round(broadcasting),
        commercial: Math.round(commercial),
        matchday: Math.round(matchday),
        total: Math.round(broadcasting + commercial + matchday)
      };
    }
    
    // 2027: Premier League, Championship, or League 1 based on 2026 performance
    if (year === 2027) {
      if (yearData.league === 'premierLeague') {
        const position = yearData.position;
        broadcasting = 100000 + (21 - position) * 2000; // Premier League revenue
        commercial = 25000 + (position <= 6 ? 15000 : 0); // European qualification bonus
        matchday = 15000 + (position <= 4 ? 10000 : 0); // Top 4 attendance bonus
        
        // Champions League revenue
        const clBonus = {
          'Champions League Group': 15000, 'Champions League R16': 25000,
          'Champions League Quarter-Final': 35000, 'Champions League Semi-Final': 50000,
          'Champions League Final': 65000, 'Champions League Winner': 85000
        };
        broadcasting += clBonus[yearData.championsLeague] || 0;
        
        // Europa League revenue
        const elBonus = {
          'Europa League Group': 8000, 'Europa League R16': 12000,
          'Europa League Quarter-Final': 18000, 'Europa League Semi-Final': 25000,
          'Europa League Final': 35000, 'Europa League Winner': 45000
        };
        broadcasting += elBonus[yearData.europaLeague] || 0;
        
        // Conference League revenue
        const confBonus = {
          'Conference League Group': 3000, 'Conference League R16': 5000,
          'Conference League Quarter-Final': 8000, 'Conference League Semi-Final': 12000,
          'Conference League Final': 18000, 'Conference League Winner': 25000
        };
        broadcasting += confBonus[yearData.conferenceLeague] || 0;
        
      } else if (yearData.league === 'championship') {
        const position = yearData.position;
        broadcasting = 8000 - (position * 150);
        commercial = 12000 + (position <= 6 ? 3000 : 0);
        matchday = 6000 + (position <= 2 ? 2000 : 0);
        
      } else if (yearData.league === 'eflLeague1') {
        const position = yearData.position;
        broadcasting = 2500 - (position * 50);
        commercial = 5000;
        matchday = 2500;
      }
      
      return {
        broadcasting: Math.round(broadcasting),
        commercial: Math.round(commercial),
        matchday: Math.round(matchday),
        total: Math.round(broadcasting + commercial + matchday)
      };
    }
    
    return {
      broadcasting: 0,
      commercial: 0,
      matchday: 0,
      total: 0
    };
  };

  // Calculate all years' financials
  const financialData = {
    2025: calculateYearlyFinancials(currentScenario[2025], 2025),
    2026: calculateYearlyFinancials(currentScenario[2026], 2026),
    2027: calculateYearlyFinancials(currentScenario[2027], 2027)
  };

  // Calculate total 3-year revenue
  const totalRevenue = financialData[2025].total + financialData[2026].total + financialData[2027].total;

  // Calculate compliance metrics based on total revenue
  const calculateCompliance = () => {
    const avgRevenue = totalRevenue / 3;
    
    const psr = Math.max(0, avgRevenue * 0.15 - 10000);
    const footballEarnings = Math.max(0, avgRevenue * 0.18 - 5000);
    const squadCostRatio = Math.min(70, (avgRevenue / 2000));
    
    return {
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

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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

  const updateScenario = (year, field, value) => {
    setCurrentScenario(prev => {
      const newScenario = {
        ...prev,
        [year]: {
          ...prev[year],
          [field]: value
        }
      };
      
      // Auto-update subsequent years based on realistic progression
      if (year === 2025) {
        // Update 2026 based on 2025 League 1 performance
        const pos2025 = parseInt(value);
        if (field === 'eflLeague1Position') {
          if (pos2025 <= 2) {
            // Automatic promotion
            newScenario[2026] = { ...newScenario[2026], league: 'championship', position: 10 };
          } else if (pos2025 <= 6) {
            // Playoff contention
            newScenario[2026] = { ...newScenario[2026], league: 'championship', position: 15 };
          } else if (pos2025 >= 22) {
            // Relegation battle
            newScenario[2026] = { ...newScenario[2026], league: 'eflLeague1', position: 18 };
          } else {
            // Mid-table
            newScenario[2026] = { ...newScenario[2026], league: 'eflLeague1', position: 12 };
          }
        }
      }
      
      if (year === 2026) {
        // Update 2027 based on 2026 performance
        if (field === 'league' || field === 'position') {
          const league2026 = newScenario[2026].league;
          const pos2026 = newScenario[2026].position;
          
          if (league2026 === 'championship' && pos2026 <= 2) {
            // Automatic promotion to Premier League
            newScenario[2027] = { ...newScenario[2027], league: 'premierLeague', position: 15 };
          } else if (league2026 === 'championship' && pos2026 <= 6) {
            // Playoff promotion chance
            newScenario[2027] = { ...newScenario[2027], league: 'premierLeague', position: 17 };
          } else if (league2026 === 'championship') {
            // Stay in Championship
            newScenario[2027] = { ...newScenario[2027], league: 'championship', position: 12 };
          }
        }
      }
      
      return newScenario;
    });
  };

  const setPresetScenario = (preset) => {
    switch (preset) {
      case 'base':
        setCurrentScenario({
          2025: { eflLeague1Position: 3, faCupProgress: 'Round 4', eflCupProgress: '', relegatedFromChampionship: false },
          2026: { league: 'championship', position: 8, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false },
          2027: { league: 'premierLeague', position: 15, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '' }
        });
        break;
      case 'low':
        setCurrentScenario({
          2025: { eflLeague1Position: 20, faCupProgress: '', eflCupProgress: '', relegatedFromChampionship: false },
          2026: { league: 'eflLeague1', position: 16, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false },
          2027: { league: 'eflLeague1', position: 18, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '' }
        });
        break;
      case 'high':
        setCurrentScenario({
          2025: { eflLeague1Position: 1, faCupProgress: 'Winner', eflCupProgress: '', relegatedFromChampionship: false },
          2026: { league: 'championship', position: 2, championsLeague: '', europaLeague: '', conferenceLeague: 'Conference League Semi-Final', faCupProgress: '', eflCupProgress: '', parachutePayment: false },
          2027: { league: 'premierLeague', position: 6, championsLeague: '', europaLeague: 'Europa League Group', conferenceLeague: '', faCupProgress: '', eflCupProgress: '' }
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
                <p className="text-blue-200">3-Year Realistic Progression Analysis (League 1 → Championship → Premier League)</p>
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
                Season: 2024/25 • Week 23 • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Preset Buttons */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setPresetScenario('base')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:bg-white/10 hover:border-white/30 text-left ${
              'border-white/20 bg-white/5'
            }`}
          >
            <div className="flex items-center mb-3">
              <Crosshair className="w-6 h-6 mr-3 text-blue-400" />
              <h4 className="font-semibold text-lg">Base Scenario</h4>
            </div>
            <p className="text-blue-200 text-sm mb-2">Steady progression through the leagues</p>
            <div className="text-xs text-gray-300">
              League 1 (3rd) → Championship (8th) → Premier League (15th)
            </div>
            <div className="mt-3 text-2xl font-bold text-blue-400">
              £{((15000 + 26000 + 140000) / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-blue-200">3-Year Revenue Estimate</div>
          </button>
          
          <button
            onClick={() => setPresetScenario('low')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:bg-white/10 hover:border-white/30 text-left ${
              'border-white/20 bg-white/5'
            }`}
          >
            <div className="flex items-center mb-3">
              <Shield className="w-6 h-6 mr-3 text-yellow-400" />
              <h4 className="font-semibold text-lg">Conservative Scenario</h4>
            </div>
            <p className="text-yellow-200 text-sm mb-2">Slow progression, staying in lower leagues</p>
            <div className="text-xs text-gray-300">
              League 1 (20th) → League 1 (16th) → League 1 (18th)
            </div>
            <div className="mt-3 text-2xl font-bold text-yellow-400">
              £{((8000 + 8000 + 8000) / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-yellow-200">3-Year Revenue Estimate</div>
          </button>

          <button
            onClick={() => setPresetScenario('high')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:bg-white/10 hover:border-white/30 text-left ${
              'border-white/20 bg-white/5'
            }`}
          >
            <div className="flex items-center mb-3">
              <Trophy className="w-6 h-6 mr-3 text-green-400" />
              <h4 className="font-semibold text-lg">Optimistic Scenario</h4>
            </div>
            <p className="text-green-200 text-sm mb-2">Rapid ascent with European football</p>
            <div className="text-xs text-gray-300">
              League 1 (1st) + FA Cup → Championship (2nd) → Premier League (6th) + Europa
            </div>
            <div className="mt-3 text-2xl font-bold text-green-400">
              £{((12000 + 35000 + 175000) / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-green-200">3-Year Revenue Estimate</div>
          </button>
        </div>

        {/* Scenario Builder */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Realistic 3-Year Progression Analysis
            </h3>
            
            <div className="grid grid-cols-3 gap-8">
              {[2025, 2026, 2027].map(year => {
                const options = getAvailableOptions(year);
                const yearData = currentScenario[year as keyof typeof currentScenario];
                
                return (
                  <div key={year} className="space-y-4">
                    <h4 className="text-lg font-semibold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {year === 2025 ? '2025-26 Season' : year === 2026 ? '2026-27 Season' : '2027-28 Season'}
                    </h4>
                    
                    <div className="space-y-3">
                      {year === 2025 && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">EFL League 1 Position</label>
                            <select 
                              value={yearData.eflLeague1Position}
                              onChange={(e) => updateScenario(year, 'eflLeague1Position', parseInt(e.target.value))}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.positions.map(pos => (
                                <option key={pos} value={pos} className="bg-slate-800">
                                  {pos}. {pos <= 2 ? '(Auto Promotion)' : pos <= 6 ? '(Playoffs)' : pos >= 22 ? '(Relegation)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">FA Cup Progress</label>
                            <select 
                              value={yearData.faCupProgress}
                              onChange={(e) => updateScenario(year, 'faCupProgress', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.domesticCups.map(stage => (
                                <option key={stage} value={stage} className="bg-slate-800">
                                  {stage || 'Early Exit'}{stage === 'Winner' ? ' (Conference League!)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">EFL Cup Progress</label>
                            <select 
                              value={yearData.eflCupProgress}
                              onChange={(e) => updateScenario(year, 'eflCupProgress', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.domesticCups.map(stage => (
                                <option key={stage} value={stage} className="bg-slate-800">
                                  {stage || 'Early Exit'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {year === 2026 && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">League Division</label>
                            <select 
                              value={yearData.league}
                              onChange={(e) => updateScenario(year, 'league', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.leagues.map(league => (
                                <option key={league.value} value={league.value} className="bg-slate-800">
                                  {league.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">League Position</label>
                            <select 
                              value={yearData.position}
                              onChange={(e) => updateScenario(year, 'position', parseInt(e.target.value))}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.positions.map(pos => (
                                <option key={pos} value={pos} className="bg-slate-800">
                                  {pos}. {yearData.league === 'championship' && pos <= 2 ? '(Auto Promotion)' : 
                                         yearData.league === 'championship' && pos <= 6 ? '(Playoffs)' : 
                                         pos >= 22 ? '(Relegation)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {options.europeanComps.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-blue-200 block mb-1">Conference League</label>
                              <select 
                                value={yearData.conferenceLeague}
                                onChange={(e) => updateScenario(year, 'conferenceLeague', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {options.europeanComps.map(comp => (
                                  <option key={comp} value={comp} className="bg-slate-800">
                                    {comp || 'Not Participating'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </>
                      )}

                      {year === 2027 && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">League Division</label>
                            <select 
                              value={yearData.league}
                              onChange={(e) => updateScenario(year, 'league', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.leagues.map(league => (
                                <option key={league.value} value={league.value} className="bg-slate-800">
                                  {league.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-blue-200 block mb-1">League Position</label>
                            <select 
                              value={yearData.position}
                              onChange={(e) => updateScenario(year, 'position', parseInt(e.target.value))}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {options.positions.map(pos => (
                                <option key={pos} value={pos} className="bg-slate-800">
                                  {pos}. {yearData.league === 'premierLeague' && pos <= 4 ? '(Champions League)' : 
                                         yearData.league === 'premierLeague' && pos <= 6 ? '(Europa League)' : 
                                         yearData.league === 'premierLeague' && pos <= 7 ? '(Conference League)' : 
                                         pos >= 18 ? '(Relegation)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {options.europeanComps.length > 0 && yearData.league === 'premierLeague' && (
                            <>
                              <div>
                                <label className="text-sm font-medium text-blue-200 block mb-1">Champions League</label>
                                <select 
                                  value={yearData.championsLeague}
                                  onChange={(e) => updateScenario(year, 'championsLeague', e.target.value)}
                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {['', 'Champions League Group', 'Champions League R16', 'Champions League Quarter-Final', 'Champions League Semi-Final', 'Champions League Final', 'Champions League Winner'].map(comp => (
                                    <option key={comp} value={comp} className="bg-slate-800">
                                      {comp || 'Not Qualified'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-blue-200 block mb-1">Europa League</label>
                                <select 
                                  value={yearData.europaLeague}
                                  onChange={(e) => updateScenario(year, 'europaLeague', e.target.value)}
                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {['', 'Europa League Group', 'Europa League R16', 'Europa League Quarter-Final', 'Europa League Semi-Final', 'Europa League Final', 'Europa League Winner'].map(comp => (
                                    <option key={comp} value={comp} className="bg-slate-800">
                                      {comp || 'Not Qualified'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Year Revenue Summary */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-white/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">£{(financialData[year as keyof typeof financialData].total / 1000).toFixed(0)}k</div>
                        <div className="text-blue-200 text-sm">Total Revenue</div>
                        <div className="text-xs text-gray-300 mt-1">
                          {year === 2025 ? 'EFL League 1' : 
                           year === 2026 ? (yearData.league === 'championship' ? 'Championship' : yearData.league === 'eflLeague1' ? 'League 1' : 'League 2') :
                           yearData.league === 'premierLeague' ? 'Premier League' : yearData.league === 'championship' ? 'Championship' : 'League 1'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Projection Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              3-Year Revenue Projection
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="year" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${(value/1000).toFixed(0)}k`, '']}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGrad)" name="Total Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              Revenue Breakdown by Source
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="year" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${(value/1000).toFixed(0)}k`, '']}
                />
                <Legend />
                <Bar dataKey="broadcasting" stackId="a" fill="#3b82f6" name="Broadcasting" />
                <Bar dataKey="commercial" stackId="a" fill="#10b981" name="Commercial" />
                <Bar dataKey="matchday" stackId="a" fill="#f59e0b" name="Matchday" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p className="mb-2">
            🚀 <strong>3-Year Progression Analysis</strong> - Interactive modeling of realistic league progression from EFL League 1 to Premier League
          </p>
          <p>
            Adjust any season parameters above and watch revenue projections and compliance metrics update in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubDNAFinancialDashboard; 