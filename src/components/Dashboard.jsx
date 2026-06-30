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
  setActiveTab,
  onOpenAddTransaction
}) {
  const [chartTab, setChartTab] = useState('combined');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}`;
  });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // Calculate totals (balance is simply Kirim - Chiqim)
  const totalAssets = totalIncome - totalExpense;

  const monthlyTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const monthlyExpense = monthlyTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // Group chart data based on timeFrame (daily: today, weekly: current week days, monthly: current month days)
  const getChartData = () => {
    const data = [];
    const today = new Date();
    const selYear = today.getFullYear();
    const selMonth = today.getMonth(); // 0-indexed
    const todayStr = today.toISOString().split('T')[0];

    if (timeFrame === 'daily') {
      // Show today's individual transactions as points
      const todayTx = transactions.filter(tx => tx.date === todayStr);

      if (todayTx.length === 0) {
        data.push({ label: 'Bugun', fullLabel: 'Bugun amallar yo\'q', income: 0, expense: 0 });
        data.push({ label: ' ', fullLabel: 'Bugun amallar yo\'q', income: 0, expense: 0 });
      } else {
        todayTx.forEach((tx, idx) => {
          const categoryName = categoryNameMap[tx.category] || (tx.type === 'income' ? 'Kirim' : 'Chiqim');
          data.push({
            label: tx.notes ? (tx.notes.length > 8 ? tx.notes.slice(0, 8) + '...' : tx.notes) : categoryName,
            fullLabel: `${categoryName}${tx.notes ? `: ${tx.notes}` : ''}`,
            income: tx.type === 'income' ? Number(tx.amount) : 0,
            expense: tx.type === 'expense' ? Number(tx.amount) : 0
          });
        });
        if (data.length === 1) {
          data.push({ ...data[0], label: data[0].label + ' ' });
        }
      }
    } else if (timeFrame === 'weekly') {
      // Days of the current week (Monday to Sunday)
      const weekDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
      
      const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() + diff);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const dayTx = transactions.filter(tx => tx.date === dateStr);

        const inc = dayTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
        const exp = dayTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);

        data.push({
          label: weekDays[i],
          fullLabel: `${weekDays[i]} (${dd}.${mm})`,
          income: inc,
          expense: exp
        });
      }
    } else if (timeFrame === 'monthly') {
      // Days of the current month
      const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayTx = transactions.filter(tx => {
          if (!tx.date) return false;
          const parts = tx.date.split('-');
          const txY = parseInt(parts[0], 10);
          const txM = parseInt(parts[1], 10) - 1;
          const txD = parseInt(parts[2], 10);
          return txY === selYear && txM === selMonth && txD === day;
        });

        const inc = dayTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
        const exp = dayTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);

        data.push({
          label: day % 5 === 0 || day === 1 || day === daysInMonth ? `${day}` : '',
          fullLabel: `${day}-kun`,
          income: inc,
          expense: exp
        });
      }
    }
    return data;
  };

  // Group expenses by category for Donut chart
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
  const totalExpenseSum = expenseTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const categoryExpenses = [];
  const grouped = {};
  expenseTransactions.forEach(tx => {
    grouped[tx.category] = (grouped[tx.category] || 0) + Number(tx.amount);
  });

  const categoryColors = {
    food: '#fb7185',        // rose-400
    transport: '#60a5fa',   // blue-400
    utilities: '#fbbf24',   // amber-400
    entertainment: '#c084fc', // purple-400
    shopping: '#f472b6',    // pink-400
    health: '#34d399',      // emerald-400
    education: '#818cf8',   // indigo-400
    other_exp: '#94a3b8'    // slate-400
  };

  Object.keys(grouped).forEach(cat => {
    categoryExpenses.push({
      category: cat,
      name: categoryNameMap[cat] || cat,
      amount: grouped[cat],
      percentage: totalExpenseSum > 0 ? (grouped[cat] / totalExpenseSum) * 100 : 0,
      color: categoryColors[cat] || '#94a3b8'
    });
  });

  // Sort descending
  categoryExpenses.sort((a, b) => b.amount - a.amount);

  // SVG Donut calculation
  let accumulatedPercent = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32
  
  const donutSegments = categoryExpenses.map(item => {
    const strokeLength = (item.percentage / 100) * circumference;
    const strokeOffset = - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += item.percentage;
    
    return {
      ...item,
      strokeDasharray: `${strokeLength} ${circumference}`,
      strokeDashoffset: strokeOffset
    };
  });

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
    <div className="space-y-8 animate-fade-in pb-44 md:pb-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight tabular-nums">
            {currentTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </h1>
          <p className="text-sm font-semibold text-[var(--text-secondary)] mt-1">
            {currentTime.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onOpenAddTransaction('expense')} 
            className="btn-danger flex items-center gap-2 rounded-full"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Xarajat qo'shish</span>
          </button>
          <button 
            onClick={() => onOpenAddTransaction('income')} 
            className="btn-success rounded-full"
          >
            <Plus className="w-4 h-4" />
            <span>Daromad qo'shish</span>
          </button>
        </div>
      </div>



      {/* Main KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Balance */}
        <div className="glass-panel p-5 relative overflow-hidden group flex flex-col justify-center min-h-[140px]">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-violet-400 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-20 h-20" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Balans</p>
            <h2 className="text-2xl md:text-3xl font-black mt-2 text-violet-400 tracking-tight">{formatUZS(totalAssets)}</h2>
          </div>
        </div>

        {/* Card 2: Total Income and Expense in a single container */}
        <div className="glass-panel p-5 grid grid-cols-2 gap-4 relative overflow-hidden min-h-[140px]">
          
          {/* Total Income section */}
          <div className="flex flex-col justify-center border-r border-white/5 pr-4">
            <div>
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Jami Kirim</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mt-2 text-emerald-400 tracking-tight">+{formatUZS(totalIncome)}</h3>
            </div>
          </div>

          {/* Total Expense section */}
          <div className="flex flex-col justify-center pl-4">
            <div>
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Jami Chiqim</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mt-2 text-rose-400 tracking-tight">-{formatUZS(totalExpense)}</h3>
            </div>
          </div>

        </div>

      </div>
      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Kirim-Chiqim Line Chart (3/5 width) */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-4 md:p-6 space-y-6 flex flex-col justify-between h-full min-h-[380px]">
            
            {/* Chart Control Header */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base md:text-lg font-bold">Kirim va Chiqim Tahlili</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* TimeFrame Switcher */}
                <div className="flex bg-white/5 p-1.5 rounded-full w-full gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeFrame('daily')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      timeFrame === 'daily' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Kunlik
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFrame('weekly')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      timeFrame === 'weekly' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Haftalik
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFrame('monthly')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      timeFrame === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Oylik
                  </button>
                </div>

                {/* Tabs Switcher */}
                <div className="flex bg-white/5 p-1.5 rounded-full w-full gap-2">
                  <button
                    type="button"
                    onClick={() => setChartTab('combined')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      chartTab === 'combined' ? 'bg-purple-600 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Umumiy
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTab('income')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      chartTab === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Kirim
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTab('expense')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      chartTab === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    Chiqim
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative pt-4 w-full overflow-hidden flex-1 flex items-center">
              {/* SVG Area */}
              <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
                <style>{`
                  .chart-line {
                    transition: points 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
                  }
                  .chart-area {
                    transition: d 0.6s cubic-bezier(0.4, 0, 0.2, 1), fill 0.3s ease;
                  }
                  .chart-dot {
                    transition: r 0.25s cubic-bezier(0.4, 0, 0.2, 1), cx 0.6s cubic-bezier(0.4, 0, 0.2, 1), cy 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                  }
                `}</style>

                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="30" y1="95" x2="470" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="30" y1="160" x2="470" y2="160" stroke="rgba(255,255,255,0.1)" />

                {(() => {
                  const chartData = getChartData();
                  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 10000);
                  const N = chartData.length;
                  
                  const getX = (index) => 40 + (N > 1 ? index * (420 / (N - 1)) : 0);
                  const getY = (val) => 160 - (val / maxVal) * 120;

                  const incomePoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.income) }));
                  const expensePoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.expense) }));

                  const getCurvePath = (pts) => {
                    if (pts.length === 0) return '';
                    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
                    
                    let dStr = `M ${pts[0].x} ${pts[0].y}`;
                    const tension = 0.15;
                    
                    for (let i = 0; i < pts.length - 1; i++) {
                      const p0 = pts[i];
                      const p1 = pts[i + 1];
                      
                      const prev = pts[i - 1] || p0;
                      const next = pts[i + 2] || p1;
                      
                      const cp1x = p0.x + (p1.x - prev.x) * tension;
                      const cp1y = p0.y + (p1.y - prev.y) * tension;
                      
                      const cp2x = p1.x - (next.x - p0.x) * tension;
                      const cp2y = p1.y - (next.y - p0.y) * tension;
                      
                      dStr += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
                    }
                    return dStr;
                  };

                  const incomeLinePath = getCurvePath(incomePoints);
                  const expenseLinePath = getCurvePath(expensePoints);

                  const incomeAreaPath = incomePoints.length > 0 
                    ? `${incomeLinePath} L ${incomePoints[incomePoints.length - 1].x} 160 L ${incomePoints[0].x} 160 Z`
                    : '';

                  const expenseAreaPath = expensePoints.length > 0 
                    ? `${expenseLinePath} L ${expensePoints[expensePoints.length - 1].x} 160 L ${expensePoints[0].x} 160 Z`
                    : '';

                  return (
                    <>
                      {/* Area under Income Line */}
                      {(chartTab === 'combined' || chartTab === 'income') && chartData.length > 0 && (
                        <path d={incomeAreaPath} fill="url(#incomeGrad)" className="chart-area" />
                      )}

                      {/* Area under Expense Line */}
                      {(chartTab === 'combined' || chartTab === 'expense') && chartData.length > 0 && (
                        <path d={expenseAreaPath} fill="url(#expenseGrad)" className="chart-area" />
                      )}

                      {/* Income Line */}
                      {(chartTab === 'combined' || chartTab === 'income') && (
                        <path
                          d={incomeLinePath}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="chart-line"
                        />
                      )}

                      {/* Expense Line */}
                      {(chartTab === 'combined' || chartTab === 'expense') && (
                        <path
                          d={expenseLinePath}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="chart-line"
                        />
                      )}

                      {/* Dots and Labels */}
                      {chartData.map((d, i) => {
                        const cx = getX(i);
                        const cyIncome = getY(d.income);
                        const cyExpense = getY(d.expense);
                        const isHovered = hoveredIndex === i;

                        return (
                          <g key={i} className="pointer-events-none">
                            {/* X-Axis labels */}
                            <text
                              x={cx}
                              y="185"
                              textAnchor="middle"
                              fill="var(--text-muted)"
                              className="text-[9px] font-bold tracking-tight"
                            >
                              {d.label}
                            </text>

                            {/* Income Dot */}
                            {(chartTab === 'combined' || chartTab === 'income') && (
                              <circle
                                cx={cx}
                                cy={cyIncome}
                                r={isHovered ? 6 : (timeFrame === 'daily' ? 0 : 3.5)}
                                className="fill-emerald-400 stroke-slate-900 stroke-2 chart-dot"
                              />
                            )}

                            {/* Expense Dot */}
                            {(chartTab === 'combined' || chartTab === 'expense') && (
                              <circle
                                cx={cx}
                                cy={cyExpense}
                                r={isHovered ? 6 : (timeFrame === 'daily' ? 0 : 3.5)}
                                className="fill-rose-400 stroke-slate-900 stroke-2 chart-dot"
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* Interactive hover zones */}
                      {chartData.map((d, i) => {
                        const cx = getX(i);
                        const zoneWidth = N > 1 ? (420 / (N - 1)) : 420;
                        
                        return (
                          <rect
                            key={`zone-${i}`}
                            x={cx - zoneWidth / 2}
                            y="10"
                            width={zoneWidth}
                            height="160"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => {
                              setHoveredIndex(i);
                              setActiveTooltip({
                                x: cx,
                                y: chartTab === 'combined'
                                  ? Math.min(getY(d.income), getY(d.expense))
                                  : (chartTab === 'income' ? getY(d.income) : getY(d.expense)),
                                label: d.fullLabel || d.label,
                                income: d.income,
                                expense: d.expense
                              });
                            }}
                            onMouseLeave={() => {
                              setHoveredIndex(null);
                              setActiveTooltip(null);
                            }}
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>

              {/* Rich HTML Tooltip Overlay */}
              {activeTooltip && (
                <div 
                  className="absolute pointer-events-none bg-slate-950/95 border border-white/10 text-white p-2.5 rounded-xl shadow-2xl text-[10px] z-30 flex flex-col gap-1 -translate-x-1/2 -translate-y-full transition-all duration-150"
                  style={{ 
                    left: `${(activeTooltip.x / 500) * 100}%`, 
                    top: `${(activeTooltip.y / 200) * 100 - 4}%` 
                  }}
                >
                  <span className="font-extrabold text-[var(--text-muted)] tracking-wider uppercase text-[8px]">{activeTooltip.label}</span>
                  {chartTab !== 'expense' && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 font-bold">Kirim: {formatUZS(activeTooltip.income)}</span>
                    </div>
                  )}
                  {chartTab !== 'income' && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="text-rose-400 font-bold">Chiqim: {formatUZS(activeTooltip.expense)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Chart Legend */}
            <div className="flex justify-center gap-6 text-[10px] md:text-xs font-semibold pt-2">
              {(chartTab === 'combined' || chartTab === 'income') && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-emerald-500" />
                  <span className="text-[var(--text-secondary)]">Daromad</span>
                </div>
              )}
              {(chartTab === 'combined' || chartTab === 'expense') && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-rose-500" />
                  <span className="text-[var(--text-secondary)]">Xarajat</span>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Right Column: Xarajatlar Tarkibi Donut Chart (2/5 width) */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-4 md:p-6 space-y-6 flex flex-col justify-between h-full min-h-[380px]">
            <h3 className="text-base md:text-lg font-bold">Xarajatlar Tarkibi</h3>
            
            {totalExpenseSum > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                        title={`${seg.name}: ${seg.percentage.toFixed(0)}%`}
                      />
                    ))}
                  </svg>
                  
                  {/* Total Text */}
                  <div className="absolute text-center flex flex-col justify-center items-center">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Jami</span>
                    <span className="text-xs font-extrabold text-[var(--text-primary)] mt-0.5 whitespace-nowrap">
                      {formatUZS(totalExpenseSum)}
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-2.5 w-full">
                  {categoryExpenses.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-[var(--text-secondary)] truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <span className="font-bold text-[var(--text-primary)]">{item.percentage.toFixed(0)}%</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{formatUZS(item.amount)}</span>
                      </div>
                    </div>
                  ))}
                  {categoryExpenses.length > 5 && (
                    <p className="text-[10px] text-[var(--text-muted)] text-right italic font-medium">
                      + yana {categoryExpenses.length - 5} ta
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-muted)]">
                  <TrendingUp className="w-8 h-8 opacity-30" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">Xarajatlar yo'q</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Ushbu oydagi xarajatlar tahlili uchun avval biror xarajat tranzaksiyasini kiriting.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
