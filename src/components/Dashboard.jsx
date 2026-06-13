import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  ChevronRight,
  Plus,
  Target,
  Utensils,
  Car,
  Home,
  Film,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Gift,
  PlusCircle,
  ArrowRightLeft,
  HelpCircle
} from 'lucide-react';

const categoryIconMap = {
  food: <Utensils className="w-5 h-5" />,
  transport: <Car className="w-5 h-5" />,
  utilities: <Home className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  entertainment: <Film className="w-5 h-5" />,
  health: <HeartPulse className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  other_exp: <MoreHorizontal className="w-5 h-5" />,
  salary: <Briefcase className="w-5 h-5" />,
  freelance: <Laptop className="w-5 h-5" />,
  investment: <TrendingUp className="w-5 h-5" />,
  gift: <Gift className="w-5 h-5" />,
  other_inc: <PlusCircle className="w-5 h-5" />,
  savings: <Target className="w-5 h-5" />,
  transfer: <ArrowRightLeft className="w-5 h-5" />
};

const categoryNameMap = {
  food: 'Oziq-ovqat',
  transport: 'Transport',
  utilities: 'Kommunallar',
  shopping: 'Xaridlar',
  entertainment: 'Hordiq',
  health: 'Sog\'liq',
  education: 'Ta\'lim',
  other_exp: 'Boshqa',
  salary: 'Oylik',
  freelance: 'Frilans',
  investment: 'Investitsiya',
  gift: 'Sovg\'a',
  other_inc: 'Boshqa',
  savings: 'Jamg\'arma',
  transfer: 'O\'tkazma'
};

