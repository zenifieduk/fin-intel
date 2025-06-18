'use client';

import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, Target, DollarSign } from 'lucide-react';

interface FinancialTimelineChartProps {
  highlightedPlayer?: string | null;
}

// Simplified contract data structure
const contractData = {
  'Diogo Dalot': {
    wages: [
      { year: '2024/25', baseWage: 110, status: 'current' },
      { year: '2025/26', baseWage: 120, status: 'upcoming' },
      { year: '2026/27', baseWage: 130, status: 'future' },
      { year: '2027/28', baseWage: 140, status: 'future' },
      { year: '2028/29', baseWage: 200, status: 'option' },
    ],
    riskFactors: {
      loyaltyBonus: 50,
      totalExposure: 86.4,
      nextMajorPayment: '2025-06-12'
    }
  },
  'André Onana': {
    wages: [
      { year: '2024/25', baseWage: 120, status: 'current' },
      { year: '2025/26', baseWage: 120, status: 'expires' },
    ],
    riskFactors: {
      loyaltyBonus: 0,
      totalExposure: 12.5,
      nextMajorPayment: '2025-06-30'
    }
  },
  'Kobbie Mainoo': {
    wages: [
      { year: '2024/25', baseWage: 35, status: 'current' },
      { year: '2025/26', baseWage: 50, status: 'upcoming' },
      { year: '2026/27', baseWage: 75, status: 'future' },
      { year: '2027/28', baseWage: 100, status: 'future' },
    ],
    riskFactors: {
      loyaltyBonus: 1,
      totalExposure: 15.5,
      nextMajorPayment: '2025-07-01'
    }
  }
};

const FinancialTimelineChart: React.FC<FinancialTimelineChartProps> = ({ highlightedPlayer }) => {
  const { chartData, playerStats, isPlayerView } = useMemo(() => {
    const hasPlayer = highlightedPlayer && contractData[highlightedPlayer as keyof typeof contractData];
    
    if (!hasPlayer) {
      // Show combined overview
      const years = ['2024/25', '2025/26', '2026/27', '2027/28'];
      const squadData = years.map(year => {
        const totalWages = Object.values(contractData).reduce((sum, player) => {
          const yearData = player.wages.find(w => w.year === year);
          return sum + (yearData?.baseWage || 0);
        }, 0);
        return { year, wage: totalWages, status: 'squad' };
      });
      
      return {
        chartData: squadData,
        playerStats: null,
        isPlayerView: false
      };
    }
    
    // Show specific player data
    const playerData = contractData[highlightedPlayer as keyof typeof contractData];
    return {
      chartData: playerData.wages.map(w => ({ ...w, wage: w.baseWage })),
      playerStats: playerData,
      isPlayerView: true
    };
  }, [highlightedPlayer]);

  const maxWage = Math.max(...chartData.map(d => d.wage));

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
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
              <div className="text-white font-bold">£{playerStats.riskFactors.totalExposure}M</div>
            </div>
            <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
              <div className="text-amber-400 text-sm font-medium">Loyalty Risk</div>
              <div className="text-white font-bold">£{playerStats.riskFactors.loyaltyBonus}M</div>
            </div>
            <div className="bg-slate-800/50 px-3 py-2 rounded-lg">
              <div className="text-red-400 text-sm font-medium">Next Payment</div>
              <div className="text-white font-bold text-xs">{playerStats.riskFactors.nextMajorPayment}</div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="h-80 bg-slate-800/30 rounded-lg p-6 relative">
        <div className="flex items-end justify-between h-full gap-4">
          {chartData.map((data, index) => {
            const height = (data.wage / maxWage) * 100;
            
            return (
              <div key={`${data.year}-${index}`} className="flex-1 flex flex-col items-center h-full">
                {/* Bar Container */}
                <div className="w-full flex flex-col justify-end h-full relative">
                  {/* Value Label */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white whitespace-nowrap">
                    £{data.wage}k{isPlayerView ? '/week' : ' total'}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                      isPlayerView && data.status === 'current' ? 'bg-yellow-400 shadow-yellow-400/30' :
                      isPlayerView && data.status === 'upcoming' ? 'bg-blue-400 shadow-blue-400/30' :
                      isPlayerView && data.status === 'future' ? 'bg-green-400 shadow-green-400/30' :
                      isPlayerView && data.status === 'option' ? 'bg-red-400 shadow-red-400/30' :
                      isPlayerView && data.status === 'expires' ? 'bg-red-500 shadow-red-500/30' :
                      'bg-indigo-500 shadow-indigo-500/30'
                    } shadow-lg`}
                    style={{ 
                      height: `${Math.max(height, 5)}%`,
                      minHeight: '20px'
                    }}
                  />
                </div>
                
                {/* Year Label */}
                <div className="mt-3 text-xs text-slate-300 font-medium text-center">
                  {data.year}
                </div>
                
                {/* Status Badge */}
                {isPlayerView && data.status && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full text-white font-medium ${
                    data.status === 'current' ? 'bg-yellow-600' :
                    data.status === 'upcoming' ? 'bg-blue-600' :
                    data.status === 'future' ? 'bg-green-600' :
                    data.status === 'option' ? 'bg-red-600' :
                    data.status === 'expires' ? 'bg-red-700' : 'bg-slate-600'
                  }`}>
                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Y-axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
          {[1, 0.75, 0.5, 0.25, 0].map((fraction, i) => (
            <div key={i} className="border-t border-slate-600/30 w-full" />
          ))}
        </div>
        
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 pr-2">
          <span className="text-xs text-slate-400">£{Math.round(maxWage)}k</span>
          <span className="text-xs text-slate-400">£{Math.round(maxWage * 0.75)}k</span>
          <span className="text-xs text-slate-400">£{Math.round(maxWage * 0.5)}k</span>
          <span className="text-xs text-slate-400">£{Math.round(maxWage * 0.25)}k</span>
          <span className="text-xs text-slate-400">£0k</span>
        </div>
      </div>

      {/* Risk Indicators - Only for specific players */}
      {highlightedPlayer && playerStats && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-300 font-medium text-sm">Payment Risk</span>
            </div>
            <div className="text-white font-bold">
              {playerStats.riskFactors.loyaltyBonus > 0 
                ? `£${playerStats.riskFactors.loyaltyBonus}M Loyalty Bonus`
                : 'Contract Expiring'
              }
            </div>
            <div className="text-red-200 text-xs">Due: {playerStats.riskFactors.nextMajorPayment}</div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm">Next Change</span>
            </div>
            <div className="text-white font-bold">
              {chartData.find(d => d.status === 'upcoming')?.wage 
                ? `£${chartData.find(d => d.status === 'upcoming')!.wage}k/week`
                : 'Contract Review'
              }
            </div>
            <div className="text-amber-200 text-xs">Effective: July 2025</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 font-medium text-sm">Contract Value</span>
            </div>
            <div className="text-white font-bold">£{playerStats.riskFactors.totalExposure}M</div>
            <div className="text-blue-200 text-xs">Total exposure</div>
          </div>
        </div>
      )}
      
      {/* Tip for interaction */}
      {!highlightedPlayer && (
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            💡 <strong>Tip:</strong> Ask NICO to &quot;highlight&quot; a player to see their detailed financial timeline and risk analysis
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialTimelineChart; 