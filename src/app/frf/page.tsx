"use client"

import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Target, Trophy, DollarSign, Users, Settings, Play, Pause, Crown, Shield, Crosshair } from 'lucide-react';

type ScenarioKey = 'base' | 'low' | 'high';

interface ComplianceData {
  value: number;
  status: string;
  threshold: number;
}



const ClubDNAFinancialDashboard = () => {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('base');
  const [isLiveMode, setIsLiveMode] = useState(false);

  const [currentDate, setCurrentDate] = useState<string>('');

  // Extracted financial model data from the Excel file
  const financialModel = {
    scenarios: {
      base: {
        name: "Base Performance",
        description: "Premier League 4th, Champions League Qualification",
        premierLeaguePosition: 4,
        championsLeague: "League Stage",
        europaLeague: "Quarter-Final",
        revenue: {
          broadcasting: 130000,
          commercial: 25000,
          matchday: 12000,
          total: 167000
        },
        compliance: {
          psr: { value: 15000, status: "compliant", threshold: 105000 },
          footballEarnings: { value: 4291, status: "compliant", threshold: 60000 },
          squadCostRatio: { value: 0, status: "excellent", threshold: 70 }
        },
        players: {
          jamesWilliams: { goals: 28, bonus: 56000 },
          stuartGreen: { cleanSheets: 18, bonus: 27000 },
          chrisTuson: { appearances: 34, bonus: 17000 },
          andyClarke: { appearances: 32, bonus: 16000 },
          philClarke: { appearances: 29, bonus: 14500 }
        }
      },
      low: {
        name: "Conservative Scenario",
        description: "Premier League 15th, Europa League Qualification",
        premierLeaguePosition: 15,
        championsLeague: "Play-Off Exit",
        europaLeague: "Play-Off",
        revenue: {
          broadcasting: 85000,
          commercial: 15000,
          matchday: 8000,
          total: 108000
        },
        compliance: {
          psr: { value: 190147, status: "monitor", threshold: 105000 },
          footballEarnings: { value: 194438, status: "caution", threshold: 60000 },
          squadCostRatio: { value: 0.7, status: "good", threshold: 70 }
        },
        players: {
          jamesWilliams: { goals: 22, bonus: 44000 },
          stuartGreen: { cleanSheets: 12, bonus: 18000 },
          chrisTuson: { appearances: 28, bonus: 14000 },
          andyClarke: { appearances: 25, bonus: 12500 },
          philClarke: { appearances: 22, bonus: 11000 }
        }
      },
      high: {
        name: "Championship Victory",
        description: "Premier League 1st, Champions League Winners",
        premierLeaguePosition: 1,
        championsLeague: "Champions",
        europaLeague: "N/A",
        revenue: {
          broadcasting: 180000,
          commercial: 55000,
          matchday: 25000,
          total: 260000
        },
        compliance: {
          psr: { value: 229582, status: "monitor", threshold: 105000 },
          footballEarnings: { value: 233873, status: "caution", threshold: 60000 },
          squadCostRatio: { value: 0.7, status: "good", threshold: 70 }
        },
        players: {
          jamesWilliams: { goals: 42, bonus: 84000 },
          stuartGreen: { cleanSheets: 24, bonus: 36000 },
          chrisTuson: { appearances: 38, bonus: 19000 },
          andyClarke: { appearances: 36, bonus: 18000 },
          philClarke: { appearances: 35, bonus: 17500 }
        }
      }
    },
    projections: {
      base: [
        { year: 'FY 2025', revenue: 167000, costs: 85000, profit: 82000, psr: 15000 },
        { year: 'FY 2026', revenue: 175000, costs: 90000, profit: 85000, psr: 42000 },
        { year: 'FY 2027', revenue: 183000, costs: 95000, profit: 88000, psr: 78000 },
        { year: 'FY 2028', revenue: 191000, costs: 100000, profit: 91000, psr: 115000 }
      ],
      low: [
        { year: 'FY 2025', revenue: 108000, costs: 80000, profit: 28000, psr: 190147 },
        { year: 'FY 2026', revenue: 112000, costs: 85000, profit: 27000, psr: 246987 },
        { year: 'FY 2027', revenue: 115000, costs: 90000, profit: 25000, psr: 291232 },
        { year: 'FY 2028', revenue: 118000, costs: 95000, profit: 23000, psr: 314373 }
      ],
      high: [
        { year: 'FY 2025', revenue: 260000, costs: 180000, profit: 80000, psr: 229582 },
        { year: 'FY 2026', revenue: 285000, costs: 185000, profit: 100000, psr: 305425 },
        { year: 'FY 2027', revenue: 295000, costs: 190000, profit: 105000, psr: 336834 },
        { year: 'FY 2028', revenue: 305000, costs: 195000, profit: 110000, psr: 297289 }
      ]
    }
  };

  const currentScenario = financialModel.scenarios[activeScenario];
  const currentProjections = financialModel.projections[activeScenario];

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
    { name: 'Broadcasting', value: currentScenario.revenue.broadcasting, fill: '#3b82f6' },
    { name: 'Commercial', value: currentScenario.revenue.commercial, fill: '#10b981' },
    { name: 'Matchday', value: currentScenario.revenue.matchday, fill: '#f59e0b' }
  ];

  const playerBonuses = [
    { name: 'James Williams', position: 'Striker', metric: `${currentScenario.players.jamesWilliams.goals} goals`, bonus: currentScenario.players.jamesWilliams.bonus },
    { name: 'Stuart Green', position: 'Goalkeeper', metric: `${currentScenario.players.stuartGreen.cleanSheets} clean sheets`, bonus: currentScenario.players.stuartGreen.bonus },
    { name: 'Chris Tuson', position: 'Midfielder', metric: `${currentScenario.players.chrisTuson.appearances} apps`, bonus: currentScenario.players.chrisTuson.bonus },
    { name: 'Andy Clarke', position: 'Defender', metric: `${currentScenario.players.andyClarke.appearances} apps`, bonus: currentScenario.players.andyClarke.bonus },
    { name: 'Phil Clarke', position: 'Midfielder', metric: `${currentScenario.players.philClarke.appearances} apps`, bonus: currentScenario.players.philClarke.bonus }
  ];



  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB'));
  }, []);

  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        // Simulate live updates with small variations
        // In a real implementation, this would connect to live data feeds
      }, 1000);
      return () => clearInterval(interval);
    }
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
            <a href="/frf" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              FRF Analysis
            </a>
            <a href="/frf2" className="text-white/70 hover:text-white transition-colors">
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
        {/* Scenario Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(financialModel.scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setActiveScenario(key as ScenarioKey)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  activeScenario === key
                    ? 'border-blue-400 bg-blue-500/20 shadow-xl scale-105'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{scenario.name}</h3>
                  <div className="text-2xl">
                    {key === 'high' ? <Crown className="w-8 h-8 text-yellow-400" /> : 
                     key === 'low' ? <Shield className="w-8 h-8 text-orange-400" /> : 
                     <Crosshair className="w-8 h-8 text-blue-400" />}
                  </div>
                </div>
                <p className="text-blue-200 mb-4">{scenario.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>League Position:</span>
                    <span className="font-semibold">{scenario.premierLeaguePosition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-semibold">£{(scenario.revenue.total / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PSR Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(scenario.compliance.psr.status)}`}>
                      {scenario.compliance.psr.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
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
                <div className="text-2xl font-bold">£{(currentScenario.revenue.total / 1000).toFixed(0)}k</div>
                <div className="text-blue-200 text-sm">Total Revenue</div>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((currentScenario.revenue.total / 300000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentScenario.premierLeaguePosition}</div>
                <div className="text-green-200 text-sm">League Position</div>
              </div>
            </div>
            <div className="text-xs text-green-200">
              Champions League: {currentScenario.championsLeague}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">£{(currentScenario.compliance.psr.value / 1000).toFixed(0)}k</div>
                <div className="text-yellow-200 text-sm">PSR Assessment</div>
              </div>
            </div>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(currentScenario.compliance.psr.status)}`}>
              {getStatusIcon(currentScenario.compliance.psr.status)}
              <span>{currentScenario.compliance.psr.status}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentScenario.compliance.squadCostRatio.value}%</div>
                <div className="text-purple-200 text-sm">Squad Cost Ratio</div>
              </div>
            </div>
            <div className="text-xs text-purple-200">
              Threshold: {currentScenario.compliance.squadCostRatio.threshold}%
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Financial Projections */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              4-Year Financial Projection
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentProjections}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="year" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" tickFormatter={(value) => `£${(Number(value)/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${(Number(value)/1000).toFixed(0)}k`, '']}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGrad)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#profitGrad)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
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
                  label={({ name, value }) => `${name}: £${(value/1000).toFixed(0)}k`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(currentScenario.compliance).map(([key, data]) => (
              <div key={key} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor((data as ComplianceData).status)}`}>
                    {getStatusIcon((data as ComplianceData).status)}
                    <span>{(data as ComplianceData).status}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current:</span>
                    <span className="font-semibold">£{((data as ComplianceData).value / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Threshold:</span>
                    <span className="font-semibold">{key === 'squadCostRatio' ? `${(data as ComplianceData).threshold}%` : `£${((data as ComplianceData).threshold / 1000).toFixed(0)}k`}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        (data as ComplianceData).status === 'compliant' || (data as ComplianceData).status === 'excellent' || (data as ComplianceData).status === 'good' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(((data as ComplianceData).value / (data as ComplianceData).threshold) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
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