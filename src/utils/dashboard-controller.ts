import { FinancialData } from './aaran-agent';

export interface DashboardAction {
  type: 'SET_POSITION' | 'SET_SCENARIO' | 'RUN_ANALYSIS' | 'EXPORT_DATA' | 'BULK_COMPARE' | 'RESET_VIEW';
  parameters: any;
  requiresConfirmation: boolean;
  isReversible: boolean;
  timestamp: number;
  userId?: string;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  message: string;
  previousState?: any;
  canUndo: boolean;
}

export interface DashboardState {
  selectedPosition: number;
  scenario: string;
  timestamp: number;
  financialData?: FinancialData;
}

export interface BulkComparisonRequest {
  positions: number[];
  scenarios: string[];
  analysisType: 'revenue' | 'risk' | 'sustainability' | 'all';
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeCharts: boolean;
  dateRange?: { start: Date; end: Date };
  selectedData: string[];
}

export class DashboardController {
  private allowedActions: Set<string>;
  private actionHistory: DashboardAction[];
  private stateHistory: DashboardState[];
  private maxHistorySize: number = 50;
  private confirmationTimeout: number = 5000; // 5 seconds
  private pendingConfirmations: Map<string, DashboardAction> = new Map();

  // Callback functions for actual UI updates
  private onPositionChange?: (position: number) => void;
  private onScenarioChange?: (scenario: string) => void;
  private onStateChange?: (state: DashboardState) => void;

  constructor() {
    this.allowedActions = new Set([
      'SET_POSITION',
      'SET_SCENARIO', 
      'RUN_ANALYSIS',
      'EXPORT_DATA',
      'BULK_COMPARE',
      'RESET_VIEW'
    ]);
    this.actionHistory = [];
    this.stateHistory = [];
  }

  // Initialize with callback functions
  initialize(callbacks: {
    onPositionChange: (position: number) => void;
    onScenarioChange: (scenario: string) => void;
    onStateChange?: (state: DashboardState) => void;
  }): void {
    this.onPositionChange = callbacks.onPositionChange;
    this.onScenarioChange = callbacks.onScenarioChange;
    this.onStateChange = callbacks.onStateChange;
  }

