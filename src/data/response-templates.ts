// Response Templates for Different Types of Interactions
// Provides structured templates for consistent response generation

export interface ResponseTemplate {
  id: string;
  type: 'position' | 'scenario' | 'financial' | 'help' | 'general';
  context: string;
  template: string;
  variables: string[];
  tone: 'excited' | 'optimistic' | 'neutral' | 'concerned' | 'informative' | 'helpful';
  followUpSuggestions: string[];
}

export const responseTemplates: ResponseTemplate[] = [
  // Position Change Templates
  {
    id: 'position_promotion_territory',
    type: 'position',
    context: 'position <= 2',
    template: 'Moving to position {position} puts you in automatic promotion territory. At £{revenue} million revenue, you\'re positioned for the Premier League prize worth over £200 million.',
    variables: ['position', 'revenue'],
    tone: 'excited',
    followUpSuggestions: [
      'What would promotion mean financially?',
      'How much investment is needed for success?'
    ]
  },
  {
    id: 'position_playoff_zone',
    type: 'position', 
    context: 'position <= 6 && position > 2',
    template: 'Position {position} keeps you in the playoff chase. With £{revenue} million in revenue, you\'re competing for that £200 million promotion opportunity.',
    variables: ['position', 'revenue'],
    tone: 'optimistic',
    followUpSuggestions: [
      'What are the playoff financial dynamics?',
      'How much is playoff qualification worth?'
    ]
  },
  {
    id: 'position_midtable',
    type: 'position',
    context: 'position > 6 && position < 18',
    template: 'At position {position}, you\'re in Championship mid-table. Your £{revenue} million revenue provides stability, but you\'re missing the playoff premium.',
    variables: ['position', 'revenue'],
    tone: 'neutral',
    followUpSuggestions: [
      'How can we improve our league position?',
      'What are healthy financial benchmarks?'
    ]
  },
  {
    id: 'position_relegation_zone',
    type: 'position',
    context: 'position >= 18',
    template: 'Position {position} puts you in relegation danger. With £{revenue} million revenue, financial sustainability becomes critical.',
    variables: ['position', 'revenue'],
    tone: 'concerned',
    followUpSuggestions: [
      'What survival strategies are available?',
      'How can we cut costs safely?'
    ]
  },

  // Scenario Change Templates
  {
    id: 'scenario_optimistic',
    type: 'scenario',
    context: 'scenario === optimistic',
    template: 'Switching to best case scenario shows your promotion potential. This models maximum revenue optimization and successful recruitment.',
    variables: ['scenario'],
    tone: 'optimistic',
    followUpSuggestions: [
      'What investment would be required?',
      'What are the risks of this approach?'
    ]
  },
  {
    id: 'scenario_pessimistic',
    type: 'scenario',
    context: 'scenario === pessimistic',
    template: 'Worst case scenario reveals your downside risks. This models poor performance, reduced revenue, and potential financial distress.',
    variables: ['scenario'],
    tone: 'concerned',
    followUpSuggestions: [
      'What mitigation strategies exist?',
      'How can we prepare for this?'
    ]
  },
  {
    id: 'scenario_current',
    type: 'scenario',
    context: 'scenario === current',
    template: 'Current trajectory shows your baseline financial path based on existing performance and market conditions.',
    variables: ['scenario'],
    tone: 'informative',
    followUpSuggestions: [
      'Compare with other scenarios',
      'What strategic options do we have?'
    ]
  },

  // Financial Query Templates
  {
    id: 'financial_revenue',
    type: 'financial',
    context: 'metric === revenue',
    template: 'At position {position}, your club generates £{revenue} million annually. This includes broadcasting revenue, matchday income, and commercial partnerships.',
    variables: ['position', 'revenue'],
    tone: 'informative',
    followUpSuggestions: [
      'How is revenue distributed across streams?',
      'Compare revenue with other positions'
    ]
  },
  {
    id: 'financial_risk',
    type: 'financial',
    context: 'metric === risk',
    template: 'Your financial risk score is {riskScore} out of 100. This reflects wage ratios, cash flow stability, and regulatory compliance at position {position}.',
    variables: ['riskScore', 'position'],
    tone: 'informative',
    followUpSuggestions: [
      'What are the main risk factors?',
      'How can we improve our risk score?'
    ]
  },
  {
    id: 'financial_general',
    type: 'financial',
    context: 'general query',
    template: 'Your financial metrics show important insights for position {position}. Revenue is £{revenue} million with a risk score of {riskScore}.',
    variables: ['position', 'revenue', 'riskScore'],
    tone: 'informative',
    followUpSuggestions: [
      'Tell me about specific metrics',
      'How do we compare to other clubs?'
    ]
  },

  // Help Templates
  {
    id: 'help_general',
    type: 'help',
    context: 'general help request',
    template: 'I can help you navigate the financial dashboard and understand EFL economics. You can ask about positions, scenarios, financial metrics, or specific concepts like parachute payments.',
    variables: [],
    tone: 'helpful',
    followUpSuggestions: [
      'Show me different league positions',
      'Explain the scenario modeling',
      'What financial concepts can you explain?'
    ]
  },
  {
    id: 'help_voice_commands',
    type: 'help',
    context: 'voice command help',
    template: 'Voice commands you can use: Say "position 6" to move positions, "best case scenario" to change projections, "what\'s the revenue?" for financial data, or ask about EFL concepts.',
    variables: [],
    tone: 'helpful',
    followUpSuggestions: [
      'Try changing the league position',
      'Ask about financial concepts',
      'Explore different scenarios'
    ]
  }
];

// Template selection utilities
export const getTemplateById = (id: string): ResponseTemplate | undefined => {
  return responseTemplates.find(template => template.id === id);
};

export const getTemplatesByType = (type: ResponseTemplate['type']): ResponseTemplate[] => {
  return responseTemplates.filter(template => template.type === type);
};

export const getTemplateByContext = (type: ResponseTemplate['type'], context: string): ResponseTemplate | undefined => {
  return responseTemplates.find(template => 
    template.type === type && template.context === context
  );
};

// Template variable replacement utility
export const fillTemplate = (template: ResponseTemplate, variables: Record<string, string>): string => {
  let result = template.template;
  
  template.variables.forEach(variable => {
    const placeholder = `{${variable}}`;
    const value = variables[variable] || variable;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
};

// Export template types for type safety
export type TemplateType = ResponseTemplate['type'];
export type TemplateTone = ResponseTemplate['tone']; 