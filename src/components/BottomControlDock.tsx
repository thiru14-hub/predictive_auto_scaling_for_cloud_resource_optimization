import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  BarChart3, 
  ShieldAlert, 
  Lightbulb, 
  Check, 
  Sparkles,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Clock,
  HelpCircle
} from 'lucide-react';
import { FinancialDecision, YearProjection, SimulationSummary, UserProfile } from '../types/finance';

interface BottomControlDockProps {
  decisions: FinancialDecision[];
  onToggleDecision: (id: string) => void;
  onUpdateDecision: (updated: FinancialDecision) => void;
  selectedAge: number;
  onSelectAge: (age: number) => void;
  projections: YearProjection[];
  summary: SimulationSummary;
  profile: UserProfile;
}

type ActiveTab = 'studio' | 'impact' | 'stress' | 'strategy';

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  decisions,
  onToggleDecision,
  onUpdateDecision,
  selectedAge,
  onSelectAge,
  projections,
  summary,
  profile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');

  // Currently focused decision for quick sliders
  const activeDecision = decisions.find(d => d.enabled) || decisions[0];

  // Current year projection data based on selected age
  const currentProj = projections.find(p => p.age === selectedAge) || projections[0];
  const minAge = projections[0]?.age || 29;
  const maxAge = projections[projections.length - 1]?.age || 65;

  const isFavorable = summary.lifetimeNetWorthDelta >= 0;

  return (
    <div 
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-3 pointer-events-none transition-all duration-300"
      style={{
        transform: `translate(-50%, ${isCollapsed ? 'calc(100% - 38px)' : '0'})`,
      }}
    >
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Top Control Bar with Collapse Toggle & Tabs */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              <span>Decision Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'impact'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Future Impact</span>
            </button>

            <button
              onClick={() => setActiveTab('stress')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'stress'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Risk & Resilience</span>
            </button>

            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'strategy'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
              <span>Strategic Insights</span>
            </button>
          </div>

          {/* Scrubber Quick Label & Collapse Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/70 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400">Inspecting:</span>
              <span className="font-bold text-sky-700 font-mono">Age {selectedAge}</span>
              <span className="text-slate-400">({currentProj.calendarYear})</span>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200/60 flex items-center gap-1 transition-colors"
              title={isCollapsed ? 'Expand Control Dock' : 'Collapse HUD for full view'}
            >
              {isCollapsed ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Expand</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-[11px]">Hide</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Contents (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="p-3.5 max-h-[300px] overflow-y-auto">
            {/* TAB 1: DECISION STUDIO */}
            {activeTab === 'studio' && (
              <div className="space-y-3.5">
                {/* Decision Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {decisions.map(decision => {
                    const isSelected = decision.enabled;
                    return (
                      <button
                        key={decision.id}
                        onClick={() => onToggleDecision(decision.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-400/30' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: decision.colorHex }}
                          />
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Age {decision.executionAge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {decision.title}
                        </h4>
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>
                            {decision.upfrontCashOutflow > 0 
                              ? `-$${(decision.upfrontCashOutflow / 1000).toFixed(0)}k` 
                              : 'No upfront'}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {isSelected ? 'ACTIVE' : 'OFF'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Real-time Fine-Tuning Sliders for Active Decision */}
                {activeDecision && (
                  <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Tune Parameters: {activeDecision.title}
                        </span>
                        <span className="text-[11px] text-slate-500 hidden sm:inline">
                          (Adjusting recalculates 30-year projections instantly)
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-600">
                        Takes effect at Age {activeDecision.executionAge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Upfront Outflow */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Upfront Outflow</span>
                          <span className="font-mono font-bold text-slate-900">
                            ${activeDecision.upfrontCashOutflow.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="250000"
                          step="5000"
                          value={activeDecision.upfrontCashOutflow}
                          onChange={(e) => onUpdateDecision({
                            ...activeDecision,
                            upfrontCashOutflow: Number(e.target.value),
                          })}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>

                      {/* Annual Income Delta */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Annual Income Change</span>
                          <span className={`font-mono font-bold ${
                            activeDecision.annualIncomeDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {activeDecision.annualIncomeDelta >= 0 ? '+' : ''}${activeDecision.annualIncomeDelta.toLocaleString()}/yr
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-60000"
                          max="80000"
                          step="2000"
                          value={activeDecision.annualIncomeDelta}
                          onChange={(e) => onUpdateDecision({
                            ...activeDecision,
                            annualIncomeDelta: Number(e.target.value),
                          })}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      {/* Annual Expense Delta */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Annual Expense Change</span>
                          <span className={`font-mono font-bold ${
                            activeDecision.annualExpenseDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            {activeDecision.annualExpenseDelta >= 0 ? '+' : ''}${activeDecision.annualExpenseDelta.toLocaleString()}/yr
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-25000"
                          max="35000"
                          step="1000"
                          value={activeDecision.annualExpenseDelta}
                          onChange={(e) => onUpdateDecision({
                            ...activeDecision,
                            annualExpenseDelta: Number(e.target.value),
                          })}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                      </div>

                      {/* Execution Age */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Execution Age</span>
                          <span className="font-mono font-bold text-sky-800">
                            Age {activeDecision.executionAge}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={profile.currentAge}
                          max={profile.targetRetirementAge - 5}
                          step="1"
                          value={activeDecision.executionAge}
                          onChange={(e) => onUpdateDecision({
                            ...activeDecision,
                            executionAge: Number(e.target.value),
                          })}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FUTURE IMPACT MATRIX */}
            {activeTab === 'impact' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* At Selected Age Card */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    At Age {selectedAge} ({currentProj.calendarYear})
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xl font-extrabold font-mono text-slate-900">
                      ${currentProj.scenarioNetWorth.toLocaleString()}
                    </span>
                    <span className={`font-mono font-bold text-xs ${
                      currentProj.netWorthDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {currentProj.netWorthDelta >= 0 ? '+' : ''}${currentProj.netWorthDelta.toLocaleString()} vs base
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-slate-600">
                    <div className="flex justify-between">
                      <span>Liquid Cash Reserve:</span>
                      <span className="font-mono font-semibold">${currentProj.scenarioLiquid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invested Equities/ETFs:</span>
                      <span className="font-mono font-semibold text-sky-700">${currentProj.scenarioInvested.toLocaleString()}</span>
                    </div>
                    {currentProj.scenarioRealEstate > 0 && (
                      <div className="flex justify-between">
                        <span>Property / Physical Equity:</span>
                        <span className="font-mono font-semibold text-violet-700">${currentProj.scenarioRealEstate.toLocaleString()}</span>
                      </div>
                    )}
                    {currentProj.scenarioDebt > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Remaining Debt/Mortgage:</span>
                        <span className="font-mono font-semibold">-${currentProj.scenarioDebt.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opportunity Cost Compounding Counterfactual */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[11px] uppercase font-bold text-amber-700 tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Opportunity Cost of Outflow</span>
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900 mb-1">
                    ${currentProj.opportunityCostOfSpentCapital.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    If all upfront capital & excess recurring costs had instead remained in 7.5% market index funds, this is what that money would be worth at Age {selectedAge}.
                  </p>
                  <div className="mt-2 text-[11px] bg-amber-50 border border-amber-200/60 text-amber-800 p-2 rounded-lg">
                    {summary.breakevenAge ? (
                      <span>Breakeven achieved at <strong>Age {summary.breakevenAge}</strong>.</span>
                    ) : (
                      <span>Takes longer than simulation horizon to surpass baseline liquidity.</span>
                    )}
                  </div>
                </div>

                {/* Retirement Horizon Delta */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    At Target Retirement (Age {profile.targetRetirementAge})
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xl font-extrabold font-mono text-slate-900">
                      ${summary.netWorthAtRetirementScenario.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs">
                      Base: ${(summary.netWorthAtRetirementBaseline / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className={`text-xs font-bold mb-2 ${isFavorable ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Net Lifetime Gain: {isFavorable ? '+' : ''}${summary.lifetimeNetWorthDelta.toLocaleString()}
                  </div>
                  <div className="space-y-1 text-slate-600 pt-1 border-t border-slate-200 text-[11px]">
                    <div className="flex justify-between">
                      <span>Baseline FIRE Date:</span>
                      <span className="font-semibold">{summary.fireAgeBaseline ? `Age ${summary.fireAgeBaseline}` : 'Age 65+'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scenario FIRE Date:</span>
                      <span className="font-semibold text-sky-700">{summary.fireAgeScenario ? `Age ${summary.fireAgeScenario}` : 'Age 65+'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RISK & STRESS TEST */}
            {activeTab === 'stress' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[11px] uppercase font-bold text-rose-700 tracking-wider mb-1">
                    Recession Stress Test (-28% Bear Market)
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mb-1">
                    ${currentProj.bearMarketNetWorth.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Simulates a severe market drawdown occurring at Age {selectedAge}. Shows your downside floor assuming public equities fall 28% and real estate corrects 10%.
                  </p>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[11px] uppercase font-bold text-sky-700 tracking-wider mb-1">
                    Emergency Liquidity Runway
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1">
                    {summary.emergencyRunwayMonthsScenario} Months
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Survival horizon if household income went to $0 tomorrow. Standard recommended safety benchmark is 6 months minimum.
                  </p>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3">
                  <div className="text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Debt-to-Income & Leverage
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1">
                    {currentProj.scenarioDebt > 0 
                      ? `${(currentProj.scenarioDebt / Math.max(1, currentProj.scenarioIncome)).toFixed(1)}x Income`
                      : 'Zero Debt'}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {currentProj.scenarioDebt > currentProj.scenarioIncome * 4 
                      ? 'High leverage: sensitive to rate shifts and cashflow disruptions.' 
                      : 'Safe conservative leverage ratio.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: STRATEGIC INSIGHTS */}
            {activeTab === 'strategy' && (
              <div className="space-y-2 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-950 mb-0.5">Core Strategic Recommendation</h5>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">
                      {summary.lifetimeNetWorthDelta > 200000 
                        ? 'This decision strongly outpaces baseline compounding due to equity appreciation and earnings acceleration. Ensure you keep 6 months of cash reserves liquid so you are never forced to liquidate assets during market corrections.'
                        : summary.lifetimeNetWorthDelta < 0 
                        ? 'Opportunity cost drag is significant. To make this decision financially neutral, consider pairing it with a side-income stream of $8,000/year or extending your targeted retirement by 1.5 years.'
                        : 'Balanced impact: this decision provides lifestyle benefits with neutral long-term wealth erosion. Rebalance index contributions annually.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white border border-slate-200/70 p-2.5 rounded-lg text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Tax Advantage & Mortgage Shield:</strong>
                    If choosing property, deduct mortgage interest and property taxes where eligible. Keep reinvesting freed-up amortization principal.
                  </div>
                  <div className="bg-white border border-slate-200/70 p-2.5 rounded-lg text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Debt Payoff vs Market Arbitrage:</strong>
                    With market returns at {profile.expectedInvestmentReturn * 100}%, any debt under 5% interest should be paid slowly; debt above 7% should be paid aggressively.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Scrubber Bar */}
        <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center gap-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Timeline
          </span>

          <input
            type="range"
            min={minAge}
            max={maxAge}
            value={selectedAge}
            onChange={(e) => onSelectAge(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />

          <div className="flex items-center gap-1 shrink-0 font-mono text-xs">
            <span className="text-slate-400">Age {minAge}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-800">Age {selectedAge}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Age {maxAge}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
