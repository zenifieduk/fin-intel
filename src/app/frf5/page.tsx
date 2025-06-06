"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Target, Trophy, DollarSign, 
  Users, Crosshair, Shield, Menu, X, BarChart3,
  PieChart as PieChartIcon, Activity, Layers, Zap, Star
} from 'lucide-react';

interface YearData2025 {
  eflLeague1Position: number;
  faCupProgress: '' | 'Round 1' | 'Round 2' | 'Round 3' | 'Round 4' | 'Round 5' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Winner';
  eflCupProgress: '' | 'Round 1' | 'Round 2' | 'Round 3' | 'Round 4' | 'Round 5' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Winner';
  relegatedFromChampionship: boolean;
}

interface YearData2026 {
  league: 'championship' | 'eflLeague1' | 'eflLeague2';
  position: number;
  championsLeague: '' | 'Conference League Group' | 'Conference League R16' | 'Conference League Quarter-Final' | 'Conference League Semi-Final' | 'Conference League Final' | 'Conference League Winner';
  europaLeague: '' | 'Europa League Group' | 'Europa League R16' | 'Europa League Quarter-Final' | 'Europa League Semi-Final' | 'Europa League Final' | 'Europa League Winner';
  conferenceLeague: '' | 'Conference League Group' | 'Conference League Knockout' | 'Conference League R16' | 'Conference League Quarter-Final' | 'Conference League Semi-Final' | 'Conference League Final' | 'Conference League Winner';
  faCupProgress: '' | 'Round 1' | 'Round 2' | 'Round 3' | 'Round 4' | 'Round 5' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Winner';
  eflCupProgress: '' | 'Round 1' | 'Round 2' | 'Round 3' | 'Round 4' | 'Round 5' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Winner';
  parachutePayment: boolean;
}

interface YearData2027 {
  league: 'premierLeague' | 'championship' | 'eflLeague1';
  position: number;
  championsLeague: '' | 'Champions League Group' | 'Champions League R16' | 'Champions League Quarter-Final' | 'Champions League Semi-Final' | 'Champions League Final' | 'Champions League Winner';
  europaLeague: '' | 'Europa League Group' | 'Europa League R16' | 'Europa League Quarter-Final' | 'Europa League Semi-Final' | 'Europa League Final' | 'Europa League Winner';
  conferenceLeague: '' | 'Conference League Group' | 'Conference League R16' | 'Conference League Quarter-Final' | 'Conference League Semi-Final' | 'Conference League Final' | 'Conference League Winner';
  faCupProgress: '' | 'Round 1' | 'Round 2' | 'Round 3' | 'Round 4' | 'Round 5' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Winner';
  eflCupProgress: '' | 'Round 1' | 'Round 2' | 'Round 3' | 'Round 4' | 'Round 5' | 'Quarter-Final' | 'Semi-Final' | 'Final' | 'Winner';
  parachutePayment: boolean;
}

interface ScenarioData {
  2025: YearData2025;
  2026: YearData2026;
  2027: YearData2027;
}

interface FinancialData {
  broadcasting: number;
  commercial: number;
  matchday: number;
  european: number;
  total: number;
}

interface ComplianceMetrics {
  psr: { value: number; status: string; threshold: number; };
  footballEarnings: { value: number; status: string; threshold: number; };
  squadCostRatio: { value: number; status: string; threshold: number; };
  debtToRevenue: { value: number; status: string; threshold: number; };
  wageToRevenue: { value: number; status: string; threshold: number; };
}

