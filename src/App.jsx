import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Wallet, 
  BarChart2, 
  Target, 
  Moon, 
  Sun,
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Settings,
  Bell,
  LogOut,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

// Firebase Services
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, collection, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// MM Currency Icon component for the logo
const MMCurrencyIcon = ({ className = "w-6 h-6", style = {} }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M4 18V6l8 8 8-8v12" stroke="currentColor" />
    <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" />
    <line x1="2" y1="13" x2="22" y2="13" stroke="currentColor" />
  </svg>
);

const getCatColor = (catColor) => {
  if (!catColor) return 'bg-purple-500';
  if (catColor.includes('bg-')) {
    const match = catColor.match(/bg-([a-z]+)-/);
    const color = match ? match[1] : 'purple';
    return `bg-${color}-500`;
  }
  return `bg-${catColor}-500`;
};


// Interactive Savings Simulator for the landing page hero section
const SavingsSimulator = ({ theme }) => {
  const [monthly, setMonthly] = useState(1000000); // 1,000,000 UZS
  const [years, setYears] = useState(3); // 3 years
  const [rate, setRate] = useState(20); // 20% interest rate

  // Calculate compound interest
  const calculateSavings = () => {
    const P = monthly;
    const t = years;
    const r = rate / 100;
    const n = 12; // monthly compounding

    if (r === 0) {
      const totalInvested = P * n * t;
      return {
        invested: totalInvested,
        earned: 0,
        total: totalInvested
      };
    }

    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    
    // Future value of an annuity formula: FV = P * [((1 + r)^t - 1) / r] * (1 + r)
    const fv = P * (((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) * (1 + ratePerPeriod));
    const totalInvested = P * totalPeriods;
    const earned = Math.max(0, fv - totalInvested);

    return {
      invested: Math.round(totalInvested),
      earned: Math.round(earned),
      total: Math.round(fv)
    };
  };

  const { invested, earned, total } = calculateSavings();

  const formatUZS = (value) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(value) + ' UZS';
  };

  // Percent of growth for progress bar
  const earnedPercent = total > 0 ? (earned / total) * 100 : 0;

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse-live" style={{ display: 'inline-block', flexShrink: 0 }} />
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 text-left" style={{ margin: 0 }}>
          🎯 AQLLI TEJASH SIMULYATORI
        </h3>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] text-left leading-relaxed">
        Oylik jamg'arma va bank foiz stavkasi yordamida kelajakdagi boyligingizni hisoblang. Murakkab foiz (compound interest) kuchi siz uchun qanday ishlashini ko'ring!
      </p>

      {/* Sliders Container */}
      <div className="space-y-4">
        {/* Slider 1: Monthly contribution */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--text-secondary)]">Oylik Jamg'arma:</span>
            <span className="text-purple-400 font-bold">{formatUZS(monthly)}</span>
          </div>
          <input 
            type="range" 
            min="100000" 
            max="10000000" 
            step="100000" 
            value={monthly} 
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent-primary)' }}
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
            <span>100K UZS</span>
            <span>10M UZS</span>
          </div>
        </div>

        {/* Slider 2: Years */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--text-secondary)]">Muddat (Yil):</span>
            <span className="text-purple-400 font-bold">{years} yil</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1" 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent-primary)' }}
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
            <span>1 yil</span>
            <span>10 yil</span>
          </div>
        </div>

        {/* Slider 3: Interest rate */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--text-secondary)]">Yillik Foiz (Stavka):</span>
            <span className="text-purple-400 font-bold">{rate}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30" 
            step="1" 
            value={rate} 
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent-primary)' }}
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
            <span>0% (Naqd pul)</span>
            <span>30% yillik</span>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-left">
            <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Jami kiritilgan pul</p>
            <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{formatUZS(invested)}</p>
          </div>
          <div className="text-left">
            <p className="text-[9px] text-[var(--text-muted)] uppercase font-semibold">Foizli sof daromad</p>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">+{formatUZS(earned)}</p>
          </div>
        </div>

        {/* Progress bar comparison */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
            <div className="h-full bg-purple-500" style={{ width: `${100 - earnedPercent}%`, background: 'var(--accent-primary)' }}></div>
            <div className="h-full bg-emerald-500" style={{ width: `${earnedPercent}%` }}></div>
          </div>
          <div className="flex justify-between text-[8px] text-[var(--text-muted)]">
            <span>Kiritilgan pul ({Math.round(100 - earnedPercent)}%)</span>
            <span>Sof daromad ({Math.round(earnedPercent)}%)</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/5 flex justify-between items-center">
          <div className="text-left">
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Yakuniy Jamg'arma</p>
            <p className="text-lg font-black text-purple-300 mt-0.5">{formatUZS(total)}</p>
          </div>
          {earned > 0 && (
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              {Math.round((total / invested) * 100 - 100)}% o'sish!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Subcomponents
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Accounts from './components/Accounts';
import Analytics from './components/Analytics';
import TransactionModal from './components/TransactionModal';

// Initial Mock Data
import { 
  initialAccounts, 
  initialTransactions,
  initialCategories
} from './data/mockData';


export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    const validTabs = ['dashboard', 'transactions', 'accounts', 'settings'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('fm_theme') || 'dark');
  const [notifications, setNotifications] = useState([]);

  // --- PWA Installation State ---
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User Choice: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // --- Hash Routing Sync ---
  useEffect(() => {
    window.location.hash = `#/${activeTab}`;
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const validTabs = ['dashboard', 'transactions', 'accounts', 'settings'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- App States ---
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('expense');

  // --- Category States ---
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('finance_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  useEffect(() => {
    localStorage.setItem('finance_categories', JSON.stringify(categories));
  }, [categories]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatColor, setNewCatColor] = useState('rose');

  const handleAddCategoryForm = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    const newId = 'cat-' + Date.now();
    const newCategory = {
      id: newId,
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'FolderOpen'
    };

    setCategories(prev => ({
      ...prev,
      [newCatType]: [...prev[newCatType], newCategory]
    }));

    setNewCatName('');
  };

  const handleRemoveCategory = (type, catId) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c.id !== catId)
    }));
  };

  // --- Theme Sync ---
  useEffect(() => {
    localStorage.setItem('fm_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  // --- Firestore Data Loader ---
  const loadUserDataFromFirestore = async (userId) => {
    setIsSyncing(true);
    try {
      // 1. Load Accounts
      const accountsRef = collection(db, "users", userId, "accounts");
      const accountsSnap = await getDocs(accountsRef);
      let loadedAccounts = [];
      accountsSnap.forEach(doc => {
        loadedAccounts.push({ ...doc.data(), id: doc.id });
      });

      // 2. Load Transactions
      const transactionsRef = collection(db, "users", userId, "transactions");
      const transactionsSnap = await getDocs(transactionsRef);
      let loadedTransactions = [];
      transactionsSnap.forEach(doc => {
        loadedTransactions.push({ ...doc.data(), id: doc.id });
      });
      loadedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Check if old mock data is present in database (using a check for one of the old account IDs like 'card', 'cash', 'savings')
      const hasOldMockData = loadedAccounts.some(acc => ['card', 'cash', 'savings'].includes(acc.id));
      if (hasOldMockData) {
        console.log("Purging old mock data to reset balance to 0...");
        const batch = writeBatch(db);
        
        // Delete all old transactions
        loadedTransactions.forEach(tx => {
          const docRef = doc(db, "users", userId, "transactions", tx.id);
          batch.delete(docRef);
        });
        
        // Delete all old accounts
        loadedAccounts.forEach(acc => {
          const docRef = doc(db, "users", userId, "accounts", acc.id);
          batch.delete(docRef);
        });
        
        // Create one default account with 0 balance
        const defaultAcc = {
          id: 'default',
          name: 'Hisob',
          balance: 0,
          color: 'from-violet-600 to-indigo-600',
          icon: 'credit-card',
          type: 'Card'
        };
        const defaultAccRef = doc(db, "users", userId, "accounts", defaultAcc.id);
        batch.set(defaultAccRef, defaultAcc);
        
        await batch.commit();
        
        loadedAccounts = [defaultAcc];
        loadedTransactions = [];
        localStorage.removeItem('fm_transactions');
        localStorage.removeItem('fm_accounts');
      }

      if (loadedAccounts.length === 0) {
        // First-time signup / empty database. Let's seed initial data
        const savedAccounts = localStorage.getItem('fm_accounts');
        const savedTransactions = localStorage.getItem('fm_transactions');

        const initAccs = savedAccounts ? JSON.parse(savedAccounts) : initialAccounts;
        const initTxs = savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;

        const batch = writeBatch(db);

        initAccs.forEach(acc => {
          const docRef = doc(db, "users", userId, "accounts", acc.id);
          batch.set(docRef, acc);
        });

        initTxs.forEach(tx => {
          const docRef = doc(db, "users", userId, "transactions", tx.id);
          batch.set(docRef, tx);
        });

        await batch.commit();

        setAccounts(initAccs);
        setTransactions(initTxs);
      } else {
        setAccounts(loadedAccounts);
        setTransactions(loadedTransactions);
      }
    } catch (error) {
      console.error("Firestore initialization error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Auth state listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoadingAuth(true);
        await loadUserDataFromFirestore(user.uid);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setAccounts([]);
        setTransactions([]);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error("Redirect login error:", redirectError);
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Xatolik: Ushbu domen ('" + window.location.hostname + "') Firebase Console'da ruxsat etilgan domenlar (Authorized domains) ro'yxatiga qo'shilmagan. Iltimos, Firebase Console -> Authentication -> Settings -> Authorized domains sahifasiga ushbu domenni qo'shing.");
      } else {
        alert("Tizimga kirishda xatolik yuz berdi: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };



  // --- Add Transaction ---
  const handleAddTransaction = async (newTx) => {
    if (!currentUser) return;
    try {
      const batch = writeBatch(db);

      // 1. Add transaction doc
      const txRef = doc(db, "users", currentUser.uid, "transactions", newTx.id);
      batch.set(txRef, newTx);

      // 2. Calculate and update account balances
      const updatedAccounts = accounts.map(acc => {
        if (newTx.type === 'expense' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (newTx.type === 'income' && acc.id === newTx.accountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        if (newTx.type === 'transfer') {
          if (acc.id === newTx.fromAccountId) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (acc.id === newTx.toAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
        }
        return acc;
      });

      updatedAccounts.forEach(acc => {
        const accRef = doc(db, "users", currentUser.uid, "accounts", acc.id);
        batch.set(accRef, acc);
      });

      await batch.commit();

      setAccounts(updatedAccounts);
      setTransactions(prev => [newTx, ...prev]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // --- Delete Transaction ---
  const handleDeleteTransaction = async (txId) => {
    if (!currentUser) return;
    const targetTx = transactions.find(t => t.id === txId);
    if (!targetTx) return;

    try {
      const batch = writeBatch(db);

      // 1. Delete transaction doc
      const txRef = doc(db, "users", currentUser.uid, "transactions", txId);
      batch.delete(txRef);

      // 2. Revert account balances
      const updatedAccounts = accounts.map(acc => {
        if (targetTx.type === 'expense' && acc.id === targetTx.accountId) {
          return { ...acc, balance: acc.balance + targetTx.amount };
        }
        if (targetTx.type === 'income' && acc.id === targetTx.accountId) {
          return { ...acc, balance: acc.balance - targetTx.amount };
        }
        if (targetTx.type === 'transfer') {
          if (acc.id === targetTx.fromAccountId) {
            return { ...acc, balance: acc.balance + targetTx.amount };
          }
          if (targetTx.toAccountId && acc.id === targetTx.toAccountId) {
            return { ...acc, balance: acc.balance - targetTx.amount };
          }
        }
        return acc;
      });

      updatedAccounts.forEach(acc => {
        const accRef = doc(db, "users", currentUser.uid, "accounts", acc.id);
        batch.set(accRef, acc);
      });

      await batch.commit();

      setAccounts(updatedAccounts);
      setTransactions(prev => prev.filter(t => t.id !== txId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };





  // --- Add Account ---
  const handleAddAccount = async (newAcc) => {
    if (!currentUser) return;
    try {
      const accRef = doc(db, "users", currentUser.uid, "accounts", newAcc.id);
      await setDoc(accRef, newAcc);
      setAccounts(prev => [...prev, newAcc]);
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // --- Delete Account ---
  const handleDeleteAccount = async (accId) => {
    if (!currentUser) return;
    try {
      const accRef = doc(db, "users", currentUser.uid, "accounts", accId);
      await deleteDoc(accRef);
      setAccounts(prev => prev.filter(a => a.id !== accId));
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // --- Account-to-Account Transfer ---
  const handleTransferFunds = (fromId, toId, amount, notes) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);

    const newTx = {
      id: 'tx-' + Date.now(),
      type: 'transfer',
      amount,
      fromAccountId: fromId,
      toAccountId: toId,
      category: 'transfer',
      date: new Date().toISOString().split('T')[0],
      notes: notes || `O'tkazma: ${fromAcc?.name} ➔ ${toAcc?.name}`
    };

    handleAddTransaction(newTx);
  };

  // --- Export Data ---
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      accounts,
      transactions
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `moliya_hisoboti_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Switch Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Render Page view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions}
            accounts={accounts}
            setActiveTab={setActiveTab}
            onOpenAddTransaction={(type) => {
              setTxModalType(type);
              setIsTxModalOpen(true);
            }}
          />
        );
      case 'transactions':
        return (
          <Transactions 
            transactions={transactions}
            accounts={accounts}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onExportData={handleExportData}
            onOpenAddTransaction={(type) => {
              setTxModalType(type);
              setIsTxModalOpen(true);
            }}
          />
        );
      case 'accounts':
        return (
          <Accounts 
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onTransferFunds={handleTransferFunds}
          />
        );
      
      case 'settings':
        return (
          <div className="glass-panel p-6 space-y-6">
            <h2 className="text-xl font-extrabold">Sozlamalar</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm">Mavzu</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Tizim mavzusini tanlang (yorug' yoki qorong'i)</p>
                </div>
                <button 
                  onClick={toggleTheme} 
                  className="btn-secondary rounded-full py-1.5 px-4 text-xs font-bold"
                >
                  {theme === 'dark' ? 'Yorug\'' : 'Qorong\'i'}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm">Foydalanuvchi</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hozirgi foydalanuvchi ma'lumotlari</p>
                </div>
                <span className="text-xs font-bold text-purple-400">{currentUser?.displayName || 'Mehmon'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm">Tizimdan chiqish</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hisobingizdan xavfsiz tarzda chiqib ketish</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="btn-danger rounded-full py-1.5 px-4 text-xs font-bold"
                >
                  Chiqish
                </button>
              </div>
            </div>

            {/* Kategoriyalar boshqaruvi */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Kategoriyalar</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Tizimdagi amaliyotlar kategoriyalarini boshqaring va yangilarini qo'shing</p>
              </div>

              {/* Form to Add Category */}
              <form onSubmit={handleAddCategoryForm} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Kategoriya Nomi</label>
                  <input 
                    type="text"
                    required
                    placeholder="Masalan: Sayohat"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-xs text-white outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Turi</label>
                  <select 
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-xs text-white outline-none cursor-pointer focus:border-purple-500/50"
                  >
                    <option value="expense" className="bg-slate-900 text-white">Xarajat</option>
                    <option value="income" className="bg-slate-900 text-white">Daromad</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Rangi</label>
                  <select 
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-xs text-white outline-none cursor-pointer focus:border-purple-500/50"
                  >
                    <option value="rose" className="bg-slate-900 text-white">Pushti (Rose)</option>
                    <option value="emerald" className="bg-slate-900 text-white">Yashil (Emerald)</option>
                    <option value="blue" className="bg-slate-900 text-white">Moviy (Blue)</option>
                    <option value="amber" className="bg-slate-900 text-white">Sariq (Amber)</option>
                    <option value="indigo" className="bg-slate-900 text-white">To'q ko'k (Indigo)</option>
                    <option value="purple" className="bg-slate-900 text-white">Siyohrang (Purple)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full btn-primary rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Qo'shish</span>
                  </button>
                </div>
              </form>

              {/* List Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Expense Categories */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Xarajat kategoriyalari</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.expense?.map(cat => (
                      <div key={cat.id} className="flex items-center gap-2 bg-white/5 border border-white/5 py-1 px-3 rounded-full text-xs text-white/90">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getCatColor(cat.color)}`} />
                        <span>{cat.name}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveCategory('expense', cat.id)}
                          className="text-white/40 hover:text-rose-400 ml-1 font-bold cursor-pointer text-sm"
                          title="O'chirish"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income Categories */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Daromad kategoriyalari</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.income?.map(cat => (
                      <div key={cat.id} className="flex items-center gap-2 bg-white/5 border border-white/5 py-1 px-3 rounded-full text-xs text-white/90">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getCatColor(cat.color)}`} />
                        <span>{cat.name}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveCategory('income', cat.id)}
                          className="text-white/40 hover:text-rose-400 ml-1 font-bold cursor-pointer text-sm"
                          title="O'chirish"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Sahifa topilmadi</div>;
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-gradient)]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full filter blur-xl animate-pulse" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg relative z-10 animate-bounce">
              <Banknote className="w-10 h-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">MMoliya tizimiga kirish</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed animate-pulse">
              Moliyaviy ma'lumotlaringiz bulutli server bilan xavfsiz sinxronizatsiya qilinmoqda. Iltimos, kuting...
            </p>
          </div>
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div 
        className="flex flex-col min-h-screen relative overflow-x-hidden"
        style={{
          background: 'var(--bg-gradient)',
          fontFamily: "'Outfit', sans-serif",
          color: 'var(--text-primary)'
        }}
      >
        {/* Decorative Backdrop Glows */}
        <div 
          className="absolute pointer-events-none" 
          style={{
            top: '-20%',
            left: '-10%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(110px)',
            zIndex: 0
          }}
        />
        <div 
          className="absolute pointer-events-none" 
          style={{
            bottom: '10%',
            right: '-10%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)',
            filter: 'blur(110px)',
            zIndex: 0
          }}
        />
        <div 
          className="absolute pointer-events-none" 
          style={{
            top: '40%',
            right: '15%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
            filter: 'blur(100px)',
            zIndex: 0
          }}
        />

        {/* 1. Header Navigation Bar */}
        <header 
          className="w-full z-20"
          style={{
            maxWidth: '1200px',
            margin: isMobile ? '12px auto 0 auto' : '24px auto 0 auto',
            padding: isMobile ? '0 12px' : '0 24px'
          }}
        >
          <div 
            className="glass-panel flex items-center justify-between"
            style={{
              padding: isMobile ? '10px 18px' : '14px 28px',
              borderRadius: '9999px',
              border: '1px solid var(--panel-border)',
              background: 'var(--panel-bg)',
              backdropFilter: 'blur(24px)'
            }}
          >
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center text-white" 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <MMCurrencyIcon style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <h1 
                  className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent"
                  style={{
                    background: theme === 'dark' 
                      ? 'linear-gradient(135deg, #ffffff 0%, #c084fc 100%)' 
                      : 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  MMoliya
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="theme-toggle"
                title="Mavzuni o'zgartirish"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--panel-border)',
                  color: 'var(--text-secondary)'
                }}
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
              </button>

              {/* Login CTA Button */}
              <button 
                onClick={handleLogin}
                className="font-bold text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  padding: '10px 24px',
                  background: 'rgba(var(--accent-rgb), 0.1)',
                  border: '1px solid rgba(var(--accent-rgb), 0.35)',
                  borderRadius: '9999px',
                  color: 'var(--accent-primary)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Kirish
              </button>
            </div>
          </div>
        </header>

        {/* 2. Hero Section */}
        <section 
          className="z-10 flex-1 flex items-center"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '30px 16px' : '60px 24px',
            width: '100%'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content Column */}
            <div className="flex flex-col space-y-6" style={{ textAlign: isMobile ? 'center' : 'left', alignItems: isMobile ? 'center' : 'flex-start' }}>
              <div 
                className="inline-flex items-center gap-2"
                style={{
                  display: 'inline-flex',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(var(--accent-rgb), 0.08)',
                  border: '1px solid rgba(var(--accent-rgb), 0.25)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Yangi Davr Moliya Tizimi</span>
              </div>

              <h2 
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{
                  lineHeight: '1.15',
                  backgroundImage: 'linear-gradient(to bottom, #ffffff 60%, var(--text-secondary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                Aqlli va Premium Shaxsiy Moliya Menejeri
              </h2>

              <p className="text-md text-[var(--text-secondary)] leading-relaxed max-w-lg">
                Daromad va xarajatlaringizni oynasimon glassmorphism estetikasida va real-vaqt bulutli sinxronizatsiya yordamida professional tarzda boshqaring.
              </p>

              {/* Action Buttons */}
              {/* Action Buttons Grid Layout */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
                gap: '14px', 
                width: '100%', 
                maxWidth: '380px', 
                paddingTop: '8px', 
                margin: isMobile ? '0 auto' : '0' 
              }}>
                <button 
                  onClick={handleLogin}
                  className="flex items-center justify-center gap-2 font-bold uppercase tracking-wider cursor-pointer"
                  style={{
                    padding: '0 12px',
                    height: '48px',
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    border: '1px solid rgba(var(--accent-rgb), 0.35)',
                    borderRadius: '50px',
                    color: 'var(--accent-primary)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.72rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    letterSpacing: '0.05em',
                    width: '100%',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.22)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.35)';
                  }}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Kirish</span>
                </button>

                <button 
                  onClick={() => {
                    const featSec = document.getElementById('features-section');
                    if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '0 12px',
                    height: '48px',
                    borderRadius: '50px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    width: '100%',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Imkoniyatlar
                </button>

                {!isStandalone && (
                  <button 
                    onClick={handleInstallClick}
                    className="flex items-center justify-center gap-3 font-bold uppercase tracking-wider cursor-pointer"
                    style={{
                      gridColumn: 'span 2',
                      width: '100%',
                      padding: '0 24px',
                      height: '48px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.45)',
                      borderRadius: '50px',
                      color: '#c084fc',
                      backdropFilter: 'blur(8px)',
                      fontSize: '0.8rem',
                      transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                      letterSpacing: '0.08em',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.borderColor = '#c084fc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.45)';
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                    <span>Ilovani o'rnatish</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Savings Simulator */}
            <div className="flex justify-center z-10">
              <div 
                className="glass-card animate-scale-up"
                style={{
                  padding: isMobile ? '16px' : '28px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  boxShadow: 'none',
                  width: '100%',
                  maxWidth: '480px',
                  position: 'relative'
                }}
              >
                <SavingsSimulator theme={theme} />
              </div>
            </div>

          </div>
        </section>

        {/* 3. Features Section */}
        <section 
          id="features-section"
          className="z-10"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '40px 16px' : '80px 24px',
            width: '100%'
          }}
        >
          <div className="text-center space-y-3 mb-12">
            <h3 className="text-xs uppercase tracking-widest text-purple-400 font-bold">Loyiha Imkoniyatlari</h3>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Aqlli va Xavfsiz Boshqaruv</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Shaxsiy byudjet boshqaruvi uchun yaratilgan eng zamonaviy texnologik va dizayn yechimlari.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div 
              className="glass-card text-left space-y-4"
              style={{
                padding: '32px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}
            >
              <div 
                className="flex items-center justify-center text-emerald-400"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Bulutli Sinxronizatsiya</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Ma'lumotlaringiz shaxsiy kompyuterda yo'qolib ketmaydi. Firebase Firestore yordamida barcha o'zgarishlar real-vaqt rejimida bulutga sinxronlanadi.
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              className="glass-card text-left space-y-4"
              style={{
                padding: '32px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}
            >
              <div 
                className="flex items-center justify-center text-purple-400"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.25)'
                }}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Aqlli Moliya Odatlari</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                50/30/20 oltin qoidasi, xavfsizlik yostiqchasi kalkulyatori va hissiy xarajatlarni tiyuvchi 24 soatlik kutish filtri tizimi.
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              className="glass-card text-left space-y-4"
              style={{
                padding: '32px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}
            >
              <div 
                className="flex items-center justify-center text-amber-400"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Jamg'armalar & Budjetlar</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Har bir kategoriya uchun limitlar belgilang va kartalaringizdan jamg'arma maqsadlari uchun suzib o'tish animatsiyasi orqali mablag' yo'naltiring.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Footer Section */}
        <footer 
          className="z-10 mt-auto"
          style={{
            borderTop: '1px solid var(--panel-border)',
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '24px',
              width: '100%',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} MMoliya. Barcha huquqlar himoyalangan.
            </div>
            <div>
              Xavfsiz Google Auth &bull; Firestore Cloud Architecture
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const tabIndices = {
    dashboard: 0,
    transactions: 1,
    settings: 2
  };
  const activeTabIdx = tabIndices[activeTab] ?? 0;

  return (
    <div className="flex h-screen w-screen p-4 gap-4 relative overflow-hidden bg-[var(--bg-gradient)]" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>

      
      {/* Sidebar - Navigation panel (Desktop only) */}
      <aside className="hidden lg:flex flex-col w-72 glass-panel p-6 shrink-0 justify-between">
        
        {/* Top brand */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center text-white shadow-md"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0
              }}
            >
              <MMCurrencyIcon style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h1 
                className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent"
                style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, #ffffff 0%, #c084fc 100%)' 
                    : 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                MMoliya
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Smart Manager</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Boshqaruv Paneli</span>
            </button>
            <button 
              onClick={() => setActiveTab('transactions')} 
              className={`w-full nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            >
              <Calendar className="w-5 h-5" />
              <span>Tranzaksiyalar</span>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/5">
          <div className="text-[10px] text-[var(--text-muted)] text-center">
            v1.0.0 &bull; Local First Architect
          </div>
        </div>

      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pb-0 gap-4">
        
        {/* Top Header / Notification Bar */}
        <header className="glass-panel p-3 px-6 flex items-center justify-between gap-4 rounded-full shrink-0 sticky top-0 z-40">
          {/* Mobile Brand Title */}
          <div className="flex items-center gap-3 lg:hidden">
            <MMCurrencyIcon className="w-6 h-6 text-purple-500" />
            <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">MMoliya</span>
          </div>

          {/* PC Navigation Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="opacity-60">MMoliya</span>
            <span className="opacity-40">/</span>
            <span className="text-purple-400">
              {activeTab === 'dashboard' && 'Boshqaruv paneli'}
              {activeTab === 'transactions' && 'Tranzaksiyalar'}
              {activeTab === 'accounts' && 'Jamg\'arma va Investitsiya'}
              {activeTab === 'settings' && 'Sozlamalar'}
            </span>
          </div>

          {/* Alerts / Actions */}
          <div className="flex items-center gap-4">
            {/* Always Visible Notification Bell */}
            <div className="relative group cursor-pointer" title="Bildirishnomalar">
              <button className="theme-toggle">
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>
              {/* Popover overlay (only if alerts exist) */}
              {notifications.length > 0 && (
                <div className="absolute right-0 top-11 z-50 w-72 glass-panel p-4 hidden group-hover:block border-rose-500/20">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 pb-2 border-b border-white/5 mb-2">
                    Ogohlantirishlar ({notifications.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs text-[var(--text-primary)] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{n.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Always Visible Theme Switcher */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              title="Mavzuni o'zgartirish"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
            </button>

            <div className="h-8 w-[1px] bg-white/5"></div>

            {/* User Profile */}
            <div className="flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-8 h-8 rounded-full border border-purple-500/20 object-cover shadow"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="hidden md:inline text-xs font-semibold text-[var(--text-secondary)]">
                {currentUser?.displayName || 'Foydalanuvchi'}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/5"></div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="theme-toggle" 
              title="Chiqish (Logout)"
            >
              <LogOut className="w-4.5 h-4.5 text-rose-500" />
            </button>
          </div>
        </header>

        {/* View Section */}
        <section className="main-content flex-1 p-4 pb-36 lg:pb-4 overflow-y-auto space-y-4 min-h-0">
          {activeTab !== 'dashboard' && (
            <div className="flex">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="btn-secondary rounded-xl py-1.5 px-3 text-xs flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                title="Boshqaruv paneliga qaytish"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Bosh sahifaga qaytish</span>
              </button>
            </div>
          )}
          {renderActiveView()}
          {/* Spacing to prevent mobile navigation bar overlap */}
          <div className="h-56 md:hidden block shrink-0 pointer-events-none" />
        </section>

        {/* Mobile Navigation bar (shows only on smaller devices) */}
        <div className="lg:hidden mobile-nav-container">
          <div className="glass-panel py-2 px-[7px] flex justify-between items-center gap-0 rounded-full relative">
            
            {/* Sliding Liquid Drop Blob Indicator */}
            <div 
              className="mobile-nav-indicator"
              style={{
                width: 'calc((100% - 14px) / 3)', // dividing by 3 tabs now
                left: '7px',
                transform: `translateX(calc(${activeTabIdx} * 100%))`,
                transition: 'transform 0.5s cubic-bezier(0.25, 1.45, 0.4, 1)' // GPU-accelerated liquid drop animation
              }}
            />

            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`mobile-nav-btn flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'dashboard' ? 'active' : ''}`}
              style={{ minHeight: '44px' }}
            >
              <LayoutDashboard className="w-5 h-5" />
              {activeTab === 'dashboard' && <span className="text-[9px] font-extrabold tracking-tight mt-0.5 animate-fade-in">Dashboard</span>}
            </button>
            
            <button 
              onClick={() => setActiveTab('transactions')} 
              className={`mobile-nav-btn flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'transactions' ? 'active' : ''}`}
              style={{ minHeight: '44px' }}
            >
              <Calendar className="w-5 h-5" />
              {activeTab === 'transactions' && <span className="text-[9px] font-extrabold tracking-tight mt-0.5 animate-fade-in">Tarix</span>}
            </button>

            <button 
              onClick={() => setActiveTab('settings')} 
              className={`mobile-nav-btn flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'settings' ? 'active' : ''}`}
              style={{ minHeight: '44px' }}
            >
              <Settings className="w-5 h-5" />
              {activeTab === 'settings' && <span className="text-[9px] font-extrabold tracking-tight mt-0.5 animate-fade-in">Sozlamalar</span>}
            </button>
          </div>
        </div>

      {/* PWA Install Instructions Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 space-y-6 animate-scale-up text-left" style={{ background: 'var(--panel-bg)', backdropFilter: 'blur(20px)' }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="font-extrabold text-md text-purple-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Ilovani o'rnatish qo'llanmasi
              </h3>
              <button 
                onClick={() => setIsInstallModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              MMoliya ilovasini shaxsiy kompyuteringiz yoki mobil telefoningiz ekraniga mustaqil ilova qilib o'rnatib olishingiz mumkin. Bu sizga internet bo'lmaganda ham ilovadan foydalanish imkonini beradi.
            </p>

            <div className="space-y-4">
              {/* Android / Chrome */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="text-xs font-extrabold text-purple-300">🤖 Android va Google Chrome uchun:</h4>
                <ol className="list-decimal pl-4 text-[11px] text-[var(--text-secondary)] space-y-1">
                  <li>Brauzerning yuqori o'ng burchagidagi <strong>3 ta nuqta</strong> belgisini bosing.</li>
                  <li>Ochilgan menyudan <strong>"Ilovani o'rnatish" (Install app)</strong> yoki <strong>"Ekran yuziga qo'shish" (Add to Home screen)</strong> bandini tanlang.</li>
                  <li>O'rnatishni tasdiqlang.</li>
                </ol>
              </div>

              {/* iOS / Safari */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="text-xs font-extrabold text-purple-300">🍎 iOS va Safari (iPhone/iPad) uchun:</h4>
                <ol className="list-decimal pl-4 text-[11px] text-[var(--text-secondary)] space-y-1">
                  <li>Safari brauzerining pastki qismidagi <strong>"Ulashish" (Share)</strong> tugmasini bosing (o'rtasida yuqoriga yo'nalgan strelkasi bor kvadrat).</li>
                  <li>Menyuni pastga aylantirib, <strong>"Ekran yuziga qo'shish" (Add to Home Screen)</strong> bandini bosing.</li>
                  <li>Yuqori o'ng burchakdagi <strong>"Qo'shish" (Add)</strong> tugmasini bosing.</li>
                </ol>
              </div>

              {/* Desktop Chrome */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="text-xs font-extrabold text-purple-300">💻 Kompyuter (Chrome/Edge/Brave) uchun:</h4>
                <ol className="list-decimal pl-4 text-[11px] text-[var(--text-secondary)] space-y-1">
                  <li>Brauzerning URL manzil satridagi <strong>O'rnatish belgisini</strong> bosing (yoki 3 ta nuqtadan "Install" ni bosing).</li>
                  <li>O'rnatishni tasdiqlang.</li>
                </ol>
              </div>
            </div>

            <button 
              onClick={() => setIsInstallModalOpen(false)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md text-center"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}

      </main>

      {/* Transaction Modal at the root level to cover full viewport including panels */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        accounts={accounts}
        onAddTransaction={handleAddTransaction}
        initialType={txModalType}
        categories={categories}
      />
    </div>
  );
}
