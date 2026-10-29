export type RiskTolerance = 'conservative' | 'balanced' | 'growth';

export type DecisionCategory = 
  | 'home' 
  | 'career' 
  | 'vehicle' 
  | 'business' 
  | 'investment' 
  | 'lifestyle' 
  | 'family';

export interface UserProfile {
  name: string;
  currentAge: number;
  targetRetirementAge: number;
  currentLiquidSavings: number;
  currentInvestments: number;
  currentRealEstate: number;
  currentDebts: number;
  annualGrossIncome: number;
  annualLivingExpenses: number;
  annualSavingsRate: number; // percentage e.g. 0.25
  expectedInvestmentReturn: number; // e.g. 0.075 (7.5%)
  inflationRate: number; // e.g. 0.025 (2.5%)
  annualIncomeGrowthRate: number; // e.g. 0.035 (3.5%)
  riskTolerance: RiskTolerance;
}

export interface FinancialDecision {
  id: string;
  title: string;
  category: DecisionCategory;
  description: string;
  executionAge: number; // At what age this takes effect
  upfrontCashOutflow: number; // e.g. down payment or seed cash
  annualIncomeDelta: number; // + or - to annual income
  annualExpenseDelta: number; // + or - to annual expenses
  assetValueAdded: number; // e.g. house value or business valuation
  assetAppreciationRate: number; // e.g. 0.045 for house, -0.15 for car
  debtIncurred: number; // loan / mortgage balance taken on
  debtInterestRate: number; // e.g. 0.065
  debtTermYears: number; // loan duration e.g. 30
  notes: string;
  enabled: boolean;
  colorHex: string;
}

export interface YearProjection {
  yearIndex: number;
  calendarYear: number;
  age: number;
  
  // Baseline
  baselineNetWorth: number;
  baselineLiquid: number;
  baselineInvested: number;
  baselineIncome: number;
  baselineExpenses: number;
  baselineAnnualSavings: number;
  
  // Scenario (With Decision)
  scenarioNetWorth: number;
  scenarioLiquid: number;
  scenarioInvested: number;
  scenarioRealEstate: number;
  scenarioDebt: number;
  scenarioIncome: number;
  scenarioExpenses: number;
  scenarioAnnualSavings: number;
  scenarioCashflow: number;
  
  // Comparison & Volatility
  netWorthDelta: number; // scenario - baseline
  bearMarketNetWorth: number; // -1.8 std dev market conditions
  bullMarketNetWorth: number; // +1.8 std dev market conditions
  opportunityCostOfSpentCapital: number; // what the spent capital would have grown to if left invested
  
  // Milestones triggered this year
  milestones: Array<{
    id: string;
    label: string;
    type: 'fire' | 'debt_free' | 'millionaire' | 'decision_start' | 'loan_paid' | 'warning';
  }>;
}

export interface SimulationSummary {
  lifetimeNetWorthDelta: number;
  netWorthAtRetirementBaseline: number;
  netWorthAtRetirementScenario: number;
  totalOpportunityCost: number;
  fireAgeBaseline: number | null;
  fireAgeScenario: number | null;
  debtFreeAgeBaseline: number | null;
  debtFreeAgeScenario: number | null;
  breakevenAge: number | null;
  emergencyRunwayMonthsScenario: number;
  stressTestMaxDrawdown: number;
  financialResilienceScore: number; // 0 - 100
  verdict: 'highly_favorable' | 'moderate_growth' | 'capital_drag' | 'high_liquidity_risk';
}

export type SceneVisualizationMode = 'horizon' | 'anatomy' | 'divergence';
export type CameraPreset = 'diagonal' | 'front' | 'top' | 'close';
