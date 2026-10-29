import React, { useState } from 'react';
import { X, User, Check } from 'lucide-react';
import { UserProfile } from '../types/finance';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Baseline Financial Profile</h3>
              <p className="text-[11px] text-slate-500">Configure your current financial reality and market benchmarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Age Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Age</label>
              <input
                type="number"
                min="18"
                max="80"
                value={formData.currentAge}
                onChange={(e) => setFormData({ ...formData, currentAge: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Retirement Age</label>
              <input
                type="number"
                min="40"
                max="90"
                value={formData.targetRetirementAge}
                onChange={(e) => setFormData({ ...formData, targetRetirementAge: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Current Balance Sheet */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Current Assets & Liabilities
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 mb-1">Liquid Cash ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.currentLiquidSavings}
                  onChange={(e) => setFormData({ ...formData, currentLiquidSavings: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Investments ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.currentInvestments}
                  onChange={(e) => setFormData({ ...formData, currentInvestments: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Total Debts ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.currentDebts}
                  onChange={(e) => setFormData({ ...formData, currentDebts: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Income & Expenses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Gross Income ($)</label>
              <input
                type="number"
                min="10000"
                step="5000"
                value={formData.annualGrossIncome}
                onChange={(e) => setFormData({ ...formData, annualGrossIncome: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Living Expenses ($)</label>
              <input
                type="number"
                min="5000"
                step="2000"
                value={formData.annualLivingExpenses}
                onChange={(e) => setFormData({ ...formData, annualLivingExpenses: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Macro Assumptions */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Macro & Growth Assumptions
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 mb-1">Market Return (%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.expectedInvestmentReturn}
                  onChange={(e) => setFormData({ ...formData, expectedInvestmentReturn: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Inflation (%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.inflationRate}
                  onChange={(e) => setFormData({ ...formData, inflationRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Salary Growth (%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.annualIncomeGrowthRate}
                  onChange={(e) => setFormData({ ...formData, annualIncomeGrowthRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
