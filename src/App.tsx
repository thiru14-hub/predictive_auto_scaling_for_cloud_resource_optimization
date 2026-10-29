import React, { useState, useMemo } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeaderNav } from './components/HeaderNav';
import { BottomControlDock } from './components/BottomControlDock';
import { DecisionModal } from './components/DecisionModal';
import { ProfileModal } from './components/ProfileModal';
import { YearInspectionHUD } from './components/YearInspectionHUD';
import { DEFAULT_USER_PROFILE, PRESET_DECISIONS } from './utils/presets';
import { calculateProjections } from './utils/financeEngine';
import { 
  UserProfile, 
  FinancialDecision, 
  SceneVisualizationMode, 
  CameraPreset 
} from './types/finance';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [decisions, setDecisions] = useState<FinancialDecision[]>(PRESET_DECISIONS);
  const [selectedAge, setSelectedAge] = useState<number>(profile.currentAge + 5);
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<SceneVisualizationMode>('horizon');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('diagonal');

  // Modal dialog states
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Compute 30+ year projection matrix and summary metrics
  const { projections, summary } = useMemo(() => {
    return calculateProjections(profile, decisions);
  }, [profile, decisions]);

  // Selected or active year projection for HUD
  const activeProjection = useMemo(() => {
    const ageToInspect = hoveredAge !== null ? hoveredAge : selectedAge;
    return projections.find(p => p.age === ageToInspect) || projections[0];
  }, [projections, selectedAge, hoveredAge]);

  const handleToggleDecision = (id: string) => {
    setDecisions(prev =>
      prev.map(d => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleUpdateDecision = (updated: FinancialDecision) => {
    setDecisions(prev =>
      prev.map(d => (d.id === updated.id ? updated : d))
    );
  };

  const handleSaveNewDecision = (newDecision: FinancialDecision) => {
    setDecisions(prev => [newDecision, ...prev]);
  };

  const handleResetDefaults = () => {
    setProfile(DEFAULT_USER_PROFILE);
    setDecisions(PRESET_DECISIONS);
    setSelectedAge(DEFAULT_USER_PROFILE.currentAge + 5);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 font-sans select-none">
      {/* Three.js Interactive 3D WebGL Canvas */}
      <ThreeCanvas
        projections={projections}
        selectedAge={selectedAge}
        onSelectAge={setSelectedAge}
        visualizationMode={visualizationMode}
        cameraPreset={cameraPreset}
        hoveredAge={hoveredAge}
        onHoverAge={setHoveredAge}
      />

      {/* Top Navigation & Live Metric Badges */}
      <HeaderNav
        summary={summary}
        visualizationMode={visualizationMode}
        onSelectMode={setVisualizationMode}
        cameraPreset={cameraPreset}
        onSelectCamera={setCameraPreset}
        onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* Floating Monolith Inspection HUD (Pops up when interacting with a year) */}
      {activeProjection && (
        <YearInspectionHUD
          projection={activeProjection}
          activeDecisions={decisions.filter(d => d.enabled)}
        />
      )}

      {/* Sleek Collapsible Bottom Dock (Decision Studio, Sliders, Future Impact, Stress Tests) */}
      <BottomControlDock
        decisions={decisions}
        onToggleDecision={handleToggleDecision}
        onUpdateDecision={handleUpdateDecision}
        selectedAge={selectedAge}
        onSelectAge={setSelectedAge}
        projections={projections}
        summary={summary}
        profile={profile}
      />

      {/* Modals */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSaveDecision={handleSaveNewDecision}
        currentAge={profile.currentAge}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />
    </div>
  );
}
