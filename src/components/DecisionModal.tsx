import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { FinancialDecision, DecisionCategory } from '../types/finance';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDecision: (decision: FinancialDecision) => void;
  currentAge: number;
}

const CATEGORY_COLORS: Record<DecisionCategory, string> = {
  home: '#38bdf8', // sky blue
  career: '#10b981', // emerald
  vehicle: '#f43f5e', // rose
  business: '#f59e0b', // amber
  investment: '#8b5cf6', // purple
  lifestyle: '#06b6d4', // cyan
  family: '#ec4899', // pink
};

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  onSaveDecision,
  currentAge,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DecisionCategory>('investment');
  const [description, setDescription] = useState('');
  const [executionAge, setExecutionAge] = useState(currentAge + 2);
  const [upfrontCashOutflow, setUpfrontCashOutflow] = useState(25000);
  const [annualIncomeDelta, setAnnualIncomeDelta] = useState(12000);
  const [annualExpenseDelta, setAnnualExpenseDelta] = useState(3000);
  const [assetValueAdded, setAssetValueAdded] = useState(0);
  const [assetAppreciationRate, setAssetAppreciationRate] = useState(0.04);
  const [debtIncurred, setDebtIncurred] = useState(0);
  const [debtInterestRate, setDebtInterestRate] = useState(0.065);
  const [debtTermYears, setDebtTermYears] = useState(15);
  const [colorHex, setColorHex] = useState(CATEGORY_COLORS['investment']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDecision: FinancialDecision = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || 'Custom user financial decision scenario.',
      executionAge: Number(executionAge),
      upfrontCashOutflow: Number(upfrontCashOutflow),
      annualIncomeDelta: Number(annualIncomeDelta),
      annualExpenseDelta: Number(annualExpenseDelta),
      assetValueAdded: Number(assetValueAdded),
      assetAppreciationRate: Number(assetAppreciationRate),
      debtIncurred: Number(debtIncurred),
      debtInterestRate: Number(debtInterestRate),
      debtTermYears: Number(debtTermYears),
      notes: 'Custom scenario evaluated by Equilibrium model.',
      enabled: true,
      colorHex,
    };

    onSaveDecision(newDecision);
    onClose();
  };

  const handleCategoryChange = (cat: DecisionCategory) => {
    setCategory(cat);
    setColorHex(CATEGORY_COLORS[cat]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Model New Financial Decision</h3>
              <p className="text-[11px] text-slate-500">Inject a life milestone into the 30-year simulation</p>
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
          {/* Decision Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Decision Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Austin Rental Property / Career Shift / EV Purchase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium text-slate-900"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {(['home', 'career', 'vehicle', 'business', 'investment', 'lifestyle', 'family'] as DecisionCategory[]).map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium text-[11px] transition-all ${
                    category === cat
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Age & Upfront Outflow */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Execution Age</label>
              <input
                type="number"
                min={currentAge}
                max={75}
                value={executionAge}
                onChange={(e) => setExecutionAge(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Upfront Cash Outflow ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={upfrontCashOutflow}
                onChange={(e) => setUpfrontCashOutflow(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Annual Income & Expense Changes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Income Change ($/yr)</label>
              <input
                type="number"
                step="1000"
                value={annualIncomeDelta}
                onChange={(e) => setAnnualIncomeDelta(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Expense Change ($/yr)</label>
              <input
                type="number"
                step="1000"
                value={annualExpenseDelta}
                onChange={(e) => setAnnualExpenseDelta(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Physical Asset & Debt fields (Optional) */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Asset & Loan Structure (Optional)
            </span>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block text-slate-600 mb-1">Asset Value Added ($)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={assetValueAdded}
                  onChange={(e) => setAssetValueAdded(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                  placeholder="e.g. 500000"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Asset Appreciation Rate (%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={assetAppreciationRate}
                  onChange={(e) => setAssetAppreciationRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                  placeholder="0.04"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 mb-1">Debt Taken ($)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={debtIncurred}
                  onChange={(e) => setDebtIncurred(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.005"
                  value={debtInterestRate}
                  onChange={(e) => setDebtInterestRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Term (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={debtTermYears}
                  onChange={(e) => setDebtTermYears(Number(e.target.value))}
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
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Decision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
