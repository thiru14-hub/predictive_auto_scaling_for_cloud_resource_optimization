import { UserProfile, FinancialDecision, YearProjection, SimulationSummary } from '../types/finance';

export function calculateProjections(
  profile: UserProfile,
  decisions: FinancialDecision[]
): { projections: YearProjection[]; summary: SimulationSummary } {
  const activeDecisions = decisions.filter(d => d.enabled);
  const yearsToSimulate = Math.max(35, profile.targetRetirementAge - profile.currentAge + 10);
  const startYear = new Date().getFullYear();

  const projections: YearProjection[] = [];

  // Track Baseline State
  let bLiquid = profile.currentLiquidSavings;
  let bInvested = profile.currentInvestments;
  let bIncome = profile.annualGrossIncome;
  let bExpenses = profile.annualLivingExpenses;
  let bDebt = profile.currentDebts;

  // Track Scenario State
  let sLiquid = profile.currentLiquidSavings;
  let sInvested = profile.currentInvestments;
  let sRealEstate = profile.currentRealEstate;
  let sIncome = profile.annualGrossIncome;
  let sExpenses = profile.annualLivingExpenses;
  let sDebt = profile.currentDebts;

  // Active Loans in Scenario
  interface ActiveLoan {
    principalRemaining: number;
    interestRate: number;
    yearsRemaining: number;
    annualPayment: number;
  }
  const activeLoans: ActiveLoan[] = [];

  // Add initial debt to loan pool if any (assume 5% over 5 years if existing)
  if (sDebt > 0) {
    const rate = 0.06;
    const term = 5;
    const pmt = (sDebt * rate) / (1 - Math.pow(1 + rate, -term));
    activeLoans.push({
      principalRemaining: sDebt,
      interestRate: rate,
      yearsRemaining: term,
      annualPayment: pmt,
    });
  }

  // Active Assets in Scenario (e.g. real estate or vehicles that appreciate/depreciate)
  interface ActiveAsset {
    value: number;
    appreciationRate: number;
  }
  const activeAssets: ActiveAsset[] = [];
  if (sRealEstate > 0) {
    activeAssets.push({
      value: sRealEstate,
      appreciationRate: 0.04,
    });
  }

  // Track Opportunity Cost cumulative tracker
  let cumulativeOpportunityCost = 0;

  let fireAgeBaseline: number | null = null;
  let fireAgeScenario: number | null = null;
  let debtFreeAgeBaseline: number | null = null;
  let debtFreeAgeScenario: number | null = null;
  let breakevenAge: number | null = null;

  let hasPassedDecisionAge = false;

  for (let i = 0; i < yearsToSimulate; i++) {
    const age = profile.currentAge + i;
    const calendarYear = startYear + i;
    const milestones: YearProjection['milestones'] = [];

    // Check decisions taking effect this year
    for (const dec of activeDecisions) {
      if (dec.executionAge === age) {
        hasPassedDecisionAge = true;
        milestones.push({
          id: `dec-${dec.id}`,
          label: `${dec.title} Executed`,
          type: 'decision_start',
        });

        // Apply Upfront Outflow
        if (dec.upfrontCashOutflow > 0) {
          if (sLiquid >= dec.upfrontCashOutflow) {
            sLiquid -= dec.upfrontCashOutflow;
          } else {
            const shortfall = dec.upfrontCashOutflow - sLiquid;
            sLiquid = 0;
            sInvested = Math.max(0, sInvested - shortfall);
          }
          // Seed opportunity cost base
          cumulativeOpportunityCost += dec.upfrontCashOutflow;
        }

        // Apply Asset added
        if (dec.assetValueAdded > 0) {
          activeAssets.push({
            value: dec.assetValueAdded,
            appreciationRate: dec.assetAppreciationRate,
          });
        }

        // Apply Debt incurred
        if (dec.debtIncurred > 0) {
          const rate = dec.debtInterestRate;
          const term = dec.debtTermYears;
          const pmt = rate > 0 
            ? (dec.debtIncurred * rate) / (1 - Math.pow(1 + rate, -term))
            : dec.debtIncurred / term;
          
          activeLoans.push({
            principalRemaining: dec.debtIncurred,
            interestRate: rate,
            yearsRemaining: term,
            annualPayment: pmt,
          });
          sDebt += dec.debtIncurred;
        }
      }
    }

    // BASELINE CALCULATIONS for Year i
    // Grow income with career growth
    if (i > 0) {
      bIncome *= (1 + profile.annualIncomeGrowthRate);
      bExpenses *= (1 + profile.inflationRate);
    }
    const bAnnualSavings = Math.max(0, bIncome - bExpenses);
    
    // Pay off baseline debt
    if (bDebt > 0) {
      const debtPaydown = Math.min(bDebt, bAnnualSavings * 0.4);
      bDebt = Math.max(0, bDebt - debtPaydown);
      const remainingSavings = bAnnualSavings - debtPaydown;
      bInvested = bInvested * (1 + profile.expectedInvestmentReturn) + remainingSavings;
      if (bDebt === 0 && !debtFreeAgeBaseline) {
        debtFreeAgeBaseline = age;
        milestones.push({
          id: `base-debt-free-${age}`,
          label: 'Baseline Debt Free',
          type: 'debt_free',
        });
      }
    } else {
      bInvested = bInvested * (1 + profile.expectedInvestmentReturn) + bAnnualSavings;
    }

    const baselineNetWorth = Math.round(bLiquid + bInvested - bDebt);

    // SCENARIO CALCULATIONS for Year i
    // Base salary & expenses growth
    if (i > 0) {
      sIncome *= (1 + profile.annualIncomeGrowthRate);
      sExpenses *= (1 + profile.inflationRate);
    }

    // Apply active decision ongoing changes
    let decIncomeDelta = 0;
    let decExpenseDelta = 0;
    for (const dec of activeDecisions) {
      if (age >= dec.executionAge) {
        decIncomeDelta += dec.annualIncomeDelta;
        decExpenseDelta += dec.annualExpenseDelta;
      }
    }

    const currentScenarioGrossIncome = Math.max(0, sIncome + decIncomeDelta);
    const currentScenarioLivingExpenses = Math.max(0, sExpenses + decExpenseDelta);

    // Debt service payments
    let totalDebtServiceThisYear = 0;
    let totalPrincipalPaidThisYear = 0;
    for (const loan of activeLoans) {
      if (loan.yearsRemaining > 0 && loan.principalRemaining > 0) {
        const interestDue = loan.principalRemaining * loan.interestRate;
        const payment = Math.min(loan.annualPayment, loan.principalRemaining + interestDue);
        const principalDue = Math.max(0, payment - interestDue);
        
        loan.principalRemaining = Math.max(0, loan.principalRemaining - principalDue);
        loan.yearsRemaining -= 1;
        totalDebtServiceThisYear += payment;
        totalPrincipalPaidThisYear += principalDue;
      }
    }
    sDebt = activeLoans.reduce((sum, l) => sum + l.principalRemaining, 0);

    if (sDebt === 0 && !debtFreeAgeScenario && activeLoans.length > 0) {
      debtFreeAgeScenario = age;
      milestones.push({
        id: `scen-debt-free-${age}`,
        label: 'Scenario All Debt Paid Off',
        type: 'loan_paid',
      });
    }

    // Appreciate / Depreciate physical assets
    let totalRealEstateAndAssets = 0;
    for (const asset of activeAssets) {
      asset.value = Math.max(0, asset.value * (1 + asset.appreciationRate));
      totalRealEstateAndAssets += asset.value;
    }
    sRealEstate = totalRealEstateAndAssets;

    // Net Cash Flow for the year
    const netScenarioCashflow = currentScenarioGrossIncome - currentScenarioLivingExpenses - totalDebtServiceThisYear;
    
    // Allocate cashflow: maintain 6 months liquid emergency fund, remainder to invested assets
    const desiredEmergencyBuffer = (currentScenarioLivingExpenses + totalDebtServiceThisYear) / 2; // 6 months
    if (netScenarioCashflow > 0) {
      if (sLiquid < desiredEmergencyBuffer) {
        const fillAmount = Math.min(desiredEmergencyBuffer - sLiquid, netScenarioCashflow);
        sLiquid += fillAmount;
        const remainder = netScenarioCashflow - fillAmount;
        sInvested = sInvested * (1 + profile.expectedInvestmentReturn) + remainder;
      } else {
        sInvested = sInvested * (1 + profile.expectedInvestmentReturn) + netScenarioCashflow;
      }
    } else {
      // Deficit: draw down liquid first, then investments
      const deficit = Math.abs(netScenarioCashflow);
      if (sLiquid >= deficit) {
        sLiquid -= deficit;
        sInvested = sInvested * (1 + profile.expectedInvestmentReturn);
      } else {
        const remainingDeficit = deficit - sLiquid;
        sLiquid = 0;
        sInvested = Math.max(0, sInvested * (1 + profile.expectedInvestmentReturn) - remainingDeficit);
        milestones.push({
          id: `cash-strain-${age}`,
          label: `Emergency Reserve Depleted (Age ${age})`,
          type: 'warning',
        });
      }
    }

    const scenarioNetWorth = Math.round(sLiquid + sInvested + sRealEstate - sDebt);

    // Opportunity Cost Compounding
    // Grow existing opportunity cost plus any excess expenses spent in scenario vs baseline
    const excessOutflow = Math.max(0, (currentScenarioLivingExpenses + totalDebtServiceThisYear) - bExpenses);
    cumulativeOpportunityCost = (cumulativeOpportunityCost * (1 + profile.expectedInvestmentReturn)) + excessOutflow;

    // Check Breakeven (when scenario pulls ahead after having dipped)
    if (hasPassedDecisionAge && !breakevenAge && scenarioNetWorth >= baselineNetWorth && i > 0) {
      breakevenAge = age;
      milestones.push({
        id: `breakeven-${age}`,
        label: `Wealth Breakeven Reached (Age ${age})`,
        type: 'millionaire',
      });
    }

    // Check Milestones: Millionaire ($1M net worth)
    if (baselineNetWorth >= 1000000 && !projections.some(p => p.baselineNetWorth >= 1000000)) {
      milestones.push({
        id: `base-m-${age}`,
        label: `Baseline $1M Reached`,
        type: 'millionaire',
      });
    }
    if (scenarioNetWorth >= 1000000 && !projections.some(p => p.scenarioNetWorth >= 1000000)) {
      milestones.push({
        id: `scen-m-${age}`,
        label: `Scenario $1M Reached`,
        type: 'millionaire',
      });
    }

    // Check FIRE (4% safe withdrawal rule: investments >= 25x living expenses)
    const baselineFireThreshold = bExpenses * 25;
    if (bInvested >= baselineFireThreshold && !fireAgeBaseline) {
      fireAgeBaseline = age;
      milestones.push({
        id: `base-fire-${age}`,
        label: `Baseline Financial Independence (Age ${age})`,
        type: 'fire',
      });
    }

    const scenarioFireThreshold = currentScenarioLivingExpenses * 25;
    if (sInvested >= scenarioFireThreshold && !fireAgeScenario) {
      fireAgeScenario = age;
      milestones.push({
        id: `scen-fire-${age}`,
        label: `Scenario Financial Independence (Age ${age})`,
        type: 'fire',
      });
    }

    // Bull & Bear Market estimates (approximate 1.8 sigma bounds on compound return)
    const yearsElapsed = i + 1;
    const volVarianceFactor = Math.sqrt(yearsElapsed) * 0.12; // annualized standard deviation
    const bearMarketNetWorth = Math.round(scenarioNetWorth * Math.max(0.4, 1 - volVarianceFactor));
    const bullMarketNetWorth = Math.round(scenarioNetWorth * (1 + volVarianceFactor * 1.25));

    projections.push({
      yearIndex: i,
      calendarYear,
      age,
      baselineNetWorth,
      baselineLiquid: Math.round(bLiquid),
      baselineInvested: Math.round(bInvested),
      baselineIncome: Math.round(bIncome),
      baselineExpenses: Math.round(bExpenses),
      baselineAnnualSavings: Math.round(bAnnualSavings),
      scenarioNetWorth,
      scenarioLiquid: Math.round(sLiquid),
      scenarioInvested: Math.round(sInvested),
      scenarioRealEstate: Math.round(sRealEstate),
      scenarioDebt: Math.round(sDebt),
      scenarioIncome: Math.round(currentScenarioGrossIncome),
      scenarioExpenses: Math.round(currentScenarioLivingExpenses),
      scenarioAnnualSavings: Math.round(netScenarioCashflow > 0 ? netScenarioCashflow : 0),
      scenarioCashflow: Math.round(netScenarioCashflow),
      netWorthDelta: Math.round(scenarioNetWorth - baselineNetWorth),
      bearMarketNetWorth,
      bullMarketNetWorth,
      opportunityCostOfSpentCapital: Math.round(cumulativeOpportunityCost),
      milestones,
    });
  }

  // Summary Metrics
  const retirementProj = projections.find(p => p.age === profile.targetRetirementAge) || projections[projections.length - 1];
  const lifetimeNetWorthDelta = retirementProj.netWorthDelta;
  const netWorthAtRetirementBaseline = retirementProj.baselineNetWorth;
  const netWorthAtRetirementScenario = retirementProj.scenarioNetWorth;

  // Emergency runway under sudden job loss (months of living expense covered by liquid + 60% of investments)
  const currentMonthlyBurn = (profile.annualLivingExpenses + (activeLoans[0]?.annualPayment || 0)) / 12;
  const emergencyRunwayMonthsScenario = Math.round(
    ((projections[1]?.scenarioLiquid || profile.currentLiquidSavings) + 
     (projections[1]?.scenarioInvested || profile.currentInvestments) * 0.7) / Math.max(1000, currentMonthlyBurn)
  );

  // Financial Resilience Score (0-100)
  let resilienceScore = 60;
  if (lifetimeNetWorthDelta > 200000) resilienceScore += 20;
  else if (lifetimeNetWorthDelta > 0) resilienceScore += 10;
  else if (lifetimeNetWorthDelta < -150000) resilienceScore -= 25;
  else resilienceScore -= 10;

  if (emergencyRunwayMonthsScenario >= 12) resilienceScore += 15;
  else if (emergencyRunwayMonthsScenario < 4) resilienceScore -= 20;

  if (fireAgeScenario && fireAgeBaseline && fireAgeScenario < fireAgeBaseline) resilienceScore += 10;
  if (activeLoans.some(l => l.principalRemaining > profile.annualGrossIncome * 4)) resilienceScore -= 15;
  resilienceScore = Math.max(10, Math.min(98, resilienceScore));

  let verdict: SimulationSummary['verdict'] = 'moderate_growth';
  if (resilienceScore >= 80 && lifetimeNetWorthDelta > 250000) verdict = 'highly_favorable';
  else if (emergencyRunwayMonthsScenario < 4 || (sDebt > profile.annualGrossIncome * 4.5)) verdict = 'high_liquidity_risk';
  else if (lifetimeNetWorthDelta < -50000) verdict = 'capital_drag';

  return {
    projections,
    summary: {
      lifetimeNetWorthDelta,
      netWorthAtRetirementBaseline,
      netWorthAtRetirementScenario,
      totalOpportunityCost: Math.round(cumulativeOpportunityCost),
      fireAgeBaseline,
      fireAgeScenario,
      debtFreeAgeBaseline,
      debtFreeAgeScenario,
      breakevenAge,
      emergencyRunwayMonthsScenario,
      stressTestMaxDrawdown: -28, // estimated bear correction drawdown percentage
      financialResilienceScore: resilienceScore,
      verdict,
    },
  };
}