const getCategoryColor = (category, type) => {
  const isExpense = type === 'expense';
  const isTransfer = type === 'transfer';
  
  if (isTransfer) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  
  const expenseColors = {
    food: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    transport: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    utilities: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    entertainment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    shopping: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    other_exp: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const incomeColors = {
    salary: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    freelance: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    investment: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    gift: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    other_inc: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return isExpense 
    ? (expenseColors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20') 
    : (incomeColors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20');
};


export default function Dashboard({ 
  transactions, 
  accounts, 
  budgets, 
  goals,
  setActiveTab,
  onOpenAddTransaction
}) {


  // Calculate totals
  const totalAssets = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyExpense = monthlyTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const netSavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? ((netSavings / monthlyIncome) * 100).toFixed(0) : 0;
  const recentTransactions = transactions.slice(0, 5);

  // Format currency helper
  const formatUZS = (val) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

  const getAccountIcon = (iconName) => {
    switch (iconName) {
      case 'credit-card': return <CreditCard className="w-5 h-5" />;
      case 'banknote': return <Banknote className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Xush kelibsiz! 👋</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Bugun: {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onOpenAddTransaction('expense')} 
            className="btn-danger flex items-center gap-2 rounded-xl"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Xarajat qo'shish</span>
          </button>
          <button 
            onClick={() => onOpenAddTransaction('income')} 
            className="btn-success rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Daromad qo'shish</span>
          </button>
        </div>
      </div>



      {/* Main KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-[var(--text-primary)] group-hover:scale-110 transition-transform duration-300">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Umumiy Jamg'armalar (Aktivlar)</p>
          <h2 className="text-2xl font-bold mt-2 tracking-tight">{formatUZS(totalAssets)}</h2>
          <div className="mt-4 flex items-center text-xs text-[var(--text-muted)]">
            Hamyonlar va kartalardagi qoldiqlar
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <ArrowUpRight className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Bu oydagi Daromad</p>
          <h2 className="text-2xl font-bold mt-2 text-emerald-400 tracking-tight">+{formatUZS(monthlyIncome)}</h2>
          <div className="mt-4 flex items-center text-xs text-emerald-400/80 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            Ushbu oydagi barcha tushumlar
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-rose-400 group-hover:scale-110 transition-transform duration-300">
            <ArrowDownLeft className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Bu oydagi Xarajat</p>
          <h2 className="text-2xl font-bold mt-2 text-rose-400 tracking-tight">-{formatUZS(monthlyExpense)}</h2>
          <div className="mt-4 flex items-center text-xs text-rose-400/80 font-medium">
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
            Ushbu oydagi barcha chiqimlar
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-violet-400 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Sof Oylik Tejash</p>
          <h2 className={`text-2xl font-bold mt-2 tracking-tight ${netSavings >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
            {netSavings >= 0 ? '+' : ''}{formatUZS(netSavings)}
          </h2>
          <div className="mt-4 flex items-center text-xs text-[var(--text-secondary)] font-medium">
            <span className="badge badge-info text-[10px] py-0.5 px-2 mr-2">Tejash darajasi: {savingsRate}%</span>
          </div>
        </div>
      </div>
      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions (2/3 width on desktop) */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">So'nggi Amallar</h3>
            <button 
              onClick={() => setActiveTab('transactions')} 
              className="text-xs font-semibold text-purple-400 flex items-center hover:underline py-1 px-3 gap-1"
            >
              Barchasi <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Responsive Transactions Feed List */}
          <div className="flex flex-col gap-3">
            {recentTransactions.map(tx => {
              const isExpense = tx.type === 'expense';
              const isTransfer = tx.type === 'transfer';
              const isIncome = tx.type === 'income';

              const accountName = isTransfer
                ? `${accounts.find(a => a.id === tx.fromAccountId)?.name || tx.fromAccountId} ➔ ${accounts.find(a => a.id === tx.toAccountId)?.name || tx.toAccountId}`
                : (accounts.find(a => a.id === tx.accountId)?.name || tx.accountId);

              const catColor = getCategoryColor(tx.category, tx.type);

              return (
                <div key={tx.id} className="tx-item">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon Container */}
                    <div className={`tx-icon-box ${catColor}`}>
                      {categoryIconMap[tx.category] || <HelpCircle className="w-5 h-5" />}
                    </div>
                    
                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          {categoryNameMap[tx.category] || tx.category}
                        </span>
                        <span className="tx-account-badge">
                          {accountName}
                        </span>
                      </div>
                      <p className="tx-notes">
                        {tx.notes || (isTransfer ? "Hisoblararo o'tkazma" : "Izoh yo'q")}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Amount and date */}
                  <div className="tx-right-side">
                    <span className={`tx-amount ${isExpense ? 'text-rose-400' : isTransfer ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {isExpense ? '-' : isIncome ? '+' : ''}{formatUZS(tx.amount)}
                    </span>
                    <span className="tx-date">
                      {tx.date}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div className="text-center py-10 text-[var(--text-muted)]">
                <Sparkles className="w-8 h-8 mx-auto opacity-20 mb-2" />
                <p className="text-sm">Hozircha hech qanday tranzaksiya mavjud emas</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stack of Goals and Budgets (1/3 width on desktop) */}
        <div className="space-y-8 flex flex-col">
          
          {/* Target Goals Summary */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Jamg'arma Maqsadlari</h3>
              <button 
                onClick={() => setActiveTab('goals')} 
                className="text-xs font-semibold text-purple-400 flex items-center hover:underline py-1 px-3 gap-1"
              >
                Barchasi <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => {
                const progress = Math.min(((goal.current / goal.target) * 100), 100).toFixed(0);
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-sm">{goal.name}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{progress}% ({formatUZS(goal.current)})</span>
                    </div>
                    <div className="w-full bg-[rgba(255,255,255,0.05)] light-theme:bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">Maqsadlar yo'q</p>
              )}
            </div>
          </div>

          {/* Budgets Progress Overview */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Budjet Nazorati</h3>
              <button 
                onClick={() => setActiveTab('budgets')} 
                className="text-xs font-semibold text-purple-400 flex items-center hover:underline py-1 px-3 gap-1"
              >
                Barchasi <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {budgets.slice(0, 4).map(b => {
                const spentPercent = ((b.spent / b.limit) * 100);
                const colorClass = spentPercent > 100 
                  ? 'bg-rose-500' 
                  : spentPercent > 85 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500';

                const categoryNameMap = {
                  food: 'Oziq-ovqat',
                  transport: 'Transport',
                  utilities: 'Kommunallar',
                  shopping: 'Xaridlar',
                  entertainment: 'Hordiq',
                  health: 'Sog\'liq'
                };

                return (
                  <div key={b.category} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{categoryNameMap[b.category] || b.category}</span>
                      <span className="text-[var(--text-secondary)]">
                        {formatUZS(b.spent)} / {formatUZS(b.limit)}
                      </span>
                    </div>
                    <div className="w-full bg-[rgba(255,255,255,0.05)] light-theme:bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClass} rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {budgets.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">Budjetlar o'rnatilmagan</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
