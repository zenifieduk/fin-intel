// Context-Aware Response Generation System
// Transforms knowledge retrieval into natural, conversational responses

import { type Intent } from './voice-intents';
import { type KnowledgeEntry } from '../data/financial-knowledge';
import { type FinancialData } from './aaran-agent';

export type ResponseStyle = 'brief' | 'detailed' | 'explanatory' | 'conversational';

export interface ResponseContext {
  intent: Intent;
  knowledgeResults: KnowledgeEntry[];
  dashboardData: FinancialData;
  conversationHistory: string[];
  userPreferences: ResponseStyle;
  currentPosition: number;
  scenario: string;
}

export interface GeneratedResponse {
  text: string;
  confidence: number;
  style: ResponseStyle;
  followUpQuestions: string[];
  contextualInsights: string[];
  dataPoints: string[];
}

export class ResponseGenerator {
  private responseCache = new Map<string, GeneratedResponse>();
  
  // Main response generation method
  generateResponse(context: ResponseContext): GeneratedResponse {
    console.log(`🎭 Generating contextual response for intent: ${context.intent.type}`);
    
    // Generate base response
    const responseText = this.createContextualResponse(context);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(context);
    
    // Generate contextual insights
    const contextualInsights = this.generateContextualInsights(context);
    
    // Extract data points
    const dataPoints = this.extractDataPoints(context);
    
    return {
      text: responseText,
      confidence: 0.85,
      style: context.userPreferences,
      followUpQuestions,
      contextualInsights,
      dataPoints
    };
  }

  // Create contextual response based on intent and data
  private createContextualResponse(context: ResponseContext): string {
    const { intent, currentPosition, dashboardData } = context;
    const revenue = (dashboardData.totalRevenue / 1000000).toFixed(1);
    
    switch (intent.type) {
      case 'POSITION_CHANGE':
        const position = intent.parameters.position || currentPosition;
        if (position <= 2) {
          return `Moving to position ${position} puts you in automatic promotion territory. At £${revenue} million revenue, you're positioned for the Premier League prize worth over £200 million.`;
        } else if (position <= 6) {
          return `Position ${position} keeps you in the playoff chase. With £${revenue} million in revenue, you're competing for that £200 million promotion opportunity.`;
        } else if (position >= 18) {
          return `Position ${position} puts you in relegation danger. With £${revenue} million revenue, financial sustainability becomes critical.`;
        } else {
          return `At position ${position}, you're in Championship mid-table. Your £${revenue} million revenue provides stability, but you're missing the playoff premium.`;
        }
      
      case 'SCENARIO_CHANGE':
        const scenario = intent.parameters.scenario;
        if (scenario === 'optimistic') {
          return `Switching to best case scenario shows your promotion potential. This models maximum revenue optimization and successful recruitment.`;
        } else if (scenario === 'pessimistic') {
          return `Worst case scenario reveals your downside risks. This models poor performance, reduced revenue, and potential financial distress.`;
        } else {
          return `Current trajectory shows your baseline financial path based on existing performance and market conditions.`;
        }
      
      case 'FINANCIAL_QUERY':
        const metric = intent.parameters.metric;
        if (metric === 'revenue') {
          return `At position ${currentPosition}, your club generates £${revenue} million annually. This includes broadcasting revenue, matchday income, and commercial partnerships.`;
        } else if (metric === 'risk') {
          const riskScore = Math.round(dashboardData.riskScore);
          return `Your financial risk score is ${riskScore} out of 100. This reflects wage ratios, cash flow stability, and regulatory compliance at position ${currentPosition}.`;
        }
        return `Your financial metrics show important insights for position ${currentPosition}. Revenue is £${revenue} million with a risk score of ${Math.round(dashboardData.riskScore)}.`;
      
      default:
        return `I understand you want to interact with the financial dashboard. At position ${currentPosition}, your revenue is £${revenue} million. How can I help you explore the data?`;
    }
  }

  // Generate relevant follow-up questions
  private generateFollowUpQuestions(context: ResponseContext): string[] {
    const { intent, currentPosition } = context;
    
    switch (intent.type) {
      case 'POSITION_CHANGE':
        if (currentPosition <= 6) {
          return [
            "What would promotion mean financially?",
            "How much investment is needed for promotion?",
            "What are the playoff financial dynamics?"
          ];
        } else {
          return [
            "How can we improve our league position?",
            "What are healthy financial benchmarks?",
            "Show me different scenario outcomes"
          ];
        }
      
      case 'FINANCIAL_QUERY':
        return [
          "How is revenue distributed across streams?",
          "What are the main financial risks?",
          "Compare with other Championship clubs"
        ];
      
      default:
        return [
          "Show me different league positions",
          "Explain the scenario modeling",
          "What financial metrics can I track?"
        ];
    }
  }

  // Generate contextual insights
  private generateContextualInsights(context: ResponseContext): string[] {
    const insights: string[] = [];
    const { currentPosition, dashboardData } = context;
    
    if (currentPosition <= 6 && currentPosition > 2) {
      insights.push("You're in the playoff zone where every position matters for promotion chances");
    }
    
    if (dashboardData.wageRatio > 80) {
      insights.push("Your wage ratio exceeds sustainable levels, creating regulatory risk");
    }
    
    if (dashboardData.riskScore > 70) {
      insights.push("High financial risk score suggests need for immediate cost management");
    }
    
    return insights.slice(0, 2);
  }

  // Extract mentioned data points
  private extractDataPoints(context: ResponseContext): string[] {
    const { dashboardData } = context;
    const points: string[] = [];
    
    const revenue = (dashboardData.totalRevenue / 1000000).toFixed(1);
    points.push(`Revenue: £${revenue}M`);
    
    const riskScore = Math.round(dashboardData.riskScore);
    points.push(`Risk Score: ${riskScore}/100`);
    
    const wageRatio = Math.round(dashboardData.wageRatio);
    points.push(`Wage Ratio: ${wageRatio}%`);
    
    return points;
  }

  clearCache(): void {
    this.responseCache.clear();
  }
}

// Export default instance
export const defaultResponseGenerator = new ResponseGenerator(); 