import React, { useState } from 'react';
import { initialCategories } from '../data/mockData';
import { Calendar, TrendingDown, ArrowDownLeft, ArrowUpRight, BarChart2 } from 'lucide-react';

export default function Analytics({
  transactions,
  accounts
}) {
  const [timePeriod, setTimePeriod] = useState('month'); // month, all

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
    other_exp: 'Boshqa xarajatlar',
    salary: 'Ish haqi',
    freelance: 'Frilans / Biznes',
    investment: 'Investitsiyalar',
    gift: 'Hadiya / Sovg\'a',
    other_inc: 'Boshqa daromadlar',
    transfer: 'O\'tkazma'
  };

  const categoryColorMap = {
    food: '#f43f5e', // rose
    transport: '#3b82f6', // blue
    utilities: '#f59e0b', // amber
    entertainment: 'var(--accent-primary)', // cream
    shopping: '#ec4899', // pink
    health: '#10b981', // emerald
    education: 'var(--accent-secondary)', // beige
    other_exp: '#64748b', // slate
  };

  // Filter transactions based on time period
  const filteredTx = transactions.filter(tx => {
    if (timePeriod === 'month') {
      const now = new Date();
      const txDate = new Date(tx.date);
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    return true; // all time
  });

  const totalExpense = filteredTx
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = filteredTx
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Group expenses by category
  const expenseByCategory = {};
  filteredTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    });

  // Convert to array and calculate percentages
  const chartData = Object.keys(expenseByCategory).map(catKey => {
    const amount = expenseByCategory[catKey];
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    return {
      category: catKey,
      name: categoryNameMap[catKey] || catKey,
      amount,
      percentage,
      color: categoryColorMap[catKey] || '#a1a1aa'
    };
  }).sort((a, b) => b.amount - a.amount);

  // SVG Donut Calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  const [activeSlice, setActiveSlice] = useState(null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Moliya Tahlili</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Kirim va chiqimlaringizning batafsil tahlili va taqsimoti.
          </p>
        </div>

        <div>
          <select 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
            className="rounded-xl py-2 px-4 bg-[var(--panel-bg)] border border-[var(--panel-border)] font-semibold text-sm cursor-pointer"
          >
            <option value="month">Ushbu oydagi xarajatlar</option>
            <option value="all">Barcha davrlardagi xarajatlar</option>
          </select>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Jami Kirim</p>
            <h3 className="text-lg font-bold text-emerald-400 mt-0.5">+{formatUZS(totalIncome)}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Jami Chiqim</p>
            <h3 className="text-lg font-bold text-rose-400 mt-0.5">-{formatUZS(totalExpense)}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">O'rtacha balans</p>
            <h3 className="text-lg font-bold text-purple-400 mt-0.5">
              {formatUZS(totalIncome - totalExpense)}
            </h3>
          </div>
        </div>
      </div>

      {/* Donut Chart & Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SVG Donut Chart */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] self-start">Xarajatlar Diagrammasi</h3>
          
          {totalExpense > 0 ? (
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                <circle 
                  cx="70" 
                  cy="70" 
                  r={radius} 
                  fill="transparent" 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth="16" 
                />
                {chartData.map((slice, index) => {
                  const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
                  accumulatedPercentage += slice.percentage;

                  const isHovered = activeSlice === index;

                  return (
                    <circle
                      key={slice.category}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 20 : 16}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-300 ease-out"
                      onMouseEnter={() => setActiveSlice(index)}
                      onMouseLeave={() => setActiveSlice(null)}
                      style={{
                        transformOrigin: '70px 70px',
                      }}
                    />
                  );
                })}
              </svg>
              
              {/* Inner Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {activeSlice !== null ? (
                  <>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                      {chartData[activeSlice].name}
                    </p>
                    <p className="text-lg font-extrabold text-[var(--text-primary)] mt-1">
                      {formatUZS(chartData[activeSlice].amount)}
                    </p>
                    <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
                      {chartData[activeSlice].percentage.toFixed(1)}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Jami Chiqim</p>
                    <p className="text-2xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
                      {formatUZS(totalExpense)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">Diagrammada ko'rish uchun tanlang</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] space-y-2">
              <TrendingDown className="w-12 h-12 stroke-1" />
              <p className="text-sm">Ushbu davrda xarajatlar aniqlanmadi.</p>
            </div>
          )}
        </div>

        {/* Categories Details List */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Kategoriyalar bo'yicha ulush</h3>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
            {chartData.map((slice, index) => {
              const isHovered = activeSlice === index;
              return (
                <div 
                  key={slice.category}
                  className={`p-3 rounded-xl border border-transparent transition-all flex items-center justify-between cursor-pointer ${
                    isHovered ? 'bg-white/5 border-white/10' : 'hover:bg-white/[0.02]'
                  }`}
                  onMouseEnter={() => setActiveSlice(index)}
                  onMouseLeave={() => setActiveSlice(null)}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: slice.color }}
                    ></span>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{slice.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{slice.percentage.toFixed(1)}% ulush</p>
                    </div>
                  </div>

                  <p className="font-bold text-sm text-[var(--text-primary)]">{formatUZS(slice.amount)}</p>
                </div>
              );
            })}
            {chartData.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-12">Ma'lumotlar mavjud emas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