  // Main action execution with safety controls
  async executeAction(action: DashboardAction): Promise<ActionResult> {
    try {
      // Validate action
      if (!this.validateAction(action)) {
        return {
          success: false,
          message: 'Action not authorized or invalid',
          canUndo: false
        };
      }

      // Check if confirmation is required
      if (action.requiresConfirmation && !action.parameters.confirmed) {
        return await this.requestConfirmation(action);
      }

      // Record current state before action
      const previousState = this.getCurrentState();
      
      // Execute the action
      const result = await this.performAction(action);
      
      if (result.success) {
        // Record successful action
        this.recordAction(action, previousState);
        result.previousState = previousState;
        result.canUndo = action.isReversible;
      }

      return result;
    } catch (error) {
      console.error('Dashboard action failed:', error);
      return {
        success: false,
        message: `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        canUndo: false
      };
    }
  }

  // Validate if action is allowed and safe
  private validateAction(action: DashboardAction): boolean {
    // Check if action type is allowed
    if (!this.allowedActions.has(action.type)) {
      return false;
    }

    // Validate parameters based on action type
    switch (action.type) {
      case 'SET_POSITION':
        const position = action.parameters.position;
        return typeof position === 'number' && position >= 1 && position <= 24;
      
      case 'SET_SCENARIO':
        const scenario = action.parameters.scenario;
        return typeof scenario === 'string' && 
               ['current', 'optimistic', 'pessimistic'].includes(scenario);
      
      case 'BULK_COMPARE':
        const request = action.parameters as BulkComparisonRequest;
        return Array.isArray(request.positions) && 
               request.positions.length <= 6 && // Reasonable limit
               request.positions.every(p => p >= 1 && p <= 24);
      
      case 'EXPORT_DATA':
        const options = action.parameters as ExportOptions;
        return ['csv', 'json', 'pdf'].includes(options.format) &&
               Array.isArray(options.selectedData);
      
      default:
        return true;
    }
  }

  // Request user confirmation for sensitive actions
  private async requestConfirmation(action: DashboardAction): Promise<ActionResult> {
    const confirmationId = `confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.pendingConfirmations.set(confirmationId, action);
    
    // Auto-cleanup after timeout
    setTimeout(() => {
      this.pendingConfirmations.delete(confirmationId);
    }, this.confirmationTimeout);

    return {
      success: false,
      message: `Please confirm: ${this.getActionDescription(action)}. Say "confirm ${confirmationId.split('_')[2]}" to proceed.`,
      canUndo: false,
      data: { confirmationId }
    };
  }

  // Confirm a pending action
  async confirmAction(confirmationId: string): Promise<ActionResult> {
    const action = this.pendingConfirmations.get(confirmationId);
    if (!action) {
      return {
        success: false,
        message: 'Confirmation expired or invalid',
        canUndo: false
      };
    }

    this.pendingConfirmations.delete(confirmationId);
    action.parameters.confirmed = true;
    return await this.executeAction(action);
  }

  // Perform the actual action
  private async performAction(action: DashboardAction): Promise<ActionResult> {
    switch (action.type) {
      case 'SET_POSITION':
        return await this.setPosition(action.parameters.position, action.parameters.animated);
      
      case 'SET_SCENARIO':
        return await this.setScenario(action.parameters.scenario);
      
      case 'RUN_ANALYSIS':
        return await this.runAnalysis(action.parameters);
      
      case 'EXPORT_DATA':
        return await this.exportData(action.parameters);
      
      case 'BULK_COMPARE':
        return await this.bulkCompare(action.parameters);
      
      case 'RESET_VIEW':
        return await this.resetView();
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Enhanced position setting with smooth animation
  private async setPosition(position: number, animated: boolean = true): Promise<ActionResult> {
    if (!this.onPositionChange) {
      throw new Error('Position change callback not initialized');
    }

    if (animated) {
      // Smooth animated transition
      const currentPosition = this.getCurrentState().selectedPosition;
      const steps = Math.abs(position - currentPosition);
      const direction = position > currentPosition ? 1 : -1;
      const delay = Math.min(100, 500 / steps);

      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        this.onPositionChange!(currentPosition + (direction * (i + 1)));
      }
    } else {
      this.onPositionChange(position);
    }

    return {
      success: true,
      message: `Position set to ${position}${animated ? ' with animation' : ''}`,
      canUndo: true,
      data: { position, animated }
    };
  }

  // Set scenario
  private async setScenario(scenario: string): Promise<ActionResult> {
    if (!this.onScenarioChange) {
      throw new Error('Scenario change callback not initialized');
    }

    this.onScenarioChange(scenario);

    return {
      success: true,
      message: `Scenario changed to ${scenario}`,
      canUndo: true,
      data: { scenario }
    };
  }

  // Run analysis operations
  private async runAnalysis(parameters: any): Promise<ActionResult> {
    const analysisType = parameters.type || 'comprehensive';
    
    // Simulate analysis processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: `${analysisType} analysis completed`,
      canUndo: false,
      data: {
        analysisType,
        timestamp: Date.now(),
        results: {
          riskScore: Math.random() * 100,
          recommendations: ['Monitor cash flow', 'Review wage structure']
        }
      }
    };
  }

  // Bulk comparison functionality
  private async bulkCompare(request: BulkComparisonRequest): Promise<ActionResult> {
    const { positions, scenarios, analysisType } = request;
    
    // Generate comparison data
    const comparisonData = positions.map(position => ({
      position,
      scenarios: scenarios.map(scenario => ({
        scenario,
        metrics: this.generateMetricsForPosition(position, scenario, analysisType)
      }))
    }));

    return {
      success: true,
      message: `Bulk comparison completed for ${positions.length} positions across ${scenarios.length} scenarios`,
      canUndo: false,
      data: { comparisonData, analysisType }
    };
  }

  // Export data with various formats
  private async exportData(options: ExportOptions): Promise<ActionResult> {
    const { format, includeCharts, selectedData } = options;
    
    // Generate export data
    const exportData = {
      timestamp: new Date().toISOString(),
      currentState: this.getCurrentState(),
      selectedMetrics: selectedData,
      format,
      includeCharts
    };

    // In a real implementation, this would generate actual files
    const downloadUrl = this.generateDownloadUrl(exportData, format);

    return {
      success: true,
      message: `Data exported as ${format.toUpperCase()}`,
      canUndo: false,
      data: { downloadUrl, exportData }
    };
  }

  // Reset view to default state
  private async resetView(): Promise<ActionResult> {
    if (this.onPositionChange && this.onScenarioChange) {
      this.onPositionChange(12); // Default position
      this.onScenarioChange('current'); // Default scenario
    }

    return {
      success: true,
      message: 'View reset to default settings',
      canUndo: true,
      data: { position: 12, scenario: 'current' }
    };
  }

  // Rollback functionality
  async rollback(steps: number = 1): Promise<ActionResult> {
    if (this.stateHistory.length < steps) {
      return {
        success: false,
        message: `Cannot rollback ${steps} steps. Only ${this.stateHistory.length} states available.`,
        canUndo: false
      };
    }

    // Get target state
    const targetStateIndex = this.stateHistory.length - steps - 1;
    const targetState = this.stateHistory[targetStateIndex];

    // Restore state
    if (this.onPositionChange && this.onScenarioChange) {
      this.onPositionChange(targetState.selectedPosition);
      this.onScenarioChange(targetState.scenario);
    }

    // Remove rolled back states
    this.stateHistory = this.stateHistory.slice(0, targetStateIndex + 1);
    this.actionHistory = this.actionHistory.slice(0, targetStateIndex + 1);

    return {
      success: true,
      message: `Rolled back ${steps} step${steps > 1 ? 's' : ''}`,
      canUndo: true,
      data: { targetState, stepsRolledBack: steps }
    };
  }

  // Helper methods
  private getCurrentState(): DashboardState {
    // This would typically get the current state from the UI
    // For now, return a basic state structure
    return {
      selectedPosition: 12, // Default, would be updated by callbacks
      scenario: 'current',
      timestamp: Date.now()
    };
  }

  private recordAction(action: DashboardAction, previousState: DashboardState): void {
    this.actionHistory.push(action);
    this.stateHistory.push(previousState);

    // Maintain history size limit
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory.shift();
      this.stateHistory.shift();
    }
  }

  private getActionDescription(action: DashboardAction): string {
    switch (action.type) {
      case 'SET_POSITION':
        return `Move to position ${action.parameters.position}`;
      case 'SET_SCENARIO':
        return `Switch to ${action.parameters.scenario} scenario`;
      case 'EXPORT_DATA':
        return `Export data as ${action.parameters.format}`;
      case 'BULK_COMPARE':
        return `Compare multiple positions`;
      case 'RESET_VIEW':
        return `Reset dashboard to default view`;
      default:
        return `Execute ${action.type}`;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateMetricsForPosition(position: number, scenario: string, analysisType: string): any {
    // Simulate metrics generation
    const baseRevenue = 100 - (position - 1) * 2;
    const scenarioMultiplier = scenario === 'optimistic' ? 1.2 : scenario === 'pessimistic' ? 0.8 : 1.0;
    
    return {
      revenue: baseRevenue * scenarioMultiplier,
      riskScore: position > 18 ? 75 + (position - 18) * 5 : 30 + position * 2,
      sustainability: Math.max(0, 365 - position * 10)
    };
  }

  private generateDownloadUrl(data: any, format: string): string {
    // In a real implementation, this would create an actual download URL
    return `data:text/${format};charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  }

  // Public utility methods
  getActionHistory(): DashboardAction[] {
    return [...this.actionHistory];
  }

  getStateHistory(): DashboardState[] {
    return [...this.stateHistory];
  }

  canUndo(): boolean {
    return this.stateHistory.length > 0;
  }

  getLastAction(): DashboardAction | null {
    return this.actionHistory.length > 0 
      ? this.actionHistory[this.actionHistory.length - 1] 
      : null;
  }
}