import React, { useState } from 'react';
import { Plus, Edit3, X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Budgets({
  budgets,
  onUpdateBudgetLimit,
  transactions
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('10000000');
  const [selectedRule, setSelectedRule] = useState('50-30-20');

  const formatUZS = (val) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

  const categoryNameMap = {
    food: 'Oziq-ovqat',
    transport: 'Transport',
    utilities: 'Kommunal to\'lovlar',
    entertainment: 'Hordiq va Ko\'ngilochar',
    shopping: 'Xaridlar (Kiyim/Texnika)',
    health: 'Sog\'liq va Tibbiyot',
    education: 'Ta\'lim',
    other_exp: 'Boshqa xarajatlar'
  };

  const handleEditClick = (b) => {
    setSelectedCategory(b.category);
    setNewLimit(b.limit.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLimit || Number(newLimit) <= 0) {
      alert('Iltimos, to\'g\'ri limit kiriting');
      return;
    }
    onUpdateBudgetLimit(selectedCategory, Number(newLimit));
    setIsModalOpen(false);
    setSelectedCategory('');
    setNewLimit('');
  };

  const incomeNum = Number(monthlyIncome) || 0;
  
  let needsVal = 0;
  let wantsVal = 0;
  let savingsVal = 0;
  let debtVal = 0;

  if (selectedRule === '50-30-20') {
    needsVal = incomeNum * 0.5;
    wantsVal = incomeNum * 0.3;
    savingsVal = incomeNum * 0.2;
  } else if (selectedRule === '70-20-10') {
    needsVal = incomeNum * 0.7;
    savingsVal = incomeNum * 0.2;
    debtVal = incomeNum * 0.1;
  } else if (selectedRule === '80-20') {
    needsVal = incomeNum * 0.8;
    savingsVal = incomeNum * 0.2;
  }

  const applyRuleToBudgets = () => {
    if (incomeNum <= 0) return;
    
    if (selectedRule === '50-30-20') {
      onUpdateBudgetLimit('food', incomeNum * 0.25);
      onUpdateBudgetLimit('utilities', incomeNum * 0.15);
      onUpdateBudgetLimit('transport', incomeNum * 0.10);
      onUpdateBudgetLimit('shopping', incomeNum * 0.15);
      onUpdateBudgetLimit('entertainment', incomeNum * 0.10);
      onUpdateBudgetLimit('health', incomeNum * 0.05);
    } else if (selectedRule === '70-20-10') {
      onUpdateBudgetLimit('food', incomeNum * 0.30);
      onUpdateBudgetLimit('shopping', incomeNum * 0.15);
      onUpdateBudgetLimit('entertainment', incomeNum * 0.10);
      onUpdateBudgetLimit('utilities', incomeNum * 0.10);
      onUpdateBudgetLimit('transport', incomeNum * 0.05);
      onUpdateBudgetLimit('health', incomeNum * 0.10);
    } else if (selectedRule === '80-20') {
      onUpdateBudgetLimit('food', incomeNum * 0.35);
      onUpdateBudgetLimit('shopping', incomeNum * 0.20);
      onUpdateBudgetLimit('entertainment', incomeNum * 0.10);
      onUpdateBudgetLimit('utilities', incomeNum * 0.10);
      onUpdateBudgetLimit('transport', incomeNum * 0.05);
    }
    alert('Budjet limitlari qoida bo\'yicha muvaffaqiyatli yangilandi!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Oylik Budjetlar</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Xarajatlar kategoriyalari uchun oylik limitlarni o'rnating va nazorat qiling.
          </p>
        </div>
      </div>

      {/* Budget warnings overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(() => {
          const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;
          const warningBudgetCount = budgets.filter(b => b.spent <= b.limit && b.spent / b.limit > 0.85).length;
          const safeBudgetCount = budgets.length - overBudgetCount - warningBudgetCount;

          return (
            <>
              <div className="glass-panel p-5 border-l-4 border-l-rose-500 flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-400">{overBudgetCount} ta</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Limitdan oshib ketgan</p>
                </div>
              </div>

              <div className="glass-panel p-5 border-l-4 border-l-amber-500 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-400">{warningBudgetCount} ta</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Limitga yaqinlashgan (85%+)</p>
                </div>
              </div>

              <div className="glass-panel p-5 border-l-4 border-l-emerald-500 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-400">{safeBudgetCount} ta</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Xavfsiz / Reja ostida</p>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Two-Column Grid: Left is Budgets List, Right is rules calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: budgets progress list (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map(b => {
              const spentPercent = (b.spent / b.limit) * 100;
              const isOver = b.spent > b.limit;
              const isWarning = !isOver && spentPercent > 85;

              const progressColor = isOver 
                ? 'from-rose-500 to-red-600' 
                : isWarning 
                  ? 'from-amber-500 to-orange-600' 
                  : 'from-emerald-500 to-teal-600';

              const statusBadge = isOver 
                ? 'badge-danger' 
                : isWarning 
                  ? 'badge-warning' 
                  : 'badge-success';

              const statusText = isOver 
                ? 'Limit Oshgan!' 
                : isWarning 
                  ? 'Yaqinlashdi' 
                  : 'Meyorda';

              return (
                <div key={b.category} className="glass-panel p-6 space-y-4 relative group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {categoryNameMap[b.category] || b.category}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${statusBadge} text-[10px] font-bold`}>
                          {statusText}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {spentPercent.toFixed(0)}% sarflandi
                        </span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleEditClick(b)}
                      className="p-2 text-[var(--text-secondary)] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      title="Limitni o'zgartirish"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-black/20 light-theme:bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold">Sarflandi</span>
                        <span className="font-semibold text-[var(--text-primary)]">{formatUZS(b.spent)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold">Limit</span>
                        <span className="font-semibold text-[var(--text-primary)]">{formatUZS(b.limit)}</span>
                      </div>
                    </div>
                  </div>

                  {isOver && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Siz ushbu oylik limitdan {formatUZS(b.spent - b.limit)} ortiqcha sarfladingiz!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: rules guide & calculator (1/3 width) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              Budjet Qoidalari
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Moliya mutaxassislari tomonidan tavsiya etilgan eng mashhur taqsimlash qoidalari yordamida oylik budjetingizni rejalashtiring.
            </p>

            {/* Income Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                Oylik Sof Daromad (UZS)
              </label>
              <input 
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="Masalan: 10,000,000"
                className="w-full text-sm py-2 px-3 bg-black/20"
              />
            </div>

            {/* Rule Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRule('50-30-20')}
                className={`py-1.5 px-1 text-xs rounded-xl font-bold transition-all ${selectedRule === '50-30-20' ? 'active' : 'text-[var(--text-muted)]'}`}
              >
                50/30/20
              </button>
              <button
                type="button"
                onClick={() => setSelectedRule('70-20-10')}
                className={`py-1.5 px-1 text-xs rounded-xl font-bold transition-all ${selectedRule === '70-20-10' ? 'active' : 'text-[var(--text-muted)]'}`}
              >
                70/20/10
              </button>
              <button
                type="button"
                onClick={() => setSelectedRule('80-20')}
                className={`py-1.5 px-1 text-xs rounded-xl font-bold transition-all ${selectedRule === '80-20' ? 'active' : 'text-[var(--text-muted)]'}`}
              >
                80/20
              </button>
            </div>

            {/* Explanation box */}
            <div className="p-4 bg-black/25 light-theme:bg-slate-100 rounded-xl border border-white/5 space-y-3">
              {selectedRule === '50-30-20' && (
                <>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong>50/30/20 Qoidasi:</strong> Daromadni 50% Zaruriyat (oziq-ovqat, transport, kommunal), 30% Xohish (shopping, ko'ngilochar) va 20% Jamg'armaga ajratadi.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Zaruriyatlar (50%):</span>
                      <span className="font-bold text-emerald-400">{formatUZS(needsVal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Xohishlar (30%):</span>
                      <span className="font-bold text-amber-400">{formatUZS(wantsVal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Jamg'arma (20%):</span>
                      <span className="font-bold text-purple-400">{formatUZS(savingsVal)}</span>
                    </div>
                  </div>
                </>
              )}
              {selectedRule === '70-20-10' && (
                <>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong>70/20/10 Qoidasi:</strong> Yashash xarajatlari (70%), uzoq muddatli jamg'arma (20%) va qarz to'lash yoki hayriya (10%) uchun mos keladi.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Kundalik (70%):</span>
                      <span className="font-bold text-emerald-400">{formatUZS(needsVal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Jamg'arma (20%):</span>
                      <span className="font-bold text-purple-400">{formatUZS(savingsVal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Qarz/Hayriya (10%):</span>
                      <span className="font-bold text-rose-400">{formatUZS(debtVal)}</span>
                    </div>
                  </div>
                </>
              )}
              {selectedRule === '80-20' && (
                <>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong>80/20 Qoidasi:</strong> "Avval o'zingizga to'lang". Daromaddan birinchi bo'lib 20% Jamg'armaga olib qo'yiladi va qolgan 80% erkin sarflanadi.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Xarajatlar (80%):</span>
                      <span className="font-bold text-emerald-400">{formatUZS(needsVal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Jamg'arma (20%):</span>
                      <span className="font-bold text-purple-400">{formatUZS(savingsVal)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={applyRuleToBudgets}
              className="btn-primary w-full py-2.5 rounded-xl text-xs flex justify-center items-center gap-2"
            >
              <span>Budjetlarni Avtomatik Taqsimlash</span>
            </button>
            
          </div>
        </div>
      </div>

      {/* Edit Budget Limit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm p-6 relative overflow-hidden animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold">Limitni Tahrirlash</h3>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedCategory(''); }}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Kategoriya</label>
                <p className="font-bold text-md text-purple-400 py-1">
                  {categoryNameMap[selectedCategory] || selectedCategory}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Yangi Oylik Limit (UZS)</label>
                <input 
                  type="number" 
                  required
                  placeholder="Masalan: 2,500,000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setSelectedCategory(''); }}
                  className="btn-secondary rounded-xl py-2 px-4 text-sm"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="btn-primary rounded-xl py-2 px-5 text-sm"
                >
                  Saqlash
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
