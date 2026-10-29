import React from 'react';
import { YearProjection, FinancialDecision } from '../types/finance';
import { Calendar, DollarSign, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

interface YearInspectionHUDProps {
  projection: YearProjection;
  activeDecisions: FinancialDecision[];
}

export const YearInspectionHUD: React.FC<YearInspectionHUDProps> = ({
  projection,
  activeDecisions,
}) => {
  const isGain = projection.netWorthDelta >= 0;

  return (
    <div className="absolute top-16 left-4 z-20 pointer-events-none hidden sm:block max-w-xs animate-in fade-in duration-150">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-lg space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-bold text-slate-800">Age {projection.age}</span>
            <span className="text-[11px] text-slate-400 font-mono">({projection.calendarYear})</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
            isGain ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {isGain ? '+' : ''}${projection.netWorthDelta.toLocaleString()}
          </span>
        </div>

        {/* Wealth Breakdown */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-500 text-[11px]">Scenario Net Worth:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ${projection.scenarioNetWorth.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-baseline text-[11px] text-slate-500">
            <span>Baseline Status Quo:</span>
            <span className="font-mono text-slate-600">
              ${projection.baselineNetWorth.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Visual Composition Bar */}
        <div className="pt-1">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {/* Liquid */}
            <div 
              style={{ width: `${Math.min(100, (projection.scenarioLiquid / Math.max(1, projection.scenarioNetWorth)) * 100)}%` }} 
              className="bg-emerald-400 h-full"
              title="Liquid Cash"
            />
            {/* Invested */}
            <div 
              style={{ width: `${Math.min(100, (projection.scenarioInvested / Math.max(1, projection.scenarioNetWorth)) * 100)}%` }} 
              className="bg-sky-400 h-full"
              title="Invested Assets"
            />
            {/* Real Estate */}
            <div 
              style={{ width: `${Math.min(100, (projection.scenarioRealEstate / Math.max(1, projection.scenarioNetWorth)) * 100)}%` }} 
              className="bg-violet-400 h-full"
              title="Real Estate"
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
            <span>Cash ${(projection.scenarioLiquid / 1000).toFixed(0)}k</span>
            <span>Inv ${(projection.scenarioInvested / 1000).toFixed(0)}k</span>
            {projection.scenarioRealEstate > 0 && <span>RE ${(projection.scenarioRealEstate / 1000).toFixed(0)}k</span>}
          </div>
        </div>

        {/* Active Milestones at this Year */}
        {projection.milestones && projection.milestones.length > 0 && (
          <div className="pt-1.5 border-t border-slate-100 space-y-1">
            {projection.milestones.map((m) => (
              <div 
                key={m.id}
                className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
              >
                {m.type === 'fire' ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : m.type === 'warning' ? (
                  <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                ) : (
                  <Award className="w-3 h-3 text-sky-600 shrink-0" />
                )}
                <span className="truncate">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
