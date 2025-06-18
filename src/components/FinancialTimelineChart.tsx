'use client';

import React, { useMemo } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart } from 'recharts';
import { TrendingUp, AlertTriangle, Target, DollarSign } from 'lucide-react';

interface FinancialTimelineChartProps {
  highlightedPlayer?: string | null;
}

// Contract data for our players with real financial projections
const contractData = {
  'Diogo Dalot': {
    wages: [
      { date: '2024-07', year: '2024/25', baseWage: 110000, cumulativeValue: 5.72, bonusPotential: 0.1, scenario: 'base' },
      { date: '2025-07', year: '2025/26', baseWage: 120000, cumulativeValue: 11.96, bonusPotential: 0.3, scenario: 'base' },
      { date: '2026-07', year: '2026/27', baseWage: 130000, cumulativeValue: 18.72, bonusPotential: 0.5, scenario: 'base' },
      { date: '2027-07', year: '2027/28', baseWage: 140000, cumulativeValue: 26.0, bonusPotential: 0.7, scenario: 'base' },
      { date: '2028-07', year: '2028/29', baseWage: 200000, cumulativeValue: 36.4, bonusPotential: 1.0, scenario: 'option' },
    ],
    bonuses: [
      { date: '2025-06-12', amount: 50000000, type: 'Loyalty Bonus', description: '£50M Loyalty Payment' },
      { date: '2025-06-30', amount: 500000, type: 'Image Rights', description: '£500k Image Rights' },
      { date: '2025-07-31', amount: 250000, type: 'Signing Fee', description: '£250k Instalment' },
    ],
    riskFactors: {
      loyaltyBonus: 50000000,
      totalExposure: 86400000,
      nextMajorPayment: '2025-06-12'
    }
  },
  'André Onana': {
    wages: [
      { date: '2024-07', year: '2024/25', baseWage: 120000, cumulativeValue: 6.24, bonusPotential: 0.2, scenario: 'base' },
      { date: '2025-07', year: '2025/26', baseWage: 120000, cumulativeValue: 12.48, bonusPotential: 0.2, scenario: 'expires' },
    ],
    bonuses: [
      { date: '2025-06-30', amount: 0, type: 'Contract Expires', description: 'Contract ends - renewal needed' },
    ],
    riskFactors: {
      loyaltyBonus: 0,
      totalExposure: 12480000,
      nextMajorPayment: '2025-06-30'
    }
  },
  'Kobbie Mainoo': {
    wages: [
      { date: '2024-07', year: '2024/25', baseWage: 35000, cumulativeValue: 1.82, bonusPotential: 0.1, scenario: 'base' },
      { date: '2025-07', year: '2025/26', baseWage: 50000, cumulativeValue: 4.42, bonusPotential: 0.3, scenario: 'base' },
      { date: '2026-07', year: '2026/27', baseWage: 75000, cumulativeValue: 8.32, bonusPotential: 0.5, scenario: 'base' },
      { date: '2027-07', year: '2027/28', baseWage: 100000, cumulativeValue: 13.52, bonusPotential: 0.8, scenario: 'base' },
    ],
    bonuses: [
      { date: '2025-07-01', amount: 1000000, type: 'Performance Bonus', description: '£1M Performance Milestone' },
    ],
    riskFactors: {
      loyaltyBonus: 1000000,
      totalExposure: 15520000,
      nextMajorPayment: '2025-07-01'
    }
  }
};

