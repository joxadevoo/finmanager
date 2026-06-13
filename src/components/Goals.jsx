import React, { useState } from 'react';
import { Plus, Trash2, X, PlusCircle, Calendar, Award } from 'lucide-react';

export default function Goals({
  goals,
  accounts,
  onAddGoal,
  onDeleteGoal,
  onContributeToGoal
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  
  // Add Goal Form State
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('from-purple-500 to-indigo-500');

  // Contribute Form State
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  const formatUZS = (val) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

  const handleAddGoalSubmit = (e) => {
    e.preventDefault();
    if (!name || !target || Number(target) <= 0) {
      alert('Iltimos, maqsad nomi va to\'g\'ri summani kiriting');
      return;
    }

    const newGoal = {
      id: 'goal-' + Date.now(),
      name,
      target: Number(target),
      current: Number(current) || 0,
      deadline,
      color
    };

    onAddGoal(newGoal);
    setIsAddModalOpen(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setName('');
    setTarget('');
    setCurrent('0');
    setDeadline('');
    setColor('from-purple-500 to-indigo-500');
  };

  const handleContributeSubmit = (e) => {
    e.preventDefault();
    if (!selectedGoalId || !fromAccountId || !contributionAmount || Number(contributionAmount) <= 0) {
      alert('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring');
      return;
    }

    // Check account balance
    const account = accounts.find(a => a.id === fromAccountId);
    if (!account) return;

    if (account.balance < Number(contributionAmount)) {
      alert(`Xatolik: tanlangan hisobda yetarli mablag' mavjud emas. Qoldiq: ${formatUZS(account.balance)}`);
      return;
    }

    onContributeToGoal(selectedGoalId, fromAccountId, Number(contributionAmount));
    setIsContributeModalOpen(false);
    setSelectedGoalId('');
    setFromAccountId('');
    setContributionAmount('');
  };

  const colors = [
    { value: 'from-purple-500 to-indigo-500', name: 'Siyohrang / Indigo' },
    { value: 'from-cyan-500 to-blue-500', name: 'Havorang / Ko\'k' },
    { value: 'from-emerald-500 to-teal-500', name: 'Yashil / Zumrad' },
    { value: 'from-amber-500 to-orange-500', name: 'Sariq / Sabzirang' },
    { value: 'from-pink-500 to-rose-500', name: 'Pushti / Qizil' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Jamg'arma Maqsadlari</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Orzuingizdagi xaridlar uchun maqsadlar yarating va ularga pul to'plab boring.
          </p>
        </div>
        
        <div className="flex gap-2">
          {goals.length > 0 && (
            <button 
              onClick={() => setIsContributeModalOpen(true)}
              className="btn-secondary rounded-xl py-2.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Pul jamg'arish</span>
            </button>
          )}
          
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="btn-primary rounded-xl py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Maqsad</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min(((goal.current / goal.target) * 100), 100).toFixed(0);
          const isCompleted = goal.current >= goal.target;
          
          // Calculate remaining days
          let remainingDaysText = '';
          if (goal.deadline) {
            const diffTime = new Date(goal.deadline) - new Date();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              remainingDaysText = `${diffDays} kun qoldi`;
            } else if (isCompleted) {
              remainingDaysText = 'Bajarildi! 🎉';
            } else {
              remainingDaysText = 'Muddati o\'tgan';
            }
          }

          return (
            <div key={goal.id} className="glass-panel p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group">
              {/* Badge for completed */}
              {isCompleted && (
                <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Bajarildi</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{goal.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Muddati: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}
                    </p>
                  </div>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setIsContributeModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Jamg'arish"
                    >
                      <PlusCircle className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                {/* Progress Circle & Text */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-purple-400 text-xs">Yig'ildi: {progress}%</span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">{remainingDaysText}</span>
                  </div>
                  <div className="w-full bg-black/20 light-theme:bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">To'plandi</p>
                    <p className="text-md font-bold text-emerald-400">{formatUZS(goal.current)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Maqsad</p>
                    <p className="text-md font-bold text-[var(--text-primary)]">{formatUZS(goal.target)}</p>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    if (confirm('Ushbu maqsadni o\'chirmoqchimisiz?')) {
                      onDeleteGoal(goal.id);
                    }
                  }}
                  className="p-2 text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all rounded-lg"
                  title="Maqsadni o'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full glass-panel py-16 text-center text-[var(--text-muted)] text-sm">
            Hozircha jamg'arma maqsadlari o'rnatilmagan. Yangi maqsad qo'shish tugmasini bosing!
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative overflow-hidden animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xl font-bold">Yangi Jamg'arma Maqsadi</h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Maqsad nomi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: Yangi Telefon, Mashina uchun boshlang'ich..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Kerakli Summa (UZS)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Masalan: 10,000,000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Boshlang'ich Jamg'arma</label>
                  <input 
                    type="number" 
                    placeholder="Masalan: 1,000,000"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Muddat (Sana)</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Dizayn rangi</label>
                  <select 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full"
                  >
                    {colors.map(col => (
                      <option key={col.value} value={col.value}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                  className="btn-secondary rounded-xl py-2 px-4"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="btn-primary rounded-xl py-2 px-5"
                >
                  Yaratish
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm p-6 relative overflow-hidden animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold">Maqsad uchun pul o'tkazish</h3>
              <button 
                onClick={() => { 
                  setIsContributeModalOpen(false); 
                  setSelectedGoalId(''); 
                  setFromAccountId(''); 
                  setContributionAmount(''); 
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Jamg'arma maqsadi</label>
                <select 
                  required
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full"
                >
                  <option value="">Maqsadni tanlang</option>
                  {goals.filter(g => g.current < g.target).map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.name} (Qoldi: {formatUZS(goal.target - goal.current)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Qaysi hisobdan olinadi</label>
                <select 
                  required
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full"
                >
                  <option value="">Hisob tanlang</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({formatUZS(acc.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Jamg'arma summasi (UZS)</label>
                <input 
                  type="number" 
                  required
                  placeholder="Summani kiriting..."
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => { 
                    setIsContributeModalOpen(false); 
                    setSelectedGoalId(''); 
                    setFromAccountId(''); 
                    setContributionAmount(''); 
                  }}
                  className="btn-secondary rounded-xl py-2 px-4 text-sm"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="btn-primary rounded-xl py-2 px-5 text-sm"
                >
                  O'tkazish
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
