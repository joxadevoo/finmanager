import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Wallet, 
  Award,
  Zap,
  TrendingDown,
  Info,
  Calendar,
  Hourglass,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function SmartHabits({ 
  transactions = [], 
  accounts = [], 
  budgets = [], 
  goals = [] 
}) {
  const [subTab, setSubTab] = useState('overview');
  
  // Salary and general state
  const [monthlySalary, setMonthlySalary] = useState(() => {
    const saved = localStorage.getItem('fm_smart_salary');
    return saved ? Number(saved) : 6000000; // Default 6,000,000 UZS
  });
  
  const [savePercentage, setSavePercentage] = useState(15); // Default 15% for Pay yourself first
  const [emergencyMonths, setEmergencyMonths] = useState(6); // Default 6 months
  const [simYears, setSimYears] = useState(5); // Default 5 years for savings simulator
  const [simRate, setSimRate] = useState(22); // Default 22% annual bank interest rate (common in Uzbekistan)

  // 24-Hour Rule items
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('fm_emotional_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Default initial mock items for 24h rule
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000); // 24.5 hours ago (expired)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const tenHoursAgo = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10 hours ago

    return [
      {
        id: 'wish-1',
        name: 'iPhone 17 Pro Max',
        price: 18000000,
        createdAt: oneDayAgo.toISOString(),
        durationHours: 24,
        notes: "Dostlarimda kordim, judayam olgim keldi",
        status: 'pending' // pending, purchased, saved
      },
      {
        id: 'wish-2',
        name: 'Brend krossovka (Nike Jordan)',
        price: 2400000,
        createdAt: tenHoursAgo.toISOString(),
        durationHours: 24,
        notes: "Instagramda reklama kordim",
        status: 'pending'
      },
      {
        id: 'wish-3',
        name: 'RGB O\'yin klaviaturasi',
        price: 950000,
        createdAt: twoHoursAgo.toISOString(),
        durationHours: 24,
        notes: "Kechasi oynash uchun chiroyli ko'rinadi",
        status: 'pending'
      }
    ];
  });

  // Emotional savings total saved counter
  const [totalSavedEmotional, setTotalSavedEmotional] = useState(() => {
    const saved = localStorage.getItem('fm_emotional_saved_total');
    return saved ? Number(saved) : 4800000; // Default starts with some saved amount for gamification
  });

  // Habit tracker
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('fm_smart_habits_checked');
    const today = new Date().toDateString();
    
    const defaultHabits = {
      date: today,
      payFirst: false,
      trackDaily: false,
      rule24h: false,
      budgetLimit: false
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return defaultHabits;
  });

  // Form state for adding emotional purchase item
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Time remaining update tick
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds to save performance
    return () => clearInterval(timer);
  }, []);

  // Save state helpers
  useEffect(() => {
    localStorage.setItem('fm_smart_salary', monthlySalary.toString());
  }, [monthlySalary]);

  useEffect(() => {
    localStorage.setItem('fm_emotional_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('fm_emotional_saved_total', totalSavedEmotional.toString());
  }, [totalSavedEmotional]);

  useEffect(() => {
    localStorage.setItem('fm_smart_habits_checked', JSON.stringify(habits));
  }, [habits]);

  // UZS currency formatting helper
  const formatUZS = (value) => {
    return new Intl.NumberFormat('uz-UZ', { 
      style: 'currency', 
      currency: 'UZS', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Convert numbers to readable form (e.g. 1.2 mln)
  const formatShortUZS = (val) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + ' mln UZS';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(0) + ' ming UZS';
    }
    return val + ' UZS';
  };

  // Calculate actual transaction stats for 50/30/20 comparison
  const calculateActualsFor503020 = () => {
    let totalIncome = 0;
    let needsSum = 0;
    let wantsSum = 0;
    let savingsSum = 0;

    // Categorization
    // Needs (Ehtiyojlar - 50%): food, transport, utilities, health
    // Wants (Xohishlar - 30%): shopping, entertainment, education, other_exp
    // Savings (Jamg'armalar - 20%): investments, savings, transfers or leftover
    
    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        totalIncome += amt;
      } else if (t.type === 'expense') {
        if (['food', 'transport', 'utilities', 'health'].includes(t.category)) {
          needsSum += amt;
        } else {
          wantsSum += amt;
        }
      } else if (t.type === 'transfer') {
        // transfers to savings or goal contributions
        savingsSum += amt;
      }
    });

    // Fallback if no income registered, use monthlySalary
    const effectiveIncome = totalIncome > 0 ? totalIncome : monthlySalary;
    
    // Leftover savings: effectiveIncome - needs - wants
    const actualLeftover = Math.max(0, effectiveIncome - needsSum - wantsSum);
    const totalSavings = Math.max(savingsSum, actualLeftover);

    const totalSum = needsSum + wantsSum + totalSavings;
    
    if (totalSum === 0) {
      return { needsPct: 0, wantsPct: 0, savingsPct: 0, needsSum: 0, wantsSum: 0, savingsSum: 0 };
    }

    return {
      needsPct: Math.round((needsSum / totalSum) * 100),
      wantsPct: Math.round((wantsSum / totalSum) * 100),
      savingsPct: Math.round((totalSavings / totalSum) * 100),
      needsSum,
      wantsSum,
      savingsSum: totalSavings
    };
  };

  const actuals = calculateActualsFor503020();

  // Hourly rate calculation based on 9-hour work days & 22 days per month
  const calculateHourlyRate = () => {
    const totalHours = 22 * 9; // 198 hours
    return Math.round(monthlySalary / totalHours);
  };

  const hourlyRate = calculateHourlyRate();

  // Emergency Fund calculations
  const calculateEmergencyDetails = () => {
    // Calculate average essential expenses from transactions (needs) or fallback to 50% of salary
    const actualNeeds = actuals.needsSum;
    const avgMonthlyNeeds = actualNeeds > 0 ? actualNeeds : (monthlySalary * 0.5);
    
    const targetFund = avgMonthlyNeeds * emergencyMonths;
    
    // Calculate current liquid balance (Cash + Cards)
    const liquidBalance = accounts
      .filter(acc => acc.type === 'Card' || acc.type === 'Cash')
      .reduce((sum, acc) => sum + acc.balance, 0);

    const progressPct = targetFund > 0 ? Math.min(100, Math.round((liquidBalance / targetFund) * 100)) : 0;

    return {
      avgMonthlyNeeds,
      targetFund,
      liquidBalance,
      progressPct
    };
  };

  const emergencyStats = calculateEmergencyDetails();

  // Add Item to 24h Wishlist
  const handleAddWishItem = (e) => {
    if (e) e.preventDefault();
    if (!itemName || !itemPrice || Number(itemPrice) <= 0) {
      alert("Iltimos, nom va to'g'ri narx kiriting");
      return;
    }

    const newItem = {
      id: 'wish-' + Date.now(),
      name: itemName,
      price: Number(itemPrice),
      createdAt: new Date().toISOString(),
      durationHours: 24,
      notes: itemNotes || "O'tkinchi hissiyotmi yoki haqiqiy ehtiyoj?",
      status: 'pending'
    };

    setWishlist(prev => [newItem, ...prev]);
    setItemName('');
    setItemPrice('');
    setItemNotes('');
    setIsAddWizardOpen(false);
    setWizardStep(1);

    // Check habit
    setHabits(prev => ({ ...prev, rule24h: true }));
  };

  // Resolve item (buy or save)
  const resolveWishItem = (id, resolution) => {
    setWishlist(prev => prev.map(item => {
      if (item.id === id) {
        if (resolution === 'saved') {
          setTotalSavedEmotional(prevTotal => prevTotal + item.price);
        }
        return { ...item, status: resolution };
      }
      return item;
    }));
  };

  // Delete item from list
  const deleteWishItem = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  // Habit completion score
  const getHabitsCompletedCount = () => {
    let count = 0;
    if (habits.payFirst) count++;
    if (habits.trackDaily) count++;
    if (habits.rule24h) count++;
    if (habits.budgetLimit) count++;
    return count;
  };

  const completedCount = getHabitsCompletedCount();
  const habitLevels = [
    { label: "Moliya Boshlovchisi", color: "text-slate-400" },
    { label: "Odatlar Havaskori 🎯", color: "text-blue-400" },
    { label: "Moliyaviy intizom yo'lida ⚡", color: "text-amber-400" },
    { label: "Odatlar Ustasi 🌟", color: "text-purple-400" },
    { label: "Moliyaviy Guruh 👑", color: "text-emerald-400" }
  ];
  const currentLevel = habitLevels[completedCount] || habitLevels[0];

  // Compound Interest Calculation for Simulator
  const calculateCompoundInterest = () => {
    const P = monthlySalary * (savePercentage / 100); // Monthly saved amount
    const t = simYears;
    const r = simRate / 100;
    const n = 12; // Compounded monthly

    if (r === 0) {
      const invested = P * n * t;
      return { invested, earned: 0, total: invested };
    }

    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    
    // Compound interest formula for monthly contributions (Future Value of Annuity)
    const total = P * (((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) * (1 + ratePerPeriod));
    const invested = P * totalPeriods;
    const earned = Math.max(0, total - invested);

    return {
      invested: Math.round(invested),
      earned: Math.round(earned),
      total: Math.round(total)
    };
  };

  const simResult = calculateCompoundInterest();

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header Profile section tailored for 22-year-old worker */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                Yosh: 22 &bull; Kuniga 9 soat Mehnat
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Aqlli Moliya Odatlari</h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl">
              Shaxsiy moliyani boshqarish — murakkab formulalar emas, balki **odat va tartibdir**. 
              Siz kabi yoshlik davridan boshlangan ushbu intizom kelajak uchun eng katta poydevoringiz bo'ladi.
            </p>
          </div>
          
          {/* Level Badge widget */}
          <div className="flex items-center gap-4 bg-white/5 p-4 py-3 rounded-2xl border border-white/5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Bugungi Odatlar balli</div>
              <div className="text-md font-extrabold text-[var(--text-primary)]">{completedCount} / 4 odat</div>
              <div className={`text-xs font-bold ${currentLevel.color} mt-0.5`}>{currentLevel.label}</div>
            </div>
          </div>
        </div>

        {/* Secondary Pill Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
          <button 
            onClick={() => setSubTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              subTab === 'overview' 
                ? 'bg-[var(--accent-primary)] text-black border-transparent shadow-lg' 
                : 'bg-white/5 text-[var(--text-secondary)] border-white/5 hover:bg-white/10'
            }`}
          >
            📋 Odatlar Kundaligi
          </button>
          
          <button 
            onClick={() => setSubTab('payfirst')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              subTab === 'payfirst' 
                ? 'bg-[var(--accent-primary)] text-black border-transparent shadow-lg' 
                : 'bg-white/5 text-[var(--text-secondary)] border-white/5 hover:bg-white/10'
            }`}
          >
            💰 "O'zingizga haq to'lang"
          </button>

          <button 
            onClick={() => setSubTab('rule503020')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              subTab === 'rule503020' 
                ? 'bg-[var(--accent-primary)] text-black border-transparent shadow-lg' 
                : 'bg-white/5 text-[var(--text-secondary)] border-white/5 hover:bg-white/10'
            }`}
          >
            📊 "50/30/20" Budjeti
          </button>

          <button 
            onClick={() => setSubTab('emergency')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              subTab === 'emergency' 
                ? 'bg-[var(--accent-primary)] text-black border-transparent shadow-lg' 
                : 'bg-white/5 text-[var(--text-secondary)] border-white/5 hover:bg-white/10'
            }`}
          >
            🛡️ Xavfsizlik Yostiqchasi
          </button>

          <button 
            onClick={() => setSubTab('spend24')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              subTab === 'spend24' 
                ? 'bg-[var(--accent-primary)] text-black border-transparent shadow-lg' 
                : 'bg-white/5 text-[var(--text-secondary)] border-white/5 hover:bg-white/10'
            }`}
          >
            ⏳ "24 Soat Qoidasi"
            {wishlist.filter(item => item.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[8px] bg-rose-500 text-white rounded-full font-bold">
                {wishlist.filter(item => item.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* RENDER SUB-TABS */}
      
      {/* 1. OVERVIEW / HABIT TRACKER */}
      {subTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habits Checkbox Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-5 lg:col-span-2">
            <div>
              <h2 className="text-xl font-bold">Kunlik Moliyaviy Odatlarimiz</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Har kuni moliyaviy muvaffaqiyatlar sari odatlarni belgilab boring. Ularni muntazam bajarish eng katta sarmoyadir.
              </p>
            </div>
            
            <div className="space-y-3.5 pt-2">
              {/* Pay yourself first habit */}
              <div 
                onClick={() => setHabits(prev => ({ ...prev, payFirst: !prev.payFirst }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  habits.payFirst 
                    ? 'bg-purple-500/10 border-purple-500/30' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    habits.payFirst ? 'bg-purple-500 border-transparent text-white' : 'border-white/20'
                  }`}>
                    {habits.payFirst && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold">O'zingizga haq to'lash</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Daromad olinganida 10-15% pulni darhol jamg'armaga o'tkazish.</p>
                  </div>
                </div>
                <div className="text-purple-400 text-xs font-bold">10% +</div>
              </div>

              {/* Track daily habit */}
              <div 
                onClick={() => setHabits(prev => ({ ...prev, trackDaily: !prev.trackDaily }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  habits.trackDaily 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    habits.trackDaily ? 'bg-emerald-500 border-transparent text-white' : 'border-white/20'
                  }`}>
                    {habits.trackDaily && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold">Kunlik Xarajatlar Nazorati</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Bugungi barcha xarajatlarni (hatto eng maydalarini ham) ilovaga yozib borish.</p>
                  </div>
                </div>
                <div className="text-emerald-400 text-xs font-bold">Nazorat</div>
              </div>

              {/* 24h rule habit */}
              <div 
                onClick={() => setHabits(prev => ({ ...prev, rule24h: !prev.rule24h }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  habits.rule24h 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    habits.rule24h ? 'bg-blue-500 border-transparent text-white' : 'border-white/20'
                  }`}>
                    {habits.rule24h && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold">Hissiy Xaridlarni 24 Soatga Ortga surish</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Qimmatli yoki hissiy xarid qilishdan avval bir kun kutish va o'ylash.</p>
                  </div>
                </div>
                <div className="text-blue-400 text-xs font-bold">24 Soat</div>
              </div>

              {/* Budget Limit habit */}
              <div 
                onClick={() => setHabits(prev => ({ ...prev, budgetLimit: !prev.budgetLimit }))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  habits.budgetLimit 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    habits.budgetLimit ? 'bg-amber-500 border-transparent text-white' : 'border-white/20'
                  }`}>
                    {habits.budgetLimit && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold">Budjet Chegaralaridan Chiqmaslik</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Bugungi barcha xarajatlar belgilangan kunlik budjet limitidan oshib ketmasligi.</p>
                  </div>
                </div>
                <div className="text-amber-400 text-xs font-bold">Limit</div>
              </div>
            </div>
            
            {/* Gamification Tip box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-left text-xs space-y-1">
                <span className="font-bold text-[var(--text-primary)]">Tavsiya:</span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Ushbu to'rtta odatni har kuni belgilab borish orqali siz miyangizda yangi moliyaviy dasturlarni yaratasiz. 
                  Birinchi 21 kun davomida ularni uzluksiz bajarish odatni butunlay hayotingizga singdirishga yordam beradi.
                </p>
              </div>
            </div>
          </div>

          {/* User profile & Stats Card */}
          <div className="space-y-6">
            {/* Salary Setup */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h2 className="text-md font-bold uppercase tracking-wider text-purple-400">Daromad va Mehnat Sozlamasi</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Oylik sof daromad (UZS):</span>
                </div>
                <input 
                  type="number" 
                  value={monthlySalary} 
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold outline-none text-purple-300 focus:border-purple-500/50"
                  placeholder="Kritilmagan"
                />
              </div>

              {/* Working info display */}
              <div className="p-3.5 rounded-xl bg-white/5 space-y-2 text-xs border border-white/5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Mehnat vaqti:</span>
                  <span className="font-bold text-[var(--text-primary)]">22 kun / kuniga 9 soat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Sizning ish soatingiz qiymati:</span>
                  <span className="font-bold text-emerald-400">{formatUZS(hourlyRate)} / soat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Kunlik mehnat daromadi:</span>
                  <span className="font-bold text-purple-300">{formatUZS(hourlyRate * 9)} / kun</span>
                </div>
              </div>
            </div>

            {/* Wisdom card */}
            <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-transparent border border-purple-500/10 relative">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                
                <h3 className="text-md font-bold text-[var(--text-primary)] text-left">24 soatlik xaridlar filtri va tejalgan pul</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-left">
                  Siz hissiy xaridlar ro'yxatidagi keraksiz narsalarni rad etish orqali jami:
                </p>
                <div className="text-2xl font-black text-emerald-400 tracking-tight text-left">
                  {formatUZS(totalSavedEmotional)}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] text-left">
                  pulni tejab qoldingiz va ularni kelajak investitsiyalariga yo'naltirish imkoniga egasiz!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PAY YOURSELF FIRST SIMULATOR */}
      {subTab === 'payfirst' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold">"O'zingizga birinchi bo'lib haq to'lang" qoidasi</h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Daromad qo'lga tushishi bilan barcha xarajatlardan avval uning kamida 10-15% qismini investitsiya yoki jamg'armaga o'tkazing. 
                Siz hozirda oyiga {formatUZS(monthlySalary)} daromad qilmoqdasiz.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              {/* Saving percentage slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Birinchi bo'lib tejash foizi:</span>
                  <span className="text-purple-400 font-extrabold">{savePercentage}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="40" 
                  step="5" 
                  value={savePercentage} 
                  onChange={(e) => setSavePercentage(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Kamida (5%)</span>
                  <span>Oltin standart (15%)</span>
                  <span>Maksimal (40%)</span>
                </div>
              </div>

              {/* Calculations Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Har oy tejab qo'yiladigan pul:</p>
                  <p className="text-lg font-extrabold text-emerald-400 mt-1">{formatUZS(monthlySalary * (savePercentage / 100))}</p>
                </div>
                
                <div className="p-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Qolgan xarajatlar uchun budjet:</p>
                  <p className="text-lg font-extrabold text-purple-300 mt-1">{formatUZS(monthlySalary * (1 - savePercentage / 100))}</p>
                </div>
              </div>

              {/* Dynamic Compound Simulator Options */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Jamg'arma va kelajakdagi o'sish simulyatori</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] font-bold">Simulyatsiya yillari ({simYears} yil):</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={simYears} 
                      onChange={(e) => setSimYears(Number(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] font-bold">Yillik Bank Foiz Stavkasi ({simRate}%):</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="30" 
                      value={simRate} 
                      onChange={(e) => setSimRate(Number(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compound Result & visual */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border border-purple-500/10 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Murakkab foiz natijasi
              </h3>
              
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Siz kiritgan jami sarmoya</p>
                <p className="text-md font-bold text-[var(--text-primary)]">{formatUZS(simResult.invested)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Qo'shilgan foiz foydasi</p>
                <p className="text-md font-bold text-emerald-400">+{formatUZS(simResult.earned)}</p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-1">
                <p className="text-xs text-[var(--text-muted)] uppercase font-bold">Yakuniy umumiy kapitalingiz</p>
                <p className="text-2xl font-black text-purple-300">{formatUZS(simResult.total)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Progress visual comparison */}
              <div className="space-y-1 text-xs">
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-purple-500" style={{ width: `${(simResult.invested / simResult.total) * 100}%` }}></div>
                  <div className="h-full bg-emerald-500" style={{ width: `${(simResult.earned / simResult.total) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
                  <span>Sarmoya ({Math.round((simResult.invested / simResult.total) * 100)}%)</span>
                  <span>Foyda ({Math.round((simResult.earned / simResult.total) * 100)}%)</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                ℹ️ <strong>Taqqoslash:</strong> Agar siz ushbu pulni tejamaganingizda, u keraksiz hissiyot xarajatlariga osongina aylanib ketishi mumkin edi. O'zingizga haq to'lash orqali siz kelajakda <strong>{formatShortUZS(simResult.total)}</strong> egasiga aylanasiz.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 50/30/20 RULE BUDGET SPLITTER */}
      {subTab === 'rule503020' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">50 / 30 / 20 Oltin Qoidasi</h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Ushbu qoida oylik budjetni uchta asosiy yo'nalishga oson taqsimlash usulidir.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Category Breakdown Cards */}
              <div className="space-y-4">
                {/* 50% Needs */}
                <div className="p-4.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                      50% - Hayotiy Ehtiyojlar (Needs)
                    </span>
                    <span className="font-extrabold text-sm">{formatUZS(monthlySalary * 0.5)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Yeyish-ichish, ijara, yo'l kira, kommunal xizmatlar va sog'liq kabi ushbu hayotiy muhim xarajatlarsiz yashab bo'lmaydi.
                  </p>
                </div>

                {/* 30% Wants */}
                <div className="p-4.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                      30% - Hordiq va Xohishlar (Wants)
                    </span>
                    <span className="font-extrabold text-sm">{formatUZS(monthlySalary * 0.3)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Kino, kafe, kiyim-kechak, ingliz tili darslari va shaxsiy rivojlanish kabi lahzadan lazzat bag'ishlaydigan ko'ngilochar xarajatlar.
                  </p>
                </div>

                {/* 20% Savings */}
                <div className="p-4.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      20% - Jamg'arma va Investitsiya (Savings)
                    </span>
                    <span className="font-extrabold text-sm">{formatUZS(monthlySalary * 0.2)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Xavfsizlik yostiqchasini yaratish, investitsiya qilish, qarzni uzish yoki orzuingizdagi yirik narsalarga pul yig'ish uchun.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actual vs Theoretical Comparison */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Sizning haqiqiy xarajatlaringiz
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Tizimdagi joriy tranzaksiyalaringiz asosida xarajatlaringizning 50/30/20 qoidasiga muvofiqligi:
            </p>

            <div className="space-y-5 pt-2">
              {/* Theoretical bar */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Oltin qoida taqsimoti</span>
                <div className="h-4.5 w-full bg-white/5 rounded-lg overflow-hidden flex text-[9px] font-bold text-black text-center">
                  <div className="h-full bg-rose-400/90 flex items-center justify-center" style={{ width: '50%' }}>50%</div>
                  <div className="h-full bg-amber-400/90 flex items-center justify-center" style={{ width: '30%' }}>30%</div>
                  <div className="h-full bg-emerald-400/90 flex items-center justify-center" style={{ width: '20%' }}>20%</div>
                </div>
              </div>

              {/* Actual bar */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Sizning amaldagi xarajatlaringiz</span>
                
                {transactions.length === 0 ? (
                  <div className="p-3 text-xs bg-white/5 rounded-xl border border-white/5 text-[var(--text-muted)] text-center">
                    Tranzaksiyalar mavjud emas. Taqsimotni ko'rish uchun "Tranzaksiyalar" sahifasida xarajatlarni kiriting.
                  </div>
                ) : (
                  <>
                    <div className="h-4.5 w-full bg-white/5 rounded-lg overflow-hidden flex text-[9px] font-bold text-black text-center">
                      {actuals.needsPct > 0 && (
                        <div className="h-full bg-rose-500/90 flex items-center justify-center" style={{ width: `${actuals.needsPct}%` }}>
                          {actuals.needsPct}%
                        </div>
                      )}
                      {actuals.wantsPct > 0 && (
                        <div className="h-full bg-amber-500/90 flex items-center justify-center" style={{ width: `${actuals.wantsPct}%` }}>
                          {actuals.wantsPct}%
                        </div>
                      )}
                      {actuals.savingsPct > 0 && (
                        <div className="h-full bg-emerald-500/90 flex items-center justify-center" style={{ width: `${actuals.savingsPct}%` }}>
                          {actuals.savingsPct}%
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 text-[9px] text-[var(--text-muted)] font-semibold mt-1">
                      <div className="text-left text-rose-400">Ehtiyojlar: {formatShortUZS(actuals.needsSum)}</div>
                      <div className="text-left sm:text-center text-amber-400">Xohishlar: {formatShortUZS(actuals.wantsSum)}</div>
                      <div className="text-left sm:text-right text-emerald-400">Jamg'arma: {formatShortUZS(actuals.savingsSum)}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Comparison advice */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {transactions.length > 0 && (
                  <>
                    💡 <strong>Moliya maslahatdoshi:</strong>{' '}
                    {actuals.needsPct > 55 ? (
                      "Sizning majburiy xarajatlaringiz (ehtiyojlar) 50% dan yuqori. Ularni optimallashtirishga yoki qo'shimcha daromad topishga harakat qiling."
                    ) : actuals.savingsPct < 15 ? (
                      "Sizning jamg'arma foizingiz juda kam. 'O'zingizga birinchi bo'lib haq to'lang' qoidasiga rioya qilib, tejash hajmini oshiring."
                    ) : (
                      "Ajoyib! Xarajatlaringiz oltin standart qoidasiga ancha yaqin va muvozanatda saqlanmoqda. Shunday davom eting!"
                    )}
                  </>
                )}
                {transactions.length === 0 && (
                  "Siz hozircha hech qanday tranzaksiya kiritmagansiz. Siz kiritgan xarajatlar ushbu qoidaga solishtiriladi va moliyaviy maslahatlar beriladi."
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EMERGENCY FUND (XAVFSIZLIK YOSTIQCHASI) */}
      {subTab === 'emergency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold">Xavfsizlik Yostiqchasi (Emergency Fund)</h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Kutilmagan vaziyatlar, sog'liq muammolari yoki ishsizlik davrida yordam beradigan eng muhim moliyaviy himoya.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              {/* Target duration in months */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Zaxira oylar soni (3 oydan 6 oygacha):</span>
                  <span className="text-purple-400 font-extrabold">{emergencyMonths} oy</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="12" 
                  step="1" 
                  value={emergencyMonths} 
                  onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                  className="w-full cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Asosiy (3 oy)</span>
                  <span>Oltin standart (6 oy)</span>
                  <span>Maksimal (12 oy)</span>
                </div>
              </div>

              {/* Calculations boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Oylik zaruriy ehtiyojingiz:</p>
                  <p className="text-lg font-extrabold text-[var(--text-primary)] mt-1">{formatUZS(emergencyStats.avgMonthlyNeeds)}</p>
                </div>
                
                <div className="p-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Kerakli jami zaxira summasi:</p>
                  <p className="text-lg font-extrabold text-indigo-400 mt-1">{formatUZS(emergencyStats.targetFund)}</p>
                </div>
              </div>

              {/* Dynamic progress from current account values */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-secondary)]">Mavjud hisobingizdagi jami likvid pullar (Naqd + Karta):</span>
                  <span className="text-emerald-400 font-bold">{formatUZS(emergencyStats.liquidBalance)}</span>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${emergencyStats.progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>Zaxira bajarilishi: {emergencyStats.progressPct}%</span>
                    <span>Qoldiq: {formatUZS(Math.max(0, emergencyStats.targetFund - emergencyStats.liquidBalance))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Fund advice */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Ruhiy xotirjamlik zaxirasi
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Bu pul investitsiyaga tikilmaydi yoki orzularga sarflanmaydi. U faqat bankda omonatda yoki tez yechiladigan oson hisobda turishi lozim.
              </p>
            </div>

            <div className="mt-6 space-y-4 pt-4 border-t border-white/5">
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[var(--text-primary)]">Emergency Fund nima beradi?</span>
                <ul className="list-disc pl-4 text-[11px] text-[var(--text-secondary)] space-y-1.5 mt-1">
                  <li>Ishingizni o'zgartirganda moliyaviy siqilmaslik;</li>
                  <li>Kutilmagan shifoxona xarajatlarini qoplash;</li>
                  <li>Qarzlar va kredit botqog'iga tushib qolmaslik;</li>
                  <li>Jamiyatda erkin va mustaqil qaror qabul qilish.</li>
                </ul>
              </div>

              {emergencyStats.progressPct >= 100 ? (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 text-center">
                  🎉 Tabriklaymiz! Zaxira to'liq yaratilgan. Siz moliyaviy jihatdan himoyalangansiz.
                </div>
              ) : (
                <div className="p-3 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-xl border border-indigo-500/20 text-center">
                  ⏳ Jamg'arma maqsadini qo'shib, kartangizdagi pullarni asta-sekin to'ldirib boring.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. 24-HOUR RULE & EMOTIONAL SPENDING */}
      {subTab === 'spend24' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 lg:col-span-2">
            
            {/* Header and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">24 Soat Filtri & Hissiyot xarajatlari</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Xarid qilishdan avval bu ro'yxatga kiriting. 24 soat kuting va so'ngra qaror qabul qiling.
                </p>
              </div>
              
              <button 
                onClick={() => {
                  setIsAddWizardOpen(true);
                  setWizardStep(1);
                }}
                className="flex items-center justify-center gap-2 bg-purple-500 text-white rounded-full px-4 py-2 text-xs font-bold hover:bg-purple-600 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Yangi xaridni tekshirish
              </button>
            </div>

            {/* List of Wishlist items */}
            <div className="space-y-4">
              {wishlist.filter(item => item.status === 'pending').length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/5 space-y-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-400 border border-purple-500/20">
                    <Hourglass className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Faol kutish ro'yxati bo'sh</p>
                  <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                    Kattaroq hissiyot xarajatlarini sotib olmaslik va pul tejash uchun filterdan foydalaning.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {wishlist.filter(item => item.status === 'pending').map(item => {
                    const createdDate = new Date(item.createdAt);
                    const expiryDate = new Date(createdDate.getTime() + item.durationHours * 60 * 60 * 1000);
                    const timeLeftMs = expiryDate.getTime() - currentTime.getTime();
                    const isExpired = timeLeftMs <= 0;
                    
                    // Time text
                    let timeText = "Muddati tugadi";
                    let pctLeft = 100;
                    
                    if (!isExpired) {
                      const totalMs = item.durationHours * 60 * 60 * 1000;
                      pctLeft = Math.max(0, Math.round((timeLeftMs / totalMs) * 100));
                      const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
                      const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
                      timeText = `${hours}s ${minutes}m qoldi`;
                    }

                    // Hourly wage work equivalent
                    const hoursNeeded = Math.round(item.price / hourlyRate);
                    const daysNeeded = (hoursNeeded / 9).toFixed(1);

                    return (
                      <div 
                        key={item.id}
                        className={`p-5 rounded-2xl border transition-all space-y-4 ${
                          isExpired 
                            ? 'bg-amber-500/5 border-amber-500/30' 
                            : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)]">{item.name}</h3>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                              Qo'shilgan vaqti: {createdDate.toLocaleDateString('uz-UZ')} &bull; {createdDate.toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-[var(--text-secondary)] italic mt-2">
                                &ldquo;{item.notes}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-sm block text-purple-300">{formatUZS(item.price)}</span>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              isExpired ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                            }`}>
                              {isExpired ? 'Qarorga tayyor' : 'Kutilmoqda'}
                            </span>
                          </div>
                        </div>

                        {/* Hourly work metrics widget */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>Mehnat qiymati:</span>
                            <span className="font-extrabold text-[var(--text-primary)]">{hoursNeeded} soat</span>
                            <span className="text-[var(--text-muted)]">({daysNeeded} kunlik mehnat)</span>
                          </div>
                          
                          <div className="text-purple-400 font-bold text-[10px] flex items-center gap-1">
                            <span>Siz kuniga 9 soat ishlaysiz!</span>
                          </div>
                        </div>

                        {/* Timer Slider bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                            <span>24 Soatlik filter:</span>
                            <span className={isExpired ? "text-emerald-400" : "text-amber-400"}>{timeText}</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                isExpired ? 'bg-emerald-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${isExpired ? 100 : (100 - pctLeft)}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons to resolve */}
                        <div className="flex gap-2 justify-end pt-1">
                          <button 
                            onClick={() => deleteWishItem(item.id)}
                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          {/* Fast forward simulator button for testing */}
                          {!isExpired && (
                            <button 
                              onClick={() => {
                                // Simulate 24.5 hours ago
                                const past = new Date(new Date().getTime() - 25 * 60 * 60 * 1000);
                                setWishlist(prev => prev.map(w => w.id === item.id ? { ...w, createdAt: past.toISOString() } : w));
                              }}
                              className="px-2.5 py-1 text-[9px] font-bold bg-white/5 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] border border-white/5 cursor-pointer"
                            >
                              ⏩ Vaqtni o'tkazish (Simulyatsiya)
                            </button>
                          )}

                          <button 
                            onClick={() => resolveWishItem(item.id, 'saved')}
                            className="px-4 py-1.5 text-xs font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded-xl border border-emerald-500/20 transition-all cursor-pointer"
                          >
                            🎉 Sotib olmaslik (Pulni tejash)
                          </button>

                          <button 
                            onClick={() => resolveWishItem(item.id, 'purchased')}
                            className="px-4 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] rounded-xl border border-white/5 transition-all cursor-pointer"
                          >
                            Hali ham sotib olmoqchiman
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resolved items history (small section) */}
            {wishlist.filter(item => item.status !== 'pending').length > 0 && (
              <div className="border-t border-white/5 pt-5 space-y-3">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Filtrdan o'tgan xaridlar tarixi</h3>
                
                <div className="space-y-2">
                  {wishlist.filter(item => item.status !== 'pending').slice(0, 4).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-left">
                        <span className="font-bold block">{item.name}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">Hissiy narxi: {formatUZS(item.price)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.status === 'saved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.status === 'saved' ? 'Qaror: Rad etildi (Tejandi)' : 'Sotib olindi'}
                        </span>
                        
                        <button 
                          onClick={() => deleteWishItem(item.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Psychology rules / advice */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                "24 Soat Qoidasi" psixologiyasi
              </h3>
              
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Narsalarni hissiyotga berilib, birdaniga sotib olish ko'plab odamlarni moliyaviy muammolarga olib boradi. 
                Sotib olishni bir kun orqaga surganingizda:
              </p>

              <div className="space-y-2">
                <div className="flex gap-2.5 items-start text-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[var(--text-secondary)]"><strong>Dofamin effekti kamayadi:</strong> sizdagi kuchli lahzali xohish so'nadi va vaziyatga aql bilan qaraysiz.</span>
                </div>
                <div className="flex gap-2.5 items-start text-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[var(--text-secondary)]"><strong>Alternativlar ochiladi:</strong> Siz ushbu pulga boshqa qanday muhimroq maqsadlaringiz borligini ko'rasiz.</span>
                </div>
                <div className="flex gap-2.5 items-start text-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[var(--text-secondary)]"><strong>Mehnat solishtiruvi:</strong> Siz uni o'zingizning necha soatlik og'ir mehnatingiz evaziga kelishini hisoblaysiz.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Tejalgan umumiy balans:</div>
              <div className="text-3xl font-black text-emerald-400 tracking-tight">{formatUZS(totalSavedEmotional)}</div>
              <p className="text-[10px] text-[var(--text-muted)]">
                hissiy xaridlardan voz kechib tejalgan pul. Uni tezkor maqsadlaringizga yoki xavfsizlik yostiqchasiga o'tkazib qo'ying!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 24-HOUR RULE ADD WIZARD MODAL */}
      {isAddWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 space-y-6 animate-scale-up text-left">
            
            {/* Header step progress */}
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div>
                <h3 className="font-extrabold text-md">Hissiyotlarni filterlash</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Qadam {wizardStep} / 4</p>
              </div>
              <button 
                onClick={() => setIsAddWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Steps Rendering */}
            
            {/* STEP 1: Basic Input */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)]">
                  Nima sotib olmoqchisiz va u qancha turadi? O'z his-tuyg'ularingizni yozib boring.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Xarid nomi:</label>
                  <input 
                    type="text" 
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold outline-none text-[var(--text-primary)] focus:border-purple-500"
                    placeholder="Masalan: Brend krossovka, Yangi quloqchin"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Taxminiy narxi (UZS):</label>
                  <input 
                    type="number" 
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold outline-none text-purple-300 focus:border-purple-500"
                    placeholder="Masalan: 1200000"
                    required
                  />
                </div>

                {itemPrice && Number(itemPrice) > 0 && (
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/15 text-[11px] font-semibold">
                    ⏳ Ushbu narsa sizning <strong>{Math.round(Number(itemPrice) / hourlyRate)} soatlik</strong> ish haqingiz qiymatiga teng!
                  </div>
                )}

                <button 
                  onClick={() => {
                    if (!itemName || !itemPrice || Number(itemPrice) <= 0) {
                      alert("Iltimos, maydonlarni to'g'ri to'ldiring");
                      return;
                    }
                    setWizardStep(2);
                  }}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Keling, tahlil qilamiz &rarr;
                </button>
              </div>
            )}

            {/* STEP 2: Needs vs Wants check */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm">Savol 1: Bu narsa hayot uchun mutlaqo zarurmi?</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Agar ushbu narsani sotib olmasangiz, hayotingiz, sog'ligingiz yoki ishingizga jiddiy zarar yetadimi? 
                  Yoki bu shunchaki qulaylik va ko'ngilochar xohishmi?
                </p>

                <textarea 
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none text-[var(--text-primary)] h-20 focus:border-purple-500"
                  placeholder="Masalan: Uzi ishlatib yurgan telefonim buzildi va ish uchun yangisi kerak / Shunchaki dizayni chiroyli ekan..."
                />

                <div className="flex gap-3">
                  <button 
                    onClick={() => setWizardStep(1)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    Orqaga
                  </button>
                  <button 
                    onClick={() => setWizardStep(3)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Keyingi &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Work comparison check */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm">Savol 2: Qancha mehnat evaziga kelishini bilasizmi?</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Ushbu narsa uchun siz <strong>{Math.round(Number(itemPrice) / hourlyRate)} soat</strong> (taxminan <strong>{(Number(itemPrice) / (hourlyRate * 9)).toFixed(1)}</strong> to'liq ish kuni) ishlashingiz kerak. 
                  Siz o'zingizning ushbu issiq havoda, 9 soat davomida qilgan mashaqqatli mehnatingizni shu narsaga almashtirishga rozimisiz?
                </p>

                <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                  ⚠️ <strong>Unutmang:</strong> Biror narsani sotib olayotganda, siz unga pul emas, balki uni topish uchun sarflagan hayotingizning o'sha qismini to'laysiz.
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setWizardStep(2)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    Orqaga
                  </button>
                  <button 
                    onClick={() => setWizardStep(4)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Roziman &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Invest alternate check & add */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm">Savol 3: Ushbu pul investitsiya qilinsa nima bo'ladi?</h4>
                
                {/* 5-year compounding value */}
                {(() => {
                  const val = Number(itemPrice);
                  const compound5Y = Math.round(val * Math.pow(1.22, 5));
                  return (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Agar siz ushbu {formatUZS(val)} pulni xarid qilmay, 22% yillik omonatga qo'ysangiz, u 5 yildan keyin hech qanday mehnatsiz <strong>{formatUZS(compound5Y)}</strong> sof kapitalga aylanadi. 
                      Bu xarid siz uchun shu imkoniyatdan ustunmi?
                    </p>
                  );
                })()}

                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15 text-xs font-semibold text-center">
                  ⏳ Keling, hissiyotlarni sovitish uchun 24 soatga ro'yxatga kiritamiz.
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setWizardStep(3)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    Orqaga
                  </button>
                  <button 
                    onClick={handleAddWishItem}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Filtrga kiritish 🎉
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
