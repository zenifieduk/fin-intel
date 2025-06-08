// EFL Financial Intelligence Knowledge Base
// Comprehensive knowledge system for Aaran voice assistant

export interface KnowledgeEntry {
  id: string
  concept: string
  definition: string
  context: 'financial' | 'dashboard' | 'regulatory' | 'case_study' | 'general'
  category: string
  relatedTerms: string[]
  examples?: string[]
  keyFacts?: string[]
  significance: 'high' | 'medium' | 'low'
}

export const financialKnowledgeBase: KnowledgeEntry[] = [
  // Core Financial Concepts
  {
    id: 'championship-paradox',
    concept: 'Championship Financial Paradox',
    definition: 'Championship clubs lose £315 million annually while chasing £200 million promotion prizes, creating a financial paradox where success requires unsustainable spending.',
    context: 'financial',
    category: 'league-economics',
    relatedTerms: ['promotion', 'sustainability', 'spending', 'revenue'],
    keyFacts: [
      'Championship clubs operate at 125% wage-to-revenue ratios',
      'Position differences within Championship are surprisingly small (£500k-£1M between 9th-15th)',
      'Divisional jumps create massive financial cliffs worth £140-300M'
    ],
    significance: 'high'
  },
  {
    id: 'league-position-modeling',
    concept: 'League Position Financial Impact',
    definition: 'The granular differences between mid-table positions are far smaller than expected, while divisional boundaries create enormous financial cliffs.',
    context: 'financial',
    category: 'position-analysis',
    relatedTerms: ['position', 'revenue', 'merit payments', 'television'],
    keyFacts: [
      'Championship 9th vs 15th creates only £500k-£1M annual difference',
      'Playoff qualification (6th vs 7th) represents potential £200M+ swing',
      'Premier League pays £2.8M per position difference'
    ],
    examples: [
      'Top-six Championship clubs: £2-5M shirt deals',
      'Mid-table clubs (7th-15th): £500k-£1.5M shirt deals',
      'Bottom-six clubs: £200k-£800k shirt deals'
    ],
    significance: 'high'
  },
  {
    id: 'parachute-payments',
    concept: 'Parachute Payments',
    definition: 'Payments to relegated Premier League clubs that create massive competitive imbalances in the Championship.',
    context: 'financial',
    category: 'revenue-streams',
    relatedTerms: ['relegation', 'premier league', 'competitive balance'],
    keyFacts: [
      'Year 1: £49 million',
      'Year 2: £40 million', 
      'Year 3: £17 million (if applicable)',
      'Represents 5-10 times more revenue than equivalent positioned non-parachute clubs'
    ],
    significance: 'high'
  },
  {
    id: 'wage-ratios',
    concept: 'Wage-to-Revenue Ratios',
    definition: 'The percentage of club revenue spent on player wages, a critical sustainability indicator.',
    context: 'financial',
    category: 'cost-management',
    relatedTerms: ['wages', 'sustainability', 'revenue', 'costs'],
    keyFacts: [
      'Championship average: 94% (first time below 100% since 2016/17)',
      'League One average: 82% (despite 60% SCMP limits)',
      'League Two: 55% (closer to sustainable levels)',
      'Range varies from £10M (Rotherham) to £56M (Norwich City)'
    ],
    significance: 'high'
  },
  {
    id: 'season-ticket-renewals',
    concept: 'Season Ticket Renewal Rates',
    definition: 'The percentage of season ticket holders who renew, strongly correlated with league position and creating compounding revenue effects.',
    context: 'financial',
    category: 'matchday-revenue',
    relatedTerms: ['attendance', 'performance', 'loyalty', 'revenue'],
    keyFacts: [
      'Playoff positions (3rd-6th): 85-90% renewal rates',
      'Mid-table: 75-85% renewal rates',
      'Relegation battles: 65-75% renewal rates'
    ],
    significance: 'medium'
  },

  // Broadcasting & Revenue
  {
    id: 'broadcasting-revenue',
    concept: 'EFL Broadcasting Revenue',
    definition: 'Television revenue distribution heavily favors Championship level but shows minimal position-based differences within divisions.',
    context: 'financial',
    category: 'revenue-streams',
    relatedTerms: ['television', 'sky sports', 'broadcasting'],
    keyFacts: [
      'Sky Sports deal: £935M over 5 years',
      'Championship allocation: 70% (£7-9M per club annually)',
      'League One: 18% (£2M average per club)',
      'League Two: 12% (£1.5M average per club)'
    ],
    significance: 'high'
  },
  {
    id: 'matchday-revenue',
    concept: 'Matchday Revenue Importance',
    definition: 'Revenue from ticket sales, concessions, and matchday activities, with importance increasing down the football pyramid.',
    context: 'financial',
    category: 'revenue-streams',
    relatedTerms: ['attendance', 'tickets', 'concessions'],
    keyFacts: [
      'Premier League: 14% of total revenue',
      'Championship: 20% of total revenue',
      'League One/Two: 40% of total revenue',
      'Championship: £150k-£400k per match',
      'League Two: £15k-£50k per match'
    ],
    significance: 'medium'
  },

  // Regulatory Framework
  {
    id: 'psr-rules',
    concept: 'Profitability and Sustainability Rules (PSR)',
    definition: 'Championship financial regulations allowing £39 million losses over three years.',
    context: 'regulatory',
    category: 'compliance',
    relatedTerms: ['championship', 'losses', 'sustainability', 'compliance'],
    keyFacts: [
      'Maximum £39M losses over 3 years',
      'Points deductions for violations',
      'Real-time monitoring systems'
    ],
    significance: 'high'
  },
  {
    id: 'scmp-rules',
    concept: 'Salary Cost Management Protocol (SCMP)',
    definition: 'League One and League Two wage threshold controls designed for financial sustainability.',
    context: 'regulatory',
    category: 'compliance',
    relatedTerms: ['league one', 'league two', 'wages', 'thresholds'],
    keyFacts: [
      'League One limit: 60% wage threshold',
      'League Two limit: 55% wage threshold',
      'Transfer embargoes for violations',
      'Enhanced monitoring when within 5% of limits'
    ],
    significance: 'high'
  },

  // Stadium & Operations
  {
    id: 'stadium-costs',
    concept: 'Stadium Operational Costs',
    definition: 'Fixed overhead challenges that dont adjust with league position changes, creating financial cliff edges during relegation.',
    context: 'financial',
    category: 'operations',
    relatedTerms: ['stadium', 'operations', 'fixed costs'],
    keyFacts: [
      'Mid-sized 30k capacity: £10-20M annual operating costs',
      'Utilities: £2-5M annually',
      'Maintenance: £2-4M annually',
      'Security/stewarding: £1.5-3M annually'
    ],
    significance: 'medium'
  },
  {
    id: 'stadium-ownership',
    concept: 'Stadium Ownership Importance',
    definition: 'Stadium ownership proves critical for long-term financial stability, providing asset security and eliminating rental costs.',
    context: 'financial',
    category: 'assets',
    relatedTerms: ['ownership', 'assets', 'stability', 'rent'],
    examples: [
      'Derby County recovery included £22M stadium acquisition',
      'Eliminates rental costs',
      'Provides asset security for financing'
    ],
    significance: 'high'
  },

  // Case Studies
  {
    id: 'bury-fc-collapse',
    concept: 'Bury FC Collapse',
    definition: 'EFL expulsion case study highlighting failed financial management and inadequate ownership.',
    context: 'case_study',
    category: 'financial-distress',
    relatedTerms: ['expulsion', 'financial collapse', 'ownership'],
    keyFacts: [
      'Owner Steven Dale purchased 134-year-old club for £1',
      'Lacked financial capability from purchase',
      'Failed Company Voluntary Arrangement',
      'Expelled from EFL permanently'
    ],
    significance: 'high'
  },
  {
    id: 'bolton-survival',
    concept: 'Bolton Wanderers Recovery',
    definition: 'Successful survival story contrasting with Bury FC, demonstrating proper use of administration procedures.',
    context: 'case_study',
    category: 'financial-recovery',
    relatedTerms: ['administration', 'recovery', 'survival'],
    keyFacts: [
      'Entered administration for creditor protection',
      'Professional turnaround management',
      'Successful exit from administration',
      'Proper use of administration procedures vs failed CVA'
    ],
    significance: 'medium'
  },
  {
    id: 'derby-county-recovery',
    concept: 'Derby County Financial Restructuring',
    definition: 'Successful recovery under David Clowes demonstrating effective financial restructuring after major losses.',
    context: 'case_study',
    category: 'financial-recovery',
    relatedTerms: ['restructuring', 'recovery', 'championship'],
    keyFacts: [
      '£200M+ investment by previous owner Mel Morris without success',
      'David Clowes invested £33M purchase + £22M stadium acquisition',
      'Achieved 36% wage-to-turnover ratio',
      'Championship promotion despite initial £14M losses'
    ],
    significance: 'medium'
  },

  // Financial Intelligence & Analytics
  {
    id: 'monte-carlo-modeling',
    concept: 'Monte Carlo Financial Simulation',
    definition: 'Advanced modeling approaches that achieve 90%+ accuracy in league position forecasting when combined with comprehensive financial modeling.',
    context: 'financial',
    category: 'analytics',
    relatedTerms: ['modeling', 'simulation', 'forecasting', 'analytics'],
    keyFacts: [
      '90%+ accuracy in league position forecasting',
      'Integrates stochastic revenue modeling',
      'Player value forecasting capabilities',
      'Cash flow simulation using multi-variate models'
    ],
    significance: 'medium'
  },
  {
    id: 'financial-distress-prediction',
    concept: 'Financial Distress Prediction',
    definition: 'Machine learning models that predict financial distress with exceptional accuracy using Multi-Layer Perceptron networks.',
    context: 'financial',
    category: 'analytics',
    relatedTerms: ['distress', 'prediction', 'machine learning', 'early warning'],
    keyFacts: [
      'Key indicators: debt-to-revenue ratios, negative EBITDA',
      'Declining attendances >15% year-over-year',
      'Player wage-to-revenue ratios >70%',
      'Three-tier early warning systems'
    ],
    significance: 'medium'
  },
  {
    id: 'agent-fees',
    concept: 'Agent Fees Inflation',
    definition: 'Increasingly significant cost inflation with Championship clubs spending £61.34 million total in agent fees.',
    context: 'financial',
    category: 'cost-management',
    relatedTerms: ['agents', 'fees', 'transfers', 'costs'],
    keyFacts: [
      'Championship total: £61.34M (average £2.6M per club)',
      'Leeds United led with £13.2M in agent fees',
      'Demonstrates promotion ambition cost escalation',
      'Performance-triggered cost escalations create hidden traps'
    ],
    significance: 'medium'
  },

  // Dashboard & System Features
  {
    id: 'dashboard-navigation',
    concept: 'Financial Dashboard Navigation',
    definition: 'How to use the FRF7 financial intelligence dashboard for league position analysis.',
    context: 'dashboard',
    category: 'help',
    relatedTerms: ['dashboard', 'navigation', 'position', 'analysis'],
    examples: [
      'Say "position 6" to move to playoff qualification',
      'Use "best case scenario" for optimistic projections',
      'Ask "what\'s the revenue?" for financial data',
      'Try "relegation zone" to see bottom three impact'
    ],
    significance: 'high'
  },
  {
    id: 'scenario-planning',
    concept: 'Financial Scenario Planning',
    definition: 'Using different projection scenarios (optimistic, current, pessimistic) to model potential financial outcomes.',
    context: 'dashboard',
    category: 'features',
    relatedTerms: ['scenarios', 'projections', 'modeling', 'planning'],
    examples: [
      'Optimistic: Promotion case financial modeling',
      'Current: Baseline trajectory analysis', 
      'Pessimistic: Relegation case financial impact'
    ],
    significance: 'high'
  },

  // Key Performance Indicators
  {
    id: 'revpas',
    concept: 'Revenue per Available Seat (RevPAS)',
    definition: 'Key performance indicator measuring stadium revenue efficiency.',
    context: 'financial',
    category: 'kpis',
    relatedTerms: ['revenue', 'stadium', 'efficiency', 'kpi'],
    significance: 'low'
  },
  {
    id: 'player-asset-efficiency',
    concept: 'Player Asset Efficiency Ratios',
    definition: 'Metrics measuring the return on investment in player acquisitions and development.',
    context: 'financial',
    category: 'kpis',
    relatedTerms: ['players', 'assets', 'efficiency', 'transfers'],
    significance: 'low'
  },
  {
    id: 'cash-conversion-cycle',
    concept: 'Cash Conversion Cycles',
    definition: 'Time taken to convert investments into cash flows, critical for football club liquidity management.',
    context: 'financial',
    category: 'kpis',
    relatedTerms: ['cash', 'conversion', 'liquidity', 'cycle'],
    significance: 'medium'
  },

  // Risk Management
  {
    id: 'early-warning-systems',
    concept: 'Financial Early Warning Systems',
    definition: 'Automated monitoring systems that trigger alerts at defined financial risk thresholds.',
    context: 'financial',
    category: 'risk-management',
    relatedTerms: ['warning', 'alerts', 'thresholds', 'monitoring'],
    keyFacts: [
      'Trigger on negative cash flow operations',
      'Monitor debt covenant violations',
      'Track declining commercial performance patterns',
      'Real-time PSR/SCMP compliance tracking'
    ],
    significance: 'medium'
  },
  {
    id: 'performance-cost-escalations',
    concept: 'Performance-Triggered Cost Escalations',
    definition: 'Hidden financial traps where success increases operational costs significantly.',
    context: 'financial',
    category: 'risk-management',
    relatedTerms: ['performance', 'costs', 'escalation', 'hidden'],
    keyFacts: [
      'Cup runs increase operational costs 20-40% per round',
      'Playoff participation costs £500k-£1M additional',
      'Relegation settlements range £2-5M'
    ],
    significance: 'medium'
  }
];

// Knowledge base search and categorization helpers
export const knowledgeCategories = [
  'league-economics',
  'position-analysis', 
  'revenue-streams',
  'cost-management',
  'compliance',
  'operations',
  'analytics',
  'risk-management',
  'kpis',
  'help',
  'features',
  'financial-distress',
  'financial-recovery',
  'assets',
  'matchday-revenue'
] as const;

export const knowledgeContexts = [
  'financial',
  'dashboard', 
  'regulatory',
  'case_study',
  'general'
] as const;

// Quick access to high-priority concepts
export const criticalConcepts = financialKnowledgeBase.filter(
  entry => entry.significance === 'high'
);

// Dashboard-specific help entries
export const dashboardHelp = financialKnowledgeBase.filter(
  entry => entry.context === 'dashboard'
);

// Financial core concepts
export const financialConcepts = financialKnowledgeBase.filter(
  entry => entry.context === 'financial'
); 