type PresetType = 'base' | 'low' | 'high';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const ClubDNAUltimateDashboard = () => {
  const [activePreset, setActivePreset] = useState<PresetType>('base');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Preset scenarios from FRF4
  const presetScenarios: Record<PresetType, ScenarioData> = useMemo(() => ({
    base: {
      2025: { eflLeague1Position: 3, faCupProgress: 'Round 4', eflCupProgress: '', relegatedFromChampionship: false },
      2026: { league: 'championship', position: 8, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false },
      2027: { league: 'premierLeague', position: 15, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false }
    },
    low: {
      2025: { eflLeague1Position: 20, faCupProgress: '', eflCupProgress: '', relegatedFromChampionship: false },
      2026: { league: 'eflLeague1', position: 16, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false },
      2027: { league: 'eflLeague1', position: 18, championsLeague: '', europaLeague: '', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false }
    },
    high: {
      2025: { eflLeague1Position: 1, faCupProgress: 'Winner', eflCupProgress: '', relegatedFromChampionship: false },
      2026: { league: 'championship', position: 2, championsLeague: '', europaLeague: '', conferenceLeague: 'Conference League Semi-Final', faCupProgress: '', eflCupProgress: '', parachutePayment: false },
      2027: { league: 'premierLeague', position: 6, championsLeague: '', europaLeague: 'Europa League Group', conferenceLeague: '', faCupProgress: '', eflCupProgress: '', parachutePayment: false }
    }
  }), []);

  const currentScenario = presetScenarios[activePreset];

  // Enhanced financial calculation with more detailed breakdown
  const calculateYearlyFinancials = useMemo(() => (yearData: YearData2025 | YearData2026 | YearData2027, year: number): FinancialData => {
    let broadcasting = 0;
    let commercial = 8000;
    let matchday = 3000;
    let european = 0;
    
    // 2025: EFL League 1
    if (year === 2025 && 'eflLeague1Position' in yearData) {
      const position = yearData.eflLeague1Position;
      broadcasting = 2500 - (position * 50);
      commercial = 5000 + (position <= 6 ? 1000 : 0);
      matchday = 2500 + (position <= 3 ? 500 : 0);
      
      // FA Cup bonus
      const faCupBonus: Record<string, number> = {
        'Round 3': 100, 'Round 4': 200, 'Round 5': 500,
        'Quarter-Final': 1000, 'Semi-Final': 2000,
        'Final': 3000, 'Winner': 5000
      };
      broadcasting += faCupBonus[yearData.faCupProgress] || 0;
    }
    
    // 2026: Championship/League 1/League 2
    if (year === 2026 && 'league' in yearData) {
      const position = yearData.position;
      if (yearData.league === 'championship') {
        broadcasting = 8000 - (position * 150);
        commercial = 12000 + (position <= 6 ? 3000 : 0);
        matchday = 6000 + (position <= 2 ? 2000 : 0);
        
        if (yearData.parachutePayment) {
          broadcasting += 15000;
        }
      } else if (yearData.league === 'eflLeague1') {
        broadcasting = 2500 - (position * 50);
        commercial = 5000;
        matchday = 2500;
      } else if (yearData.league === 'eflLeague2') {
        broadcasting = 1500;
        commercial = 3000;
        matchday = 1500;
      }
      
      // European competition revenue
      const confLeagueBonus: Record<string, number> = {
        'Conference League Group': 1500, 'Conference League Knockout': 2000,
        'Conference League Quarter-Final': 3000, 'Conference League Semi-Final': 4000,
        'Conference League Final': 5000, 'Conference League Winner': 7000
      };
      european = confLeagueBonus[yearData.conferenceLeague] || 0;
    }
    
    // 2027: Premier League/Championship/League 1
    if (year === 2027 && 'league' in yearData) {
      const position = yearData.position;
      if (yearData.league === 'premierLeague') {
        broadcasting = 100000 + (21 - position) * 2000;
        commercial = 25000 + (position <= 6 ? 15000 : 0);
        matchday = 15000 + (position <= 4 ? 10000 : 0);
        
        // European competition bonuses
        const clBonus: Record<string, number> = {
          'Champions League Group': 15000, 'Champions League R16': 25000,
          'Champions League Quarter-Final': 35000, 'Champions League Semi-Final': 50000,
          'Champions League Final': 65000, 'Champions League Winner': 85000
        };
        const elBonus: Record<string, number> = {
          'Europa League Group': 8000, 'Europa League R16': 12000,
          'Europa League Quarter-Final': 18000, 'Europa League Semi-Final': 25000,
          'Europa League Final': 35000, 'Europa League Winner': 45000
        };
        const confBonus: Record<string, number> = {
          'Conference League Group': 3000, 'Conference League R16': 5000,
          'Conference League Quarter-Final': 8000, 'Conference League Semi-Final': 12000,
          'Conference League Final': 18000, 'Conference League Winner': 25000
        };
        
        european = (clBonus[yearData.championsLeague] || 0) + 
                  (elBonus[yearData.europaLeague] || 0) + 
                  (confBonus[yearData.conferenceLeague] || 0);
        
      } else if (yearData.league === 'championship') {
        broadcasting = 8000 - (position * 150);
        commercial = 12000 + (position <= 6 ? 3000 : 0);
        matchday = 6000 + (position <= 2 ? 2000 : 0);
      } else if (yearData.league === 'eflLeague1') {
        broadcasting = 2500 - (position * 50);
        commercial = 5000;
        matchday = 2500;
      }
    }
    
    return {
      broadcasting: Math.round(broadcasting),
      commercial: Math.round(commercial),
      matchday: Math.round(matchday),
      european: Math.round(european),
      total: Math.round(broadcasting + commercial + matchday + european)
    };
  }, []);

  // Calculate financials for all years
  const financialData = useMemo(() => ({
    2025: calculateYearlyFinancials(currentScenario[2025], 2025),
    2026: calculateYearlyFinancials(currentScenario[2026], 2026),
    2027: calculateYearlyFinancials(currentScenario[2027], 2027)
  }), [currentScenario, calculateYearlyFinancials]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => 
    financialData[2025].total + financialData[2026].total + financialData[2027].total,
    [financialData]
  );

  // Calculate average revenue for compliance
  const avgRevenue = useMemo(() => totalRevenue / 3, [totalRevenue]);

  // Calculate compliance metrics
  const calculateComplianceMetrics = useMemo(() => (): ComplianceMetrics => {
    const psr = Math.max(0, avgRevenue * 0.15 - 10000);
    const footballEarnings = Math.max(0, avgRevenue * 0.18 - 5000);
    const squadCostRatio = Math.min(70, (avgRevenue / 2000));
    const debtToRevenue = Math.min(50, (avgRevenue * 0.08));
    const wageToRevenue = Math.min(60, (avgRevenue * 0.12));
    
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
      },
      debtToRevenue: {
        value: Math.round(debtToRevenue * 10) / 10,
        status: debtToRevenue < 30 ? 'excellent' : debtToRevenue < 40 ? 'good' : 'monitor',
        threshold: 50
      },
      wageToRevenue: {
        value: Math.round(wageToRevenue * 10) / 10,
        status: wageToRevenue < 45 ? 'excellent' : wageToRevenue < 55 ? 'good' : 'monitor',
        threshold: 60
      }
    };
  }, [avgRevenue]);

  const compliance = useMemo(() => calculateComplianceMetrics(), [calculateComplianceMetrics]);

  const chartData = useMemo(() => {
    // 1. Revenue projection data (line/area charts)
    const revenueProjection = [
      { 
        year: '2025', 
        revenue: financialData[2025].total,
        broadcasting: financialData[2025].broadcasting,
        commercial: financialData[2025].commercial,
        matchday: financialData[2025].matchday,
        european: financialData[2025].european,
        league: 'League 1',
        position: currentScenario[2025].eflLeague1Position
      },
      { 
        year: '2026', 
        revenue: financialData[2026].total,
        broadcasting: financialData[2026].broadcasting,
        commercial: financialData[2026].commercial,
        matchday: financialData[2026].matchday,
        european: financialData[2026].european,
        league: currentScenario[2026].league === 'championship' ? 'Championship' : 
                currentScenario[2026].league === 'eflLeague1' ? 'League 1' : 'League 2',
        position: currentScenario[2026].position
      },
      { 
        year: '2027', 
        revenue: financialData[2027].total,
        broadcasting: financialData[2027].broadcasting,
        commercial: financialData[2027].commercial,
        matchday: financialData[2027].matchday,
        european: financialData[2027].european,
        league: currentScenario[2027].league === 'premierLeague' ? 'Premier League' : 
                currentScenario[2027].league === 'championship' ? 'Championship' : 'League 1',
        position: currentScenario[2027].position
      }
    ];

    // 2. Revenue distribution pie chart data
    const totalBroadcasting = revenueProjection.reduce((sum, year) => sum + year.broadcasting, 0);
    const totalCommercial = revenueProjection.reduce((sum, year) => sum + year.commercial, 0);
    const totalMatchday = revenueProjection.reduce((sum, year) => sum + year.matchday, 0);
    const totalEuropean = revenueProjection.reduce((sum, year) => sum + year.european, 0);

    const pieData = [
      { name: 'Broadcasting', value: totalBroadcasting, percentage: (totalBroadcasting / totalRevenue * 100).toFixed(1) },
      { name: 'Commercial', value: totalCommercial, percentage: (totalCommercial / totalRevenue * 100).toFixed(1) },
      { name: 'Matchday', value: totalMatchday, percentage: (totalMatchday / totalRevenue * 100).toFixed(1) },
      { name: 'European', value: totalEuropean, percentage: (totalEuropean / totalRevenue * 100).toFixed(1) }
    ].filter(item => item.value > 0);

    // 3. Scatter plot data (position vs revenue)
    const scatterData = revenueProjection.map(year => ({
      position: year.position,
      revenue: year.revenue,
      year: year.year,
      league: year.league
    }));

    // 4. Radar chart data (compliance metrics)
    const radarData = [
      {
        metric: 'PSR',
        value: Math.min(100, (compliance.psr.value / compliance.psr.threshold) * 100),
        fullMark: 100
      },
      {
        metric: 'Football Earnings',
        value: Math.min(100, (compliance.footballEarnings.value / compliance.footballEarnings.threshold) * 100),
        fullMark: 100
      },
      {
        metric: 'Squad Cost Ratio',
        value: Math.min(100, (compliance.squadCostRatio.value / compliance.squadCostRatio.threshold) * 100),
        fullMark: 100
      },
      {
        metric: 'Debt to Revenue',
        value: Math.min(100, (compliance.debtToRevenue.value / compliance.debtToRevenue.threshold) * 100),
        fullMark: 100
      },
      {
        metric: 'Wage to Revenue',
        value: Math.min(100, (compliance.wageToRevenue.value / compliance.wageToRevenue.threshold) * 100),
        fullMark: 100
      }
    ];

    // 5. Scenario comparison data
    const scenarioComparison = Object.keys(presetScenarios).map(scenarioKey => {
      const scenario = presetScenarios[scenarioKey as PresetType];
      const scenarioFinancials = {
        2025: calculateYearlyFinancials(scenario[2025], 2025),
        2026: calculateYearlyFinancials(scenario[2026], 2026),
        2027: calculateYearlyFinancials(scenario[2027], 2027)
      };
      const scenarioTotal = scenarioFinancials[2025].total + scenarioFinancials[2026].total + scenarioFinancials[2027].total;
      
      return {
        scenario: scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1),
        totalRevenue: scenarioTotal,
        avgRevenue: scenarioTotal / 3,
        finalLeague: scenario[2027].league === 'premierLeague' ? 'Premier League' : 
                    scenario[2027].league === 'championship' ? 'Championship' : 'League 1',
        europeanRevenue: scenarioFinancials[2025].european + scenarioFinancials[2026].european + scenarioFinancials[2027].european
      };
    });

    // 6. Year-over-year growth data
    const growthData = [
      { year: '2025-26', growth: 0, revenue: financialData[2025].total },
      { 
        year: '2026-27', 
        growth: ((financialData[2026].total - financialData[2025].total) / financialData[2025].total * 100),
        revenue: financialData[2026].total 
      },
      { 
        year: '2027-28', 
        growth: ((financialData[2027].total - financialData[2026].total) / financialData[2026].total * 100),
        revenue: financialData[2027].total 
      }
    ];

    // 7. Treemap data for revenue hierarchy
    const treemapData = [
      {
        name: 'Total Revenue',
        children: [
          {
            name: 'Broadcasting',
            size: totalBroadcasting,
            children: revenueProjection.map(year => ({
              name: `${year.year} Broadcasting`,
              size: year.broadcasting
            }))
          },
          {
            name: 'Commercial',
            size: totalCommercial,
            children: revenueProjection.map(year => ({
              name: `${year.year} Commercial`,
              size: year.commercial
            }))
          },
          {
            name: 'Matchday',
            size: totalMatchday,
            children: revenueProjection.map(year => ({
              name: `${year.year} Matchday`,
              size: year.matchday
            }))
          }
        ]
      }
    ];

    return {
      revenueProjection,
      pieData,
      scatterData,
      radarData,
      scenarioComparison,
      growthData,
      treemapData
    };
  }, [currentScenario, financialData, compliance, totalRevenue, presetScenarios, calculateYearlyFinancials]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Club DNA FC Ultimate Analytics Dashboard
                </h1>
                <p className="text-blue-200">Advanced Multi-Chart Financial Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-blue-200">
                FRF5 • Ultimate Dashboard • {new Date().toLocaleDateString('en-GB')}
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
            <a href="/frf5" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              FRF5 Ultimate
            </a>
            <a href="/frf6" className="text-white/70 hover:text-white transition-colors">
              FRF6 Intelligence
            </a>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scenario Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Select Financial Scenario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(presetScenarios) as PresetType[]).map((scenarioKey) => {
              const scenario = presetScenarios[scenarioKey];
              const scenarioFinancials = {
                2025: calculateYearlyFinancials(scenario[2025], 2025),
                2026: calculateYearlyFinancials(scenario[2026], 2026),
                2027: calculateYearlyFinancials(scenario[2027], 2027)
              };
              const scenarioTotal = scenarioFinancials[2025].total + scenarioFinancials[2026].total + scenarioFinancials[2027].total;
              
              return (
                <button
                  key={scenarioKey}
                  onClick={() => setActivePreset(scenarioKey)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                    activePreset === scenarioKey
                      ? 'border-purple-400 bg-purple-500/20 shadow-xl scale-105'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold capitalize">{scenarioKey} Scenario</h3>
                    <div className="text-2xl">
                      {scenarioKey === 'base' && <Crosshair className="w-8 h-8 text-blue-400" />}
                      {scenarioKey === 'low' && <Shield className="w-8 h-8 text-orange-400" />}
                      {scenarioKey === 'high' && <Trophy className="w-8 h-8 text-yellow-400" />}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>3-Year Revenue:</span>
                      <span className="font-semibold">£{(scenarioTotal / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final League:</span>
                      <span className="font-semibold">
                        {scenario[2027].league === 'premierLeague' ? 'Premier League' : 
                         scenario[2027].league === 'championship' ? 'Championship' : 'League 1'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">£{(totalRevenue / 1000).toFixed(0)}k</div>
                <div className="text-blue-200 text-sm">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">£{(compliance.psr.value / 1000).toFixed(0)}k</div>
                <div className="text-yellow-200 text-sm">PSR</div>
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
                <div className="text-2xl font-bold">{compliance.squadCostRatio.value}%</div>
                <div className="text-green-200 text-sm">Squad Cost</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{compliance.wageToRevenue.value}%</div>
                <div className="text-purple-200 text-sm">Wage Ratio</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{compliance.debtToRevenue.value}%</div>
                <div className="text-red-200 text-sm">Debt Ratio</div>
              </div>
            </div>
          </div>
        </div>        {/* First Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 1. Revenue Projection Line Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Revenue Projection Timeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenueProjection}>
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
                  formatter={(value, name) => [`£${(Number(value)/1000).toFixed(0)}k`, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} name="Total Revenue" />
                <Line type="monotone" dataKey="broadcasting" stroke="#10b981" strokeWidth={2} name="Broadcasting" />
                <Line type="monotone" dataKey="commercial" stroke="#f59e0b" strokeWidth={2} name="Commercial" />
                <Line type="monotone" dataKey="matchday" stroke="#ef4444" strokeWidth={2} name="Matchday" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 2. Revenue Distribution Pie Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-green-400" />
              3-Year Revenue Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 3. Position vs Revenue Scatter Plot */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              League Position vs Revenue Correlation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData.scatterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  type="number" 
                  dataKey="position" 
                  name="League Position" 
                  stroke="#ffffff80"
                  domain={[1, 24]}
                  reversed
                />
                <YAxis 
                  type="number" 
                  dataKey="revenue" 
                  name="Revenue" 
                  stroke="#ffffff80"
                  tickFormatter={(value) => `£${(Number(value)/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`£${(Number(value)/1000).toFixed(0)}k`, 'Revenue'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `${payload[0].payload.year} - ${payload[0].payload.league}`;
                    }
                    return label;
                  }}
                />
                <Scatter dataKey="revenue" fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* 4. Compliance Metrics Radar Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-400" />
              Financial Compliance Radar
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.radarData}>
                <PolarGrid stroke="#ffffff30" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={18} 
                  domain={[0, 100]} 
                  tick={{ fill: '#ffffff60', fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Radar
                  name="Compliance"
                  dataKey="value"
                  stroke="#06b6d4"
                  fill="#06b6d4"
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
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Compliance Level']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>        {/* Third Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 5. Scenario Comparison Bar Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Scenario Revenue Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.scenarioComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="scenario" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" tickFormatter={(value) => `£${(Number(value)/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => [`£${(Number(value)/1000).toFixed(0)}k`, name]}
                />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#8b5cf6" name="Total 3-Year Revenue" />
                <Bar dataKey="europeanRevenue" fill="#f97316" name="European Competition Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 6. Year-over-Year Growth Line Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Year-over-Year Revenue Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="year" stroke="#ffffff80" />
                <YAxis yAxisId="left" stroke="#ffffff80" tickFormatter={(value) => `£${(Number(value)/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#ffffff80" tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`£${(Number(value)/1000).toFixed(0)}k`, 'Revenue'];
                    return [`${Number(value).toFixed(1)}%`, 'Growth Rate'];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={3} name="Growth %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fourth Row - Large Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* 7. Stacked Area Chart - Revenue Components Over Time */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-cyan-400" />
              Revenue Components Evolution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData.revenueProjection}>
                <defs>
                  <linearGradient id="broadcastingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="commercialGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="matchdayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="europeanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
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
                <Area type="monotone" dataKey="broadcasting" stackId="1" stroke="#3b82f6" fill="url(#broadcastingGrad)" name="Broadcasting" />
                <Area type="monotone" dataKey="commercial" stackId="1" stroke="#10b981" fill="url(#commercialGrad)" name="Commercial" />
                <Area type="monotone" dataKey="matchday" stackId="1" stroke="#f59e0b" fill="url(#matchdayGrad)" name="Matchday" />
                <Area type="monotone" dataKey="european" stackId="1" stroke="#ef4444" fill="url(#europeanGrad)" name="European" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>        {/* Fifth Row - Additional Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 8. Donut Chart for Current Scenario Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-pink-400" />
              Current Scenario Revenue Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold text-white">£{(totalRevenue / 1000).toFixed(0)}k</div>
              <div className="text-blue-200 text-sm">Total 3-Year Revenue</div>
            </div>
          </div>

          {/* 9. Compliance Metrics Bar Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Financial Health Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { metric: 'PSR', value: compliance.psr.value / 1000, threshold: compliance.psr.threshold / 1000 },
                { metric: 'Football Earnings', value: compliance.footballEarnings.value / 1000, threshold: compliance.footballEarnings.threshold / 1000 },
                { metric: 'Squad Cost %', value: compliance.squadCostRatio.value, threshold: compliance.squadCostRatio.threshold },
                { metric: 'Debt Ratio %', value: compliance.debtToRevenue.value, threshold: compliance.debtToRevenue.threshold / 1000 },
                { metric: 'Wage Ratio %', value: compliance.wageToRevenue.value, threshold: compliance.wageToRevenue.threshold }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="metric" stroke="#ffffff80" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#ffffff80" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => [
                    name === 'threshold' ? `${Number(value).toFixed(1)} (Threshold)` : `${Number(value).toFixed(1)}`,
                    name === 'threshold' ? 'Threshold' : 'Current Value'
                  ]}
                />
                <Legend />
                <Bar dataKey="value" fill="#06b6d4" name="Current Value" />
                <Bar dataKey="threshold" fill="#ef4444" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-8 border border-white/20 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Financial Intelligence Summary - {activePreset.charAt(0).toUpperCase() + activePreset.slice(1)} Scenario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">£{(totalRevenue / 1000).toFixed(0)}k</div>
              <div className="text-purple-200">3-Year Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">£{(avgRevenue / 1000).toFixed(0)}k</div>
              <div className="text-purple-200">Average Annual Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {currentScenario[2027].league === 'premierLeague' ? 'Premier League' : 
                 currentScenario[2027].league === 'championship' ? 'Championship' : 'League 1'}
              </div>
              <div className="text-purple-200">Final League Position</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {((financialData[2025].european + financialData[2026].european + financialData[2027].european) / 1000).toFixed(0)}k
              </div>
              <div className="text-purple-200">European Revenue</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-200">Revenue Growth</h4>
              <div className="text-2xl font-bold">
                {(((financialData[2027].total - financialData[2025].total) / financialData[2025].total) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">2025 to 2027</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-green-200">Broadcasting Share</h4>
              <div className="text-2xl font-bold">
                {(((financialData[2025].broadcasting + financialData[2026].broadcasting + financialData[2027].broadcasting) / totalRevenue) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">of Total Revenue</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-yellow-200">Compliance Score</h4>
              <div className="text-2xl font-bold">
                {Math.round((
                  (compliance.psr.status === 'compliant' ? 100 : compliance.psr.status === 'monitor' ? 75 : 50) +
                  (compliance.footballEarnings.status === 'compliant' ? 100 : compliance.footballEarnings.status === 'monitor' ? 75 : 50) +
                  (compliance.squadCostRatio.status === 'excellent' ? 100 : compliance.squadCostRatio.status === 'good' ? 85 : 70)
                ) / 3)}%
              </div>
              <div className="text-sm text-gray-300">Overall Health</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p className="mb-2">
            📊 <strong>Ultimate Financial Analytics Dashboard</strong> - Advanced multi-chart visualization of Club DNA FC financial projections
          </p>
          <p>
            Featuring: Line Charts • Pie Charts • Scatter Plots • Radar Charts • Bar Charts • Area Charts • Donut Charts • Growth Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubDNAUltimateDashboard;