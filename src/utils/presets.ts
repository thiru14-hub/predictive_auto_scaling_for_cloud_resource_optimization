import { UserProfile, FinancialDecision } from '../types/finance';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Mercer',
  currentAge: 29,
  targetRetirementAge: 60,
  currentLiquidSavings: 38000,
  currentInvestments: 72000,
  currentRealEstate: 0,
  currentDebts: 12000, // remaining low-interest college loan
  annualGrossIncome: 115000,
  annualLivingExpenses: 54000,
  annualSavingsRate: 0.28,
  expectedInvestmentReturn: 0.075, // 7.5% nominal market return
  inflationRate: 0.025, // 2.5% inflation
  annualIncomeGrowthRate: 0.035, // 3.5% merit raises
  riskTolerance: 'growth',
};

export const PRESET_DECISIONS: FinancialDecision[] = [
  {
    id: 'buy-home',
    title: 'Buy $650k Starter Home (20% Down)',
    category: 'home',
    description: 'Purchase a $650,000 suburban townhouse with $130k down payment, taking on a 30-year fixed mortgage at 6.2% interest. Property taxes & maintenance add $1,200/mo over renting.',
    executionAge: 31,
    upfrontCashOutflow: 130000,
    annualIncomeDelta: 0,
    annualExpenseDelta: 14400, // property tax, insurance, maintenance difference vs rent
    assetValueAdded: 650000,
    assetAppreciationRate: 0.042, // 4.2% historical property appreciation
    debtIncurred: 520000,
    debtInterestRate: 0.062,
    debtTermYears: 30,
    notes: 'Builds long-term home equity but locks in high upfront capital and recurring debt service.',
    enabled: true,
    colorHex: '#38bdf8', // soft sky blue
  },
  {
    id: 'career-relocation',
    title: 'Executive Relocation (+40% Compensation)',
    category: 'career',
    description: 'Transition to a Director-level role in a Tier-1 tech city. Yields a +$46,000 annual gross salary increase with $14,000 higher annual living costs.',
    executionAge: 30,
    upfrontCashOutflow: 12000, // moving, deposits, initial setup
    annualIncomeDelta: 46000,
    annualExpenseDelta: 14000,
    assetValueAdded: 0,
    assetAppreciationRate: 0,
    debtIncurred: 0,
    debtInterestRate: 0,
    debtTermYears: 0,
    notes: 'Significant net cashflow booster. Accelerates compound index fund accumulation by over $500k.',
    enabled: false,
    colorHex: '#10b981', // soft emerald
  },
  {
    id: 'luxury-ev',
    title: 'Finance $58k Luxury Electric Vehicle',
    category: 'vehicle',
    description: 'Trade in older vehicle for a brand new EV. $8,000 down, $50,000 auto loan at 6.8% APR over 5 years. Depreciates 18% annually with minor fuel savings.',
    executionAge: 30,
    upfrontCashOutflow: 8000,
    annualIncomeDelta: 0,
    annualExpenseDelta: 1800, // insurance delta minus fuel savings
    assetValueAdded: 58000,
    assetAppreciationRate: -0.16, // depreciating asset
    debtIncurred: 50000,
    debtInterestRate: 0.068,
    debtTermYears: 5,
    notes: 'Lifestyle upgrade with substantial depreciation drag and $980/mo debt service for 60 months.',
    enabled: false,
    colorHex: '#f43f5e', // soft rose
  },
  {
    id: 'startup-sabbatical',
    title: 'Self-Fund Tech Startup / Sabbatical',
    category: 'business',
    description: 'Take 2 years off corporate salary to launch a software venture. Invest $50,000 seed capital and forego $65k/yr salary for 24 months before reaching break-even.',
    executionAge: 32,
    upfrontCashOutflow: 50000,
    annualIncomeDelta: -55000, // reduced income during launch phase
    annualExpenseDelta: -4000, // tighter personal budget
    assetValueAdded: 75000, // initial equity valuation
    assetAppreciationRate: 0.15, // higher equity risk/reward
    debtIncurred: 0,
    debtInterestRate: 0,
    debtTermYears: 0,
    notes: 'High variance path: drains upfront liquidity but unlocks non-linear upside potential.',
    enabled: false,
    colorHex: '#f59e0b', // soft amber
  },
  {
    id: 'fire-aggressive',
    title: 'Aggressive FIRE Lifestyle (55% Savings Rate)',
    category: 'investment',
    description: 'Optimize housing, dining, and transit to compress annual living expenses by $18,000/yr, funneling 100% of the difference into diversified broad-market ETFs.',
    executionAge: 29,
    upfrontCashOutflow: 0,
    annualIncomeDelta: 0,
    annualExpenseDelta: -18000, // expense reduction
    assetValueAdded: 0,
    assetAppreciationRate: 0,
    debtIncurred: 0,
    debtInterestRate: 0,
    debtTermYears: 0,
    notes: 'Pulls forward Financial Independence date by 8–11 years through relentless compounding.',
    enabled: false,
    colorHex: '#8b5cf6', // soft purple
  },
  {
    id: 'mba-pivot',
    title: 'Executive MBA & Leadership Accelerator',
    category: 'career',
    description: 'Enroll in a premier 2-year executive program. $85,000 tuition financed, yielding an expected $52,000/yr salary increase upon graduation.',
    executionAge: 31,
    upfrontCashOutflow: 25000,
    annualIncomeDelta: 52000,
    annualExpenseDelta: 0,
    assetValueAdded: 0,
    assetAppreciationRate: 0,
    debtIncurred: 60000,
    debtInterestRate: 0.058,
    debtTermYears: 10,
    notes: 'High debt service in the short term, but compounds exponentially into career peak earnings.',
    enabled: false,
    colorHex: '#0ea5e9', // cerulean
  },
];
