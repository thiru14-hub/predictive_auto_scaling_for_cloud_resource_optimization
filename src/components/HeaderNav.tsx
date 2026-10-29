import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Eye, 
  Plus, 
  User, 
  RotateCcw,
  Compass,
  Maximize2
} from 'lucide-react';
import { SceneVisualizationMode, CameraPreset, SimulationSummary } from '../types/finance';

interface HeaderNavProps {
  summary: SimulationSummary;
  visualizationMode: SceneVisualizationMode;
  onSelectMode: (mode: SceneVisualizationMode) => void;
  cameraPreset: CameraPreset;
  onSelectCamera: (preset: CameraPreset) => void;
  onOpenDecisionModal: () => void;
  onOpenProfileModal: () => void;
  onResetDefaults: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  summary,
  visualizationMode,
  onSelectMode,
  cameraPreset,
  onSelectCamera,
  onOpenDecisionModal,
  onOpenProfileModal,
  onResetDefaults,
}) => {
  const isPositiveDelta = summary.lifetimeNetWorthDelta >= 0;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Branding & High-Level Spec */}
        <div className="pointer-events-auto flex items-center gap-3 bg-white/90 border border-slate-200/80 shadow-xs px-3.5 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900">EQUILIBRIUM</h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                PROTOTYPE 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Financial Decision & Future Impact Engine</p>
          </div>
        </div>

        {/* Center: Live Impact Delta Metric Pill */}
        <div className="pointer-events-auto hidden md:flex items-center gap-4 bg-white/90 border border-slate-200/80 shadow-xs px-4 py-1.5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Lifetime Net Impact</span>
            <span className={`text-sm font-bold font-mono ${isPositiveDelta ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositiveDelta ? '+' : ''}${Math.abs(summary.lifetimeNetWorthDelta).toLocaleString()}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Financial Independence</span>
            <span className="text-sm font-bold text-slate-800">
              {summary.fireAgeScenario ? `Age ${summary.fireAgeScenario}` : 'Age 65+'}
              {summary.fireAgeBaseline && summary.fireAgeScenario && (
                <span className="text-[10px] ml-1 text-slate-400 font-normal">
                  (Base: {summary.fireAgeBaseline})
                </span>
              )}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Resilience Score</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800">{summary.financialResilienceScore}/100</span>
              <span className={`w-2 h-2 rounded-full ${
                summary.financialResilienceScore >= 75 ? 'bg-emerald-500' :
                summary.financialResilienceScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Right: 3D Visualization Modes & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-white/90 border border-slate-200/80 shadow-xs p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => onSelectMode('horizon')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                visualizationMode === 'horizon' 
                  ? 'bg-sky-50 text-sky-700 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="3D 30-Year Wealth Horizon Timeline"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Horizon</span>
            </button>

            <button
              onClick={() => onSelectMode('anatomy')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                visualizationMode === 'anatomy' 
                  ? 'bg-sky-50 text-sky-700 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="3D Asset & Liability Gyroscope"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Anatomy</span>
            </button>

            <button
              onClick={() => onSelectMode('divergence')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                visualizationMode === 'divergence' 
                  ? 'bg-sky-50 text-sky-700 shadow-xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="3D Decision Divergence Fork"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fork</span>
            </button>
          </div>

          {/* Camera Angles */}
          <div className="hidden lg:flex bg-white/90 border border-slate-200/80 shadow-xs p-1 rounded-xl items-center gap-0.5">
            <button
              onClick={() => onSelectCamera('diagonal')}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                cameraPreset === 'diagonal' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Persp
            </button>
            <button
              onClick={() => onSelectCamera('front')}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                cameraPreset === 'front' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => onSelectCamera('top')}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                cameraPreset === 'top' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Top
            </button>
          </div>

          {/* Profile & Custom Decision Buttons */}
          <button
            onClick={onOpenProfileModal}
            className="bg-white/90 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 shadow-xs px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Edit Baseline Financial Profile"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Profile</span>
          </button>

          <button
            onClick={onOpenDecisionModal}
            className="bg-sky-600 hover:bg-sky-700 text-white shadow-xs px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Simulate New Decision"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Decision</span>
          </button>
        </div>
      </div>
    </header>
  );
};