const FinancialTimelineChart: React.FC<FinancialTimelineChartProps> = ({ highlightedPlayer }) => {
  const chartData = useMemo(() => {
    if (!highlightedPlayer || !contractData[highlightedPlayer as keyof typeof contractData]) {
      // Show combined overview when no player highlighted
      const years = ['2024/25', '2025/26', '2026/27', '2027/28'];
      return years.map(year => {
        const totalWages = Object.values(contractData).reduce((sum, player) => {
          const yearData = player.wages.find(w => w.year === year);
          return sum + (yearData?.baseWage || 0);
        }, 0);
        
        return {
          year,
          totalWages: totalWages / 1000, // Convert to thousands
          playerCount: Object.keys(contractData).length
        };
      });
    }
    
    // Show specific player data
    const playerData = contractData[highlightedPlayer as keyof typeof contractData];
    return playerData.wages.map((wage) => ({
      ...wage,
      baseWageK: wage.baseWage / 1000, // Convert to thousands for display
      bonusValue: playerData.bonuses
        .filter(bonus => bonus.date.startsWith(wage.year.split('/')[0]))
        .reduce((sum, bonus) => sum + bonus.amount, 0) / 1000000, // Convert to millions
    }));
  }, [highlightedPlayer]);

  const playerStats = highlightedPlayer && contractData[highlightedPlayer as keyof typeof contractData] 
    ? contractData[highlightedPlayer as keyof typeof contractData] 
    : null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Financial Timeline Analysis
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {highlightedPlayer 
              ? `${highlightedPlayer}'s contract progression and risk profile`
              : 'Combined squad wage analysis and projections'
            }
          </p>
        </div>
        
        {playerStats && (
          <div className="grid grid-cols-3 gap-4 text-right">
            <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
              <div className="text-emerald-400 text-sm font-medium">Total Exposure</div>
              <div className="text-white font-bold">£{(playerStats.riskFactors.totalExposure / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
              <div className="text-amber-400 text-sm font-medium">Loyalty Risk</div>
              <div className="text-white font-bold">£{(playerStats.riskFactors.loyaltyBonus / 1000000).toFixed(0)}M</div>
            </div>
            <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
              <div className="text-red-400 text-sm font-medium">Next Payment</div>
              <div className="text-white font-bold text-xs">{playerStats.riskFactors.nextMajorPayment}</div>
            </div>
          </div>
        )}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {highlightedPlayer ? (
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="year" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="wage"
                orientation="left"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Weekly Wage (£k)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <YAxis 
                yAxisId="value"
                orientation="right"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Cumulative Value (£M)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'baseWageK') return [`£${value}k/week`, 'Base Wage'];
                  if (name === 'cumulativeValue') return [`£${value}M`, 'Cumulative Value'];
                  if (name === 'bonusValue') return [`£${value}M`, 'Bonus Payments'];
                  return [value, name];
                }}
              />
              <Legend />
              
              {/* Base wage line */}
              <Line 
                yAxisId="wage"
                type="monotone" 
                dataKey="baseWageK" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Weekly Wage"
              />
              
              {/* Cumulative value area */}
              <Area
                yAxisId="value"
                type="monotone"
                dataKey="cumulativeValue"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Cumulative Value"
              />
              
              {/* Bonus payments */}
              <Line 
                yAxisId="value"
                type="monotone" 
                dataKey="bonusValue" 
                stroke="#F59E0B" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Bonus Payments"
              />
              
              {/* Option year marker */}
              <ReferenceLine 
                x="2028/29" 
                stroke="#EF4444" 
                strokeDasharray="3 3" 
                label={{ value: "Option Year", position: "top", fill: "#EF4444" }}
              />
            </ComposedChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="year" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Combined Weekly Wages (£k)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'totalWages') return [`£${value}k/week`, 'Total Squad Wages'];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="totalWages"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.3}
                strokeWidth={3}
                name="Total Squad Wages"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Risk Indicators */}
      {highlightedPlayer && playerStats && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-300 font-medium text-sm">High Risk Payment</span>
            </div>
            <div className="text-white font-bold">£50M Loyalty Bonus</div>
            <div className="text-red-200 text-xs">Due: 12 June 2025</div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm">Next Wage Jump</span>
            </div>
            <div className="text-white font-bold">£120k/week</div>
            <div className="text-amber-200 text-xs">Effective: July 2025</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 font-medium text-sm">Option Year Value</span>
            </div>
            <div className="text-white font-bold">£200k/week</div>
            <div className="text-blue-200 text-xs">2028/29 Season</div>
          </div>
        </div>
      )}
      
      {!highlightedPlayer && (
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-sm">
            💡 <strong>Tip:</strong> Ask NICO to &quot;highlight&quot; a player to see their detailed financial timeline and risk analysis
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialTimelineChart; 