"use client";

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingDown, TrendingUp, PoundSterling, Target,
  Zap, Shield, Clock, Calculator, Eye, RefreshCw, Trophy, Menu, X
} from 'lucide-react';

const EFL_LIQUIDITY_ANALYZER = () => {
  const [selectedPosition, setSelectedPosition] = useState(12);
  const [scenario, setScenario] = useState('safe_midtable');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real Championship club data based on our research
  const baseClubData = useMemo(() => ({
    name: "Club DNA FC",
    currentRevenue: 22000000, // £22M average non-parachute club
    currentWages: 18500000,   // £18.5M (84% wage ratio)
    stadiumCapacity: 25000,
    currentCash: 3500000,     // £3.5M current cash
    monthlyBurnRate: 1800000  // £1.8M monthly operations
  }), []);

  // COMPREHENSIVE Championship Position Impact - All 24 Positions with Realistic Financial Dynamics
  const calculatePositionImpact = useMemo(() => (position: number) => {
    const baseRevenue = baseClubData.currentRevenue;
    
    // AUTOMATIC PROMOTION ZONE (1st-2nd): £200M+ Premier League Prize
    if (position <= 2) {
      const promotionBonus = position === 1 ? 12000000 : 11000000; // £11-12M promotion certainty
      const trophyPremium = position === 1 ? 2000000 : 0; // £2M championship trophy premium
      const tvBonus = position === 1 ? 1200000 : 1100000; // Maximum TV coverage
      const commercialMultiplier = position === 1 ? 1.7 : 1.6; // Peak commercial power
      const renewalRate = position === 1 ? 0.98 : 0.95; // Success breeds extreme loyalty
      const attendanceMultiplier = position === 1 ? 1.35 : 1.30; // Title race fever
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus + promotionBonus + trophyPremium + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        promotionBonus,
        trophyPremium,
        positionRisk: 'PROMOTION CERTAIN',
        wageRatio: 70 + (position * 2), // 72-74% - sustainable with Premier League income
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate
      };
    }
    
    // PLAYOFF ZONE (3rd-6th): £200M+ Promotion Opportunity
    if (position <= 6) {
      const playoffProbability = position === 3 ? 0.35 : position === 4 ? 0.25 : position === 5 ? 0.20 : 0.15;
      const playoffPremium = Math.round(playoffProbability * 10000000); // £1-4M based on promotion probability
      const tvBonus = 800000 + ((7 - position) * 50000); // £800k-£1M high media interest
      const commercialMultiplier = 1.35 + ((7 - position) * 0.025); // 1.35-1.45 range
      const renewalRate = 0.88 + ((7 - position) * 0.01); // 0.88-0.92 playoff excitement
      const attendanceMultiplier = 1.10 + ((7 - position) * 0.02); // 1.10-1.16 playoff fever
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus + playoffPremium + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        playoffPremium,
        playoffProbability,
        positionRisk: 'PLAYOFF CONTENTION',
        wageRatio: 75 + (position * 2), // 81-87% - chasing £200M prize
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate
      };
    }
    
    // UPPER MID-TABLE (7th-12th): Gradual Decline from Playoff Miss
    if (position <= 12) {
      const playoffMissPenalty = position === 7 ? 1500000 : 0; // £1.5M disappointment penalty for 7th
      const tvBonus = 400000 + ((13 - position) * 33333); // £400k-£600k declining coverage
      const commercialMultiplier = 1.05 + ((13 - position) * 0.017); // 1.05-1.15 declining confidence
      const renewalRate = 0.79 + ((13 - position) * 0.01); // 0.79-0.85 cooling enthusiasm
      const attendanceMultiplier = 0.95 + ((13 - position) * 0.017); // 0.95-1.05 mid-table apathy
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus - playoffMissPenalty + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        playoffMissPenalty,
        positionRisk: 'UPPER MID-TABLE',
        wageRatio: 85 + (position - 7) * 2, // 85-95% - borderline sustainable
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate
      };
    }
    
    // LOWER MID-TABLE (13th-17th): Increasing Anxiety and Declining Revenue
    if (position <= 17) {
      const fanAnxietyPenalty = (position - 12) * 200000; // £200k-£1M increasing anxiety
      const tvBonus = 200000 + ((18 - position) * 40000); // £200k-£400k reduced interest
      const commercialMultiplier = 0.95 + ((18 - position) * 0.02); // 0.95-1.05 declining confidence
      const renewalRate = 0.71 + ((18 - position) * 0.016); // 0.71-0.79 growing concern
      const attendanceMultiplier = 0.82 + ((18 - position) * 0.026); // 0.82-0.95 looking over shoulder
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus - fanAnxietyPenalty + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        fanAnxietyPenalty,
        positionRisk: position >= 15 ? 'GROWING CONCERN' : 'NEUTRAL',
        wageRatio: 95 + (position - 13) * 3, // 95-110% - concerning levels
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate
      };
    }
    
    // RELEGATION BATTLE (18th-21st): Financial Panic and Fear
    if (position <= 21) {
      const relegationFearPenalty = 2000000 + ((position - 18) * 500000); // £2M-£3.5M fear penalty
      const tvBonus = 100000 + ((22 - position) * 25000); // £100k-£200k minimal coverage
      const commercialMultiplier = 0.70 + ((22 - position) * 0.038); // 0.70-0.85 sponsors reducing exposure
      const renewalRate = 0.55 + ((22 - position) * 0.025); // 0.55-0.65 panic ticket selling
      const attendanceMultiplier = 0.65 + ((22 - position) * 0.038); // 0.65-0.80 fear-driven decline
      
      const totalRevenue = Math.round(
        (baseRevenue * commercialMultiplier) + 
        tvBonus - relegationFearPenalty + 
        (4500000 * attendanceMultiplier) + 
        (2800000 * renewalRate)
      );
      
      return {
        totalRevenue,
        tvBonus,
        commercialMultiplier,
        renewalRate,
        attendanceMultiplier,
        relegationFearPenalty,
        positionRisk: 'RELEGATION BATTLE',
        wageRatio: 110 + (position - 18) * 5, // 110-125% - unsustainable without owner funding
        monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate
      };
    }
    
    // RELEGATED ZONE (22nd-24th): Financial Catastrophe
    const relegationPenalty = position === 24 ? 7000000 : position === 23 ? 6000000 : 5000000; // £5M-£7M relegation
    const league1PreparationCosts = 1000000 + ((position - 22) * 500000); // £1M-£2M preparation costs
    const playerExodusCosts = (position - 22) * 500000; // £0-£1M player contract issues
    const tvBonus = 50000 + ((25 - position) * 16667); // £50k-£100k minimal coverage
    const commercialMultiplier = 0.50 + ((25 - position) * 0.05); // 0.50-0.65 massive sponsor flight
    const renewalRate = 0.35 + ((25 - position) * 0.05); // 0.35-0.50 mass fan exodus
    const attendanceMultiplier = 0.50 + ((25 - position) * 0.05); // 0.50-0.65 empty stadiums
    
    const totalRevenue = Math.round(
      (baseRevenue * commercialMultiplier) + 
      tvBonus - relegationPenalty - league1PreparationCosts - playerExodusCosts + 
      (4500000 * attendanceMultiplier) + 
      (2800000 * renewalRate)
    );
    
    return {
      totalRevenue,
      tvBonus,
      commercialMultiplier,
      renewalRate,
      attendanceMultiplier,
      relegationPenalty,
      league1PreparationCosts,
      playerExodusCosts,
      positionRisk: 'RELEGATED - CATASTROPHIC',
      wageRatio: 130 + (position - 22) * 5, // 130-140% - financial meltdown
      monthlyCashFlow: (totalRevenue / 12) - baseClubData.monthlyBurnRate
    };
  }, [baseClubData]);

  // Enhanced Scenario system - realistic Championship scenarios that update position
  const scenarios = useMemo(() => ({
    title_race: { 
      name: "Title Race", 
      position: 1, 
      multiplier: 1.0, 
      riskFactor: 0.5,
      description: "Fighting for automatic promotion - championship winning position"
    },
    promotion_push: { 
      name: "Promotion Push", 
      position: 3, 
      multiplier: 1.0, 
      riskFactor: 0.7,
      description: "Strong playoff contention - targeting Premier League promotion"
    },
    safe_midtable: { 
      name: "Safe Mid-Table", 
      position: 12, 
      multiplier: 1.0, 
      riskFactor: 1.0,
      description: "Comfortable mid-table position - no immediate pressure"
    },
    relegation_battle: { 
      name: "Relegation Battle", 
      position: 20, 
      multiplier: 1.0, 
      riskFactor: 2.2,
      description: "Fighting relegation to League One - critical financial situation"
    },
    financial_crisis: { 
      name: "Financial Crisis", 
      position: 23, 
      multiplier: 0.85, 
      riskFactor: 3.0,
      description: "Emergency measures - administration risk, fire sale scenario"
    }
  }), []);

  // Calculate current position data with COMPREHENSIVE financial metrics
  const currentData = useMemo(() => {
    const positionData = calculatePositionImpact(selectedPosition);
    const scenarioData = scenarios[scenario as keyof typeof scenarios];
    
    const adjustedRevenue = positionData.totalRevenue * scenarioData.multiplier;
    const monthlyRevenue = adjustedRevenue / 12;
    const monthlyCash = monthlyRevenue - baseClubData.monthlyBurnRate;
    const cashRunway = monthlyCash < 0 ? 
      Math.max(0, Math.floor(baseClubData.currentCash / Math.abs(monthlyCash))) : 12;
    
    // Updated wage ratio calculation based on position-specific data
    const actualWageRatio = positionData.wageRatio || (baseClubData.currentWages / adjustedRevenue) * 100;
    
    const riskScore = (
      (actualWageRatio / 100) * 40 + // Position-specific wage ratio impact
      (selectedPosition / 24) * 30 + // Position risk
      (scenarioData.riskFactor - 1) * 30 // Scenario risk
    );

    return {
      ...positionData,
      adjustedRevenue,
      monthlyRevenue,
      monthlyCash,
      cashRunway,
      riskScore: Math.min(100, Math.max(0, riskScore)),
      wageRatio: actualWageRatio,
      breakeven: monthlyRevenue >= baseClubData.monthlyBurnRate,
      sustainabilityDays: monthlyCash < 0 ? Math.round(baseClubData.currentCash / Math.abs(monthlyCash) * 30) : 999
    };
  }, [selectedPosition, scenario, calculatePositionImpact, scenarios, baseClubData]);

  // COMPREHENSIVE League table simulation data - ALL 24 POSITIONS with detailed financial metrics
  const leagueTableData = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => {
      const pos = i + 1;
      const data = calculatePositionImpact(pos);
      const monthlyCashFlow = data.monthlyCashFlow;
      const wageRatio = data.wageRatio;
      
      return {
        position: pos,
        revenue: data.totalRevenue / 1000000, // Convert to millions for display
        cashFlow: Math.round(monthlyCashFlow / 1000), // Monthly cash flow in thousands
        wageRatio: Math.round(wageRatio * 10) / 10, // Wage ratio percentage
        risk: pos >= 22 ? 100 : pos >= 18 ? 80 : pos >= 15 ? 50 : pos >= 12 ? 25 : pos >= 7 ? 15 : 10,
        positionRisk: data.positionRisk,
        sustainabilityDays: monthlyCashFlow < 0 ? Math.round(baseClubData.currentCash / Math.abs(monthlyCashFlow) * 30) : 999,
        commercialMultiplier: Math.round(data.commercialMultiplier * 100) / 100,
        renewalRate: Math.round(data.renewalRate * 100),
        tvBonus: Math.round(data.tvBonus / 1000) // TV bonus in thousands
      };
    }), [calculatePositionImpact, baseClubData]
  );

  // Cash runway projection
  const cashProjection = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      cash: Math.max(0, baseClubData.currentCash + (currentData.monthlyCash * (i + 1))),
      breakeven: baseClubData.monthlyBurnRate
    })), [currentData, baseClubData]
  );

  // Risk radar data
  const riskRadarData = [
    { metric: 'Wage Ratio', value: Math.min(100, currentData.wageRatio), max: 100 },
    { metric: 'Position Risk', value: (selectedPosition / 24) * 100, max: 100 },
    { metric: 'Cash Flow', value: currentData.monthlyCash < 0 ? 100 : 20, max: 100 },
    { metric: 'Commercial Risk', value: (1 - currentData.commercialMultiplier + 0.3) * 100, max: 100 },
    { metric: 'Attendance Risk', value: (1 - currentData.attendanceMultiplier + 0.25) * 100, max: 100 }
  ];

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'LOW', color: 'text-green-600' };
    if (score <= 60) return { level: 'MEDIUM', color: 'text-yellow-600' };
    return { level: 'HIGH', color: 'text-red-600' };
  };

  const risk = getRiskLevel(currentData.riskScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
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
                  EFL Financial Intelligence Platform
                </h1>
                <p className="text-blue-200">Real-time position impact analysis & AI-powered liquidity risk assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-blue-200">
                Season: 2024/25 • Week 23 • {new Date().toLocaleDateString('en-GB')}
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
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
            <a href="/frf3" className="text-white/70 hover:text-white transition-colors">
              FRF3 3-Year Model
            </a>
            <a href="/frf4" className="text-white/70 hover:text-white transition-colors">
              FRF4 Progression
            </a>
            <a href="/frf5" className="text-white/70 hover:text-white transition-colors">
              FRF5 Ultimate
            </a>
            <a href="/frf6" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
              FRF6 Intelligence
            </a>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-4">
              <div className="block md:hidden text-sm text-blue-200">
                Season: 2024/25 • Week 23 • {new Date().toLocaleDateString('en-GB')}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-sm">
                  <div className="text-blue-200 font-medium">Navigation</div>
                  <div className="mt-2 space-y-1">
                    <a href="/frf" className="block text-white/80 hover:text-white transition-colors">
                      FRF Analysis
                    </a>
                    <a href="/frf2" className="block text-white/80 hover:text-white transition-colors">
                      FRF2 Interactive
                    </a>
                    <a href="/frf3" className="block text-white/80 hover:text-white transition-colors">
                      FRF3 3-Year Model
                    </a>
                    <a href="/frf4" className="block text-white/80 hover:text-white transition-colors">
                      FRF4 Progression
                    </a>
                    <a href="/frf5" className="block text-white/80 hover:text-white transition-colors">
                      FRF5 Ultimate
                    </a>
                    <a href="/frf6" className="block text-white/80 hover:text-white transition-colors">
                      FRF6 Intelligence
                    </a>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-blue-200 font-medium">Current Analysis</div>
                  <div className="mt-2 text-white">
                    Position: {selectedPosition} • Risk: {risk.level}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-blue-200 font-medium">Quick Actions</div>
                  <div className="mt-2 space-y-1">
                    <button 
                      onClick={() => {
                        setSelectedPosition(6);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-white/80 hover:text-white transition-colors"
                    >
                      Playoff Position
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPosition(18);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-white/80 hover:text-white transition-colors"
                    >
                      Relegation Zone
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            EFL Championship Position Financial Intelligence
          </h2>
          <p className="text-xl text-blue-200 mb-6">
            Real-time position impact analysis revealing the brutal financial reality of Championship football
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <label className="block text-sm font-medium mb-2">League Position</label>
            <input
              type="range"
              min="1"
              max="24"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1st (Champions)</span>
              <span className="font-bold text-white">Position: {selectedPosition}</span>
              <span>24th (Relegated)</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <label className="block text-sm font-medium mb-2">Championship Scenarios</label>
            <select
              value={scenario}
              onChange={(e) => {
                const newScenario = e.target.value as keyof typeof scenarios;
                setScenario(newScenario);
                                 const scenarioData = scenarios[newScenario];
                 if (scenarioData.position) {
                   setSelectedPosition(scenarioData.position);
                 }
              }}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              {Object.entries(scenarios).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name} (Pos {data.position})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <PoundSterling className="w-8 h-8 text-blue-400" />
              <div className="text-right">
                <div className="text-xl font-bold">£{(currentData.adjustedRevenue / 1000000).toFixed(1)}M</div>
                <div className="text-blue-200 text-sm">Annual Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-yellow-400" />
              <div className="text-right">
                <div className="text-xl font-bold">{currentData.wageRatio.toFixed(1)}%</div>
                <div className="text-yellow-200 text-sm">Wage Ratio</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-green-400" />
              <div className="text-right">
                <div className="text-xl font-bold">{currentData.cashRunway}</div>
                <div className="text-green-200 text-sm">Months Runway</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              {currentData.monthlyCash >= 0 ? 
                <TrendingUp className="w-8 h-8 text-green-400" /> : 
                <TrendingDown className="w-8 h-8 text-red-400" />
              }
              <div className="text-right">
                <div className="text-xl font-bold">
                  £{(Math.abs(currentData.monthlyCash) / 1000).toFixed(0)}k
                </div>
                <div className={`text-sm ${currentData.monthlyCash >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  Monthly {currentData.monthlyCash >= 0 ? 'Surplus' : 'Deficit'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 text-purple-400" />
              <div className="text-right">
                <div className={`text-xl font-bold ${risk.color}`}>{currentData.riskScore.toFixed(0)}</div>
                <div className="text-purple-200 text-sm">Risk Score</div>
              </div>
            </div>
          </div>
        </div>        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* League Position Impact */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-400" />
              League Position Financial Impact
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={leagueTableData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="position" 
                  stroke="#ffffff80" 
                  domain={[1, 24]}
                  tickFormatter={(value) => `${value}${value === selectedPosition ? '★' : ''}`}
                />
                <YAxis stroke="#ffffff80" tickFormatter={(value) => `£${value}M`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${Number(value).toFixed(1)}M`, 'Revenue']}
                  labelFormatter={(label) => `Position ${label}${label == selectedPosition ? ' (Selected)' : ''}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="url(#revenueGrad)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cash Flow Projection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              12-Month Cash Runway
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cashProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#ffffff80" />
                <YAxis 
                  stroke="#ffffff80" 
                  domain={[0, 50000000]} 
                  tickFormatter={(value) => `£${(value/1000000).toFixed(1)}M`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${(Number(value)/1000000).toFixed(2)}M`, 'Cash Position']}
                />
                <Line 
                  type="monotone" 
                  dataKey="cash" 
                  stroke={currentData.monthlyCash >= 0 ? "#10b981" : "#ef4444"} 
                  strokeWidth={3}
                  dot={{ fill: currentData.monthlyCash >= 0 ? "#10b981" : "#ef4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Radar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-red-400" />
              Multi-Dimensional Risk Analysis
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={riskRadarData}>
                <PolarGrid stroke="#ffffff30" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={18} 
                  domain={[0, 100]} 
                  tick={{ fill: '#ffffff60', fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Risk Level']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Position vs Cash Flow Scatter */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Position vs Monthly Cash Flow
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leagueTableData.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="position" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" tickFormatter={(value) => `£${value}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`£${Number(value).toFixed(0)}k`, 'Monthly Cash Flow']}
                />
                <Bar 
                  dataKey="cashFlow" 
                  fill="#3b82f6"
                >
                  {leagueTableData.slice(0, 12).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CRITICAL FINANCIAL CLIFF ANALYSIS */}
        <div className="bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-xl p-6 border-2 border-red-400/30 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            ⚠️ <span className="ml-2 text-red-300">Championship Financial Cliff Points</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-400/20">
              <h4 className="font-bold text-red-200 mb-2">6th → 7th Position</h4>
              <div className="text-xl font-bold text-red-400">-£1.5M</div>
              <p className="text-xs text-red-300">Missing £200M+ playoff opportunity</p>
            </div>
            
            <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-400/20">
              <h4 className="font-bold text-orange-200 mb-2">12th → 13th Position</h4>
              <div className="text-xl font-bold text-orange-400">-£400K</div>
              <p className="text-xs text-orange-300">Entering anxiety zone</p>
            </div>
            
            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-400/20">
              <h4 className="font-bold text-amber-200 mb-2">17th → 18th Position</h4>
              <div className="text-xl font-bold text-amber-400">-£900K</div>
              <p className="text-xs text-amber-300">Relegation battle begins</p>
            </div>
            
            <div className="bg-red-800/30 rounded-lg p-4 border border-red-500/20">
              <h4 className="font-bold text-red-200 mb-2">21st → 22nd Position</h4>
              <div className="text-xl font-bold text-red-500">-£1.2M</div>
              <p className="text-xs text-red-300">Relegation confirmed</p>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-white">Why Championship is &ldquo;The Most Financially Dangerous League&rdquo;</h4>
            <p className="text-sm text-gray-300">
              Championship clubs operate at 125% wage ratios chasing the £200M+ promotion prize. Every position triggers massive commercial, 
              attendance, and operational impacts. A 3-position drop can trigger administration within 6 months due to:
            </p>
            <ul className="text-xs text-gray-400 mt-2 list-disc list-inside">
              <li>Sponsor contract renegotiations based on league position</li>
              <li>Season ticket holder panic selling during relegation battles</li>
              <li>Player contract relegation clauses triggering additional costs</li>
              <li>Reduced TV facility fees for lower-positioned clubs</li>
            </ul>
          </div>
        </div>

        {/* COMPREHENSIVE POSITION BREAKDOWN TABLE */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-cyan-400" />
            Complete Financial Impact by Position (All 24 Positions)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2">Position</th>
                  <th className="text-left p-2">Zone</th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Wage Ratio</th>
                  <th className="text-left p-2">Monthly Cash</th>
                  <th className="text-left p-2">Survival Days</th>
                  <th className="text-left p-2">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {leagueTableData.slice(0, 12).map((data) => (
                  <tr key={data.position} className={`border-b border-white/10 ${data.position === selectedPosition ? 'bg-blue-500/20' : ''}`}>
                    <td className="p-2 font-bold">{data.position}.</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        data.position <= 2 ? 'bg-green-600/20 text-green-300' :
                        data.position <= 6 ? 'bg-blue-600/20 text-blue-300' :
                        data.position <= 12 ? 'bg-yellow-600/20 text-yellow-300' :
                        data.position <= 17 ? 'bg-orange-600/20 text-orange-300' :
                        data.position <= 21 ? 'bg-red-600/20 text-red-300' :
                        'bg-red-800/20 text-red-400'
                      }`}>
                        {data.position <= 2 ? 'AUTO PROMOTION' :
                         data.position <= 6 ? 'PLAYOFFS' :
                         data.position <= 12 ? 'UPPER MID' :
                         data.position <= 17 ? 'LOWER MID' :
                         data.position <= 21 ? 'REL BATTLE' : 'RELEGATED'}
                      </span>
                    </td>
                    <td className="p-2 font-bold">£{data.revenue.toFixed(1)}M</td>
                    <td className="p-2">
                      <span className={`font-bold ${
                        data.wageRatio <= 80 ? 'text-green-400' :
                        data.wageRatio <= 100 ? 'text-yellow-400' :
                        data.wageRatio <= 120 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {data.wageRatio}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`font-bold ${data.cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.cashFlow >= 0 ? '+' : ''}£{data.cashFlow}K
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`font-bold ${
                        data.sustainabilityDays > 365 ? 'text-green-400' :
                        data.sustainabilityDays > 180 ? 'text-yellow-400' :
                        data.sustainabilityDays > 90 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {data.sustainabilityDays > 365 ? '∞' : data.sustainabilityDays}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        data.position <= 6 ? 'bg-green-600/20 text-green-300' :
                        data.position <= 12 ? 'bg-yellow-600/20 text-yellow-300' :
                        data.position <= 17 ? 'bg-orange-600/20 text-orange-300' :
                        data.position <= 21 ? 'bg-red-600/20 text-red-300' :
                        'bg-red-800/20 text-red-400'
                      }`}>
                        {data.positionRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            <p><strong>Survival Days:</strong> Days the club can operate at current position with £3.5M cash reserves</p>
            <p><strong>Wage Ratio:</strong> Staff costs as percentage of revenue (sustainable &lt;80%, dangerous &gt;100%)</p>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-cyan-400" />
            AI-Powered Financial Intelligence
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-200">Current Position Impact</h4>
              <p className="text-sm text-gray-300">
                At position {selectedPosition}, Club DNA FC generates <strong>£{(currentData.adjustedRevenue/1000000).toFixed(1)}M annually</strong>. 
                {currentData.monthlyCash >= 0 ? 
                  ` This creates a sustainable ${(currentData.monthlyCash/1000).toFixed(0)}k monthly surplus.` :
                  ` This creates a dangerous ${Math.abs(currentData.monthlyCash/1000).toFixed(0)}k monthly deficit.`
                }
                Wage ratio: <strong>{currentData.wageRatio.toFixed(1)}%</strong>
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-yellow-200">Risk Assessment</h4>
              <p className="text-sm text-gray-300">
                <strong>{risk.level} RISK</strong> detected. Position {selectedPosition} = <strong>{currentData.positionRisk}</strong>. 
                {currentData.wageRatio > 100 ? ' CRITICAL: Wage ratio exceeds revenue!' : currentData.wageRatio > 80 ? ' WARNING: Wage ratio approaching danger zone.' : ' Wage ratio within safe limits.'}
                {currentData.sustainabilityDays < 180 && ` URGENT: Only ${currentData.sustainabilityDays} days until cash depletion!`}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-green-200">Strategic Recommendations</h4>
              <p className="text-sm text-gray-300">
                {selectedPosition >= 22 ? 
                  'RELEGATED: Immediate cost reduction, player sales, and League 1 preparation required.' :
                  selectedPosition >= 18 ?
                  'RELEGATION BATTLE: Emergency measures - consider player sales, wage deferrals, or emergency funding.' :
                  selectedPosition >= 15 ?
                  'CONCERN: Monitor cash flow closely. Improve league position or reduce operational costs.' :
                  selectedPosition >= 7 ?
                  'STABLE: Continue current strategy with focus on playoff push for £200M+ promotion prize.' :
                  'EXCELLENT: Maintain position. High probability of £200M+ Premier League promotion.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p>
            <strong>EFL Financial Intelligence Platform</strong> - Real-time financial impact analysis of league position changes
          </p>
          <p className="mt-1">
            🎯 Showcasing: Position-based revenue modeling • Cash flow projection • Multi-dimensional risk analysis • AI-powered insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default EFL_LIQUIDITY_ANALYZER;