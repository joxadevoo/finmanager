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
import { signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
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

// Subcomponents
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Goals from './components/Goals';
import Accounts from './components/Accounts';
import Analytics from './components/Analytics';

// Initial Mock Data
import { 
  initialAccounts, 
  initialTransactions, 
  initialBudgets, 
  initialGoals 
} from './data/mockData';


export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    const validTabs = ['dashboard', 'transactions', 'budgets', 'goals', 'accounts', 'analytics'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('fm_theme') || 'dark');
  const [notifications, setNotifications] = useState([]);

  // --- Hash Routing Sync ---
  useEffect(() => {
    window.location.hash = `#/${activeTab}`;
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const validTabs = ['dashboard', 'transactions', 'budgets', 'goals', 'accounts', 'analytics'];
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
  const [budgets, setBudgets] = useState(initialBudgets);
  const [goals, setGoals] = useState([]);

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

      // 3. Load Budgets
      const budgetsRef = collection(db, "users", userId, "budgets");
      const budgetsSnap = await getDocs(budgetsRef);
      let loadedBudgets = [];
      budgetsSnap.forEach(doc => {
        loadedBudgets.push({ ...doc.data(), category: doc.id });
      });

      // 4. Load Goals
      const goalsRef = collection(db, "users", userId, "goals");
      const goalsSnap = await getDocs(goalsRef);
      let loadedGoals = [];
      goalsSnap.forEach(doc => {
        loadedGoals.push({ ...doc.data(), id: doc.id });
      });

      if (loadedAccounts.length === 0) {
        // First-time signup / empty database. Let's seed initial data
        const savedAccounts = localStorage.getItem('fm_accounts');
        const savedTransactions = localStorage.getItem('fm_transactions');
        const savedBudgets = localStorage.getItem('fm_budgets');
        const savedGoals = localStorage.getItem('fm_goals');

        const initAccs = savedAccounts ? JSON.parse(savedAccounts) : initialAccounts;
        const initTxs = savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
        const initBuds = savedBudgets ? JSON.parse(savedBudgets) : initialBudgets;
        const initGls = savedGoals ? JSON.parse(savedGoals) : initialGoals;

        const batch = writeBatch(db);

        initAccs.forEach(acc => {
          const docRef = doc(db, "users", userId, "accounts", acc.id);
          batch.set(docRef, acc);
        });

        initTxs.forEach(tx => {
          const docRef = doc(db, "users", userId, "transactions", tx.id);
          batch.set(docRef, tx);
        });

        initBuds.forEach(bud => {
          const docRef = doc(db, "users", userId, "budgets", bud.category);
          batch.set(docRef, bud);
        });

        initGls.forEach(goal => {
          const docRef = doc(db, "users", userId, "goals", goal.id);
          batch.set(docRef, goal);
        });

        await batch.commit();

        setAccounts(initAccs);
        setTransactions(initTxs);
        setBudgets(initBuds);
        setGoals(initGls);
      } else {
        setAccounts(loadedAccounts);
        setTransactions(loadedTransactions);
        setBudgets(loadedBudgets.length > 0 ? loadedBudgets : initialBudgets);
        setGoals(loadedGoals);
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
        await loadUserDataFromFirestore(user.uid);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setAccounts([]);
        setTransactions([]);
        setBudgets(initialBudgets);
        setGoals([]);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- Dynamic Budget Syncing ---
  // Re-calculate spent amount dynamically whenever transactions change
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && 
             txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear;
    });

    setBudgets(prevBudgets => {
      const updated = prevBudgets.map(b => {
        const spent = monthlyExpenses
          .filter(tx => tx.category === b.category)
          .reduce((sum, tx) => sum + tx.amount, 0);
        return { ...b, spent };
      });
      
      // Check for over-budget alerts
      const alerts = [];
      updated.forEach(b => {
        if (b.spent > b.limit) {
          const categoryNameMap = {
            food: 'Oziq-ovqat',
            transport: 'Transport',
            utilities: 'Kommunal to\'lovlar',
            shopping: 'Xaridlar',
            entertainment: 'Hordiq',
            health: 'Sog\'liq',
            education: 'Ta\'lim',
            other_exp: 'Boshqa xarajatlar'
          };
          alerts.push({
            id: `alert-${b.category}`,
            message: `"${categoryNameMap[b.category] || b.category}" budjet limiti oshib ketdi!`,
            type: 'warning'
          });
        }
      });
      setNotifications(alerts);

      return updated;
    });
  }, [transactions]);

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

  // --- Update Budget Limit ---
  const handleUpdateBudgetLimit = async (category, limit) => {
    if (!currentUser) return;
    try {
      const updatedBudgets = budgets.map(b => b.category === category ? { ...b, limit } : b);
      const targetBudget = updatedBudgets.find(b => b.category === category);
      if (targetBudget) {
        const budgetRef = doc(db, "users", currentUser.uid, "budgets", category);
        await setDoc(budgetRef, { limit: targetBudget.limit, category: targetBudget.category });
      }
      setBudgets(updatedBudgets);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  // --- Add Goal ---
  const handleAddGoal = async (newGoal) => {
    if (!currentUser) return;
    try {
      const goalRef = doc(db, "users", currentUser.uid, "goals", newGoal.id);
      await setDoc(goalRef, newGoal);
      setGoals(prev => [...prev, newGoal]);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  // --- Delete Goal ---
  const handleDeleteGoal = async (goalId) => {
    if (!currentUser) return;
    try {
      const goalRef = doc(db, "users", currentUser.uid, "goals", goalId);
      await deleteDoc(goalRef);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  // --- Contribute to Savings Goal ---
  const handleContributeToGoal = async (goalId, fromAccId, amount) => {
    if (!currentUser) return;
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    try {
      const batch = writeBatch(db);

      // 1. Update Goal savings
      const updatedGoal = { ...targetGoal, current: targetGoal.current + amount };
      const goalRef = doc(db, "users", currentUser.uid, "goals", goalId);
      batch.set(goalRef, updatedGoal);

      // 2. Add transaction of type 'transfer'
      const newTx = {
        id: 'tx-' + Date.now(),
        type: 'transfer',
        amount: amount,
        fromAccountId: fromAccId,
        toAccountId: 'savings',
        category: 'savings',
        date: new Date().toISOString().split('T')[0],
        notes: `"${targetGoal.name}" jamg'arma maqsadiga o'tkazma`
      };
      const txRef = doc(db, "users", currentUser.uid, "transactions", newTx.id);
      batch.set(txRef, newTx);

      // 3. Update account balance
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === fromAccId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === 'savings') {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      });

      updatedAccounts.forEach(acc => {
        const accRef = doc(db, "users", currentUser.uid, "accounts", acc.id);
        batch.set(accRef, acc);
      });

      await batch.commit();

      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      setAccounts(updatedAccounts);
      setTransactions(prev => [newTx, ...prev]);
    } catch (error) {
      console.error("Error contributing to goal:", error);
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
      transactions,
      budgets,
      goals
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
            budgets={budgets}
            goals={goals}
            setActiveTab={setActiveTab}
            onOpenAddTransaction={(type) => {
              setActiveTab('transactions');
              // Small delay to let Transactions mount, then open modal
              setTimeout(() => {
                const addBtn = document.querySelector('.btn-primary');
                if (addBtn) addBtn.click();
              }, 100);
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
          />
        );
      case 'budgets':
        return (
          <Budgets 
            budgets={budgets}
            transactions={transactions}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
          />
        );
      case 'goals':
        return (
          <Goals 
            goals={goals}
            accounts={accounts}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onContributeToGoal={handleContributeToGoal}
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
      case 'analytics':
        return (
          <Analytics 
            transactions={transactions}
            accounts={accounts}
          />
        );
      default:
        return <div>Sahifa topilmadi</div>;
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-gradient)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <TrendingUp className="w-16 h-16 text-purple-500 animate-pulse" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Yuklanmoqda...</h2>
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
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
            margin: '24px auto 0 auto',
            padding: '0 24px'
          }}
        >
          <div 
            className="glass-panel flex items-center justify-between"
            style={{
              padding: '14px 28px',
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
                  MoliyaManage
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
            padding: '60px 24px',
            width: '100%'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Content Column */}
            <div className="text-left space-y-6">
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
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={handleLogin}
                  className="flex items-center justify-center gap-3 font-bold uppercase tracking-wider cursor-pointer"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '16px 32px',
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    border: '1px solid rgba(var(--accent-rgb), 0.35)',
                    borderRadius: '50px',
                    color: 'var(--accent-primary)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    letterSpacing: '0.08em'
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
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Google orqali boshlash</span>
                </button>

                <button 
                  onClick={() => {
                    const featSec = document.getElementById('features-section');
                    if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '16px 32px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  Imkoniyatlar
                </button>
              </div>
            </div>

            {/* Right Column: Visual Dashboard Mockup */}
            <div className="flex justify-center z-10">
              <div 
                className="glass-card animate-scale-up"
                style={{
                  padding: '28px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  boxShadow: 'none',
                  width: '100%',
                  maxWidth: '460px',
                  position: 'relative'
                }}
              >
                {/* Mock Window Controls Decorator */}
                <div className="flex gap-1.5 mb-5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/40" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/40" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
                </div>

                <div className="flex items-center gap-2.5 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-live" style={{ display: 'inline-block', flexShrink: 0 }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 text-left" style={{ margin: 0 }}>
                    JONLI MOLIYAVIY PORTFEL SIMULYATORI
                  </h3>
                </div>

                {/* Mock KPI Cards */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Umumiy Mablag'</p>
                    <p className="text-md font-bold text-[var(--text-primary)] mt-1">15,400,000 UZS</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Oylik Xarajat</p>
                    <p className="text-md font-bold text-rose-400 mt-1">3,850,000 UZS</p>
                  </div>
                </div>

                {/* SVG Chart & Budgets Preview */}
                <div className="flex flex-col sm:flex-row gap-5 items-center mb-5">
                  {/* SVG Chart */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8c6239" strokeWidth="3" strokeDasharray="60 40" strokeDashoffset="0" style={{ stroke: 'var(--accent-primary)' }} />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-60" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="-85" />
                    </svg>
                    <div className="absolute text-[9px] font-bold text-[var(--text-secondary)]">72% Tejash</div>
                  </div>

                  {/* Budgets Progress */}
                  <div className="flex-1 space-y-2.5 w-full text-left">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold mb-1">
                        <span>Oziq-ovqat</span>
                        <span>850,000 / 1,200,000 UZS</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '70.8%', background: 'var(--accent-primary)' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold mb-1">
                        <span>Transport</span>
                        <span>350,000 / 500,000 UZS</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Transactions list */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">C</div>
                      <span>Kofe & Hordiq</span>
                    </div>
                    <span className="font-bold text-rose-400">-45,000 UZS</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">I</div>
                      <span>Freelance shartnoma</span>
                    </div>
                    <span className="font-bold text-emerald-400">+12,000,000 UZS</span>
                  </div>
                </div>
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
            padding: '80px 24px',
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
                className="flex items-center justify-center text-blue-400"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)'
                }}
              >
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">SVG Donut Chart Tahlil</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Tashqi og'ir kutubxonalarsiz, to'liq SVG elementlari asosida yaratilgan interaktiv va yorqin xarajatlar tahlili diagrammasi.
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
              &copy; {new Date().getFullYear()} MoliyaManage. Barcha huquqlar himoyalangan.
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
    budgets: 2,
    goals: 3,
    analytics: 4
  };
  const activeTabIdx = tabIndices[activeTab] ?? 0;

  return (
    <div className="flex min-h-screen relative overflow-hidden">

      
      {/* Sidebar - Navigation panel (Desktop only) */}
      <aside className="hidden lg:flex flex-col w-72 glass-panel m-4 mr-0 p-6 shrink-0 justify-between">
        
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
                MoliyaManage
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
            <button 
              onClick={() => setActiveTab('budgets')} 
              className={`w-full nav-link ${activeTab === 'budgets' ? 'active' : ''}`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Budjet Nazorati</span>
            </button>
            <button 
              onClick={() => setActiveTab('goals')} 
              className={`w-full nav-link ${activeTab === 'goals' ? 'active' : ''}`}
            >
              <Target className="w-5 h-5" />
              <span>Jamg'armalar</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`w-full nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart2 className="w-5 h-5" />
              <span>Moliya Tahlili</span>
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
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        
        {/* Top Header / Notification Bar */}
        <header className="glass-panel m-4 p-3 px-6 flex items-center justify-between gap-4 rounded-full">
          {/* Mobile Brand Title */}
          <div className="flex items-center gap-3 lg:hidden">
            <MMCurrencyIcon className="w-6 h-6 text-purple-500" />
            <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">MoliyaManage</span>
          </div>

          {/* PC Navigation Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="opacity-60">MoliyaManage</span>
            <span className="opacity-40">/</span>
            <span className="text-purple-400">
              {activeTab === 'dashboard' && 'Boshqaruv paneli'}
              {activeTab === 'transactions' && 'Tranzaksiyalar'}
              {activeTab === 'budgets' && 'Budjet nazorati'}
              {activeTab === 'goals' && 'Jamg\'armalar'}
              {activeTab === 'accounts' && 'Hamyonlar'}
              {activeTab === 'analytics' && 'Moliya tahlili'}
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
        <section className="flex-1 p-4 overflow-y-auto space-y-4">
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
        </section>

        {/* Mobile Navigation bar (shows only on smaller devices) */}
        <div className="lg:hidden mobile-nav-container">
          <div className="glass-panel py-2 px-4 flex justify-between items-center gap-1 rounded-full relative">
            
            {/* Sliding Liquid Drop Blob Indicator */}
            <div 
              className="mobile-nav-indicator"
              style={{
                width: 'calc((100% - 32px) / 5)', // subtracting px-4 container padding (16px left + 16px right)
                left: '16px',
                transform: `translateX(calc(${activeTabIdx} * 100%))`,
                transition: 'transform 0.5s cubic-bezier(0.25, 1.45, 0.4, 1)' // GPU-accelerated liquid drop animation
              }}
            />

            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`mobile-nav-btn flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold">Panel</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('transactions')} 
              className={`mobile-nav-btn flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'transactions' ? 'active' : ''}`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-bold">Tarix</span>
            </button>

            <button 
              onClick={() => setActiveTab('budgets')} 
              className={`mobile-nav-btn flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'budgets' ? 'active' : ''}`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="text-[10px] font-bold">Budjet</span>
            </button>

            <button 
              onClick={() => setActiveTab('goals')} 
              className={`mobile-nav-btn flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'goals' ? 'active' : ''}`}
            >
              <Target className="w-5 h-5" />
              <span className="text-[10px] font-bold">Maqsad</span>
            </button>

            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`mobile-nav-btn flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-full transition-all ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[10px] font-bold">Tahlil</span>
            </button>
          </div>
        </div>

      </main>
    </div>
);
}
