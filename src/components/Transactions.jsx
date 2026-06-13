import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Download, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Calendar,
  Tag,
  Filter,
  X
} from 'lucide-react';
import { initialCategories } from '../data/mockData';

export default function Transactions({
  transactions,
  accounts,
  onAddTransaction,
  onDeleteTransaction,
  onExportData
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Iltimos, to\'g\'ri summa kiriting');
      return;
    }

    if (type === 'transfer') {
      if (!fromAccountId || !toAccountId) {
        alert('Iltimos, jo\'natuvchi va qabul qiluvchi hisobni tanlang');
        return;
      }
      if (fromAccountId === toAccountId) {
        alert('Jo\'natuvchi va qabul qiluvchi hisoblar bir xil bo\'lmasligi kerak');
        return;
      }
    } else {
      if (!accountId) {
        alert('Iltimos, hisobni tanlang');
        return;
      }
      if (!category) {
        alert('Iltimos, kategoriyani tanlang');
        return;
      }
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      type,
      amount: Number(amount),
      category: type === 'transfer' ? 'transfer' : category,
      date,
      notes,
      ...(type === 'transfer' ? { fromAccountId, toAccountId } : { accountId })
    };

    onAddTransaction(newTx);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setAccountId('');
    setFromAccountId('');
    setToAccountId('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Filter Transactions
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    const noteMatch = tx.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = tx.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const amountMatch = tx.amount?.toString().includes(searchQuery);
    const matchesSearch = noteMatch || catMatch || amountMatch;

    // Type filter
    const matchesType = filterType === 'all' || tx.type === filterType;

    // Account filter
    let matchesAccount = true;
    if (filterAccount !== 'all') {
      if (tx.type === 'transfer') {
        matchesAccount = tx.fromAccountId === filterAccount || tx.toAccountId === filterAccount;
      } else {
        matchesAccount = tx.accountId === filterAccount;
      }
    }

    return matchesSearch && matchesType && matchesAccount;
  });

  const formatUZS = (val) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

  const categoryNameMap = {
    food: 'Oziq-ovqat',
    transport: 'Transport',
    utilities: 'Kommunal to\'lovlar',
    entertainment: 'Hordiq va ko\'ngilochar',
    shopping: 'Xaridlar',
    health: 'Sog\'liq va Tibbiyot',
    education: 'Ta\'lim',
    other_exp: 'Boshqa xarajatlar',
    salary: 'Ish haqi',
    freelance: 'Frilans / Biznes',
    investment: 'Investitsiyalar',
    gift: 'Hadiya / Sovg\'a',
    other_inc: 'Boshqa daromadlar',
    transfer: 'O\'tkazma',
    savings: 'Omonat / Jamg\'arma'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tranzaksiyalar amallari</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Barcha kirim-chiqimlar va o'tkazmalar tarixi, qidiruv va filtrlash tizimi.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onExportData()} 
            className="btn-secondary rounded-xl py-2.5"
            title="Hisobotni yuklab olish"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Eksport</span>
          </button>
          
          <button 
            onClick={() => { setType('expense'); setIsModalOpen(true); }} 
            className="btn-primary rounded-xl py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi qo'shish</span>
          </button>
        </div>
      </div>

      {/* Filter and search panel */}
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search 
            className="text-[var(--text-muted)] w-4 h-4" 
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input 
            type="text" 
            placeholder="Izoh, kategoriya yoki summani qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full rounded-xl"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full rounded-xl py-2.5"
          >
            <option value="all">Barcha turlari</option>
            <option value="income">Kirimlar (Daromad)</option>
            <option value="expense">Chiqimlar (Xarajat)</option>
            <option value="transfer">O'tkazmalar</option>
          </select>
        </div>

        {/* Account Filter */}
        <div className="relative">
          <select 
            value={filterAccount} 
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full rounded-xl py-2.5"
          >
            <option value="all">Barcha hisoblar</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel overflow-hidden">
        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr className="border-b border-white/5">
                <th className="font-semibold text-sm">Turi</th>
                <th className="font-semibold text-sm">Kategoriya / Izoh</th>
                <th className="font-semibold text-sm">Hisob (Hamyon)</th>
                <th className="font-semibold text-sm">Sana</th>
                <th className="font-semibold text-sm text-right">Summa</th>
                <th className="font-semibold text-sm text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => {
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                let accountLabel = '';
                if (isTransfer) {
                  const fromAcc = accounts.find(a => a.id === tx.fromAccountId)?.name || 'Hisob';
                  const toAcc = accounts.find(a => a.id === tx.toAccountId)?.name || 'Hisob';
                  accountLabel = `${fromAcc.split(' ')[0]} ➔ ${toAcc.split(' ')[0]}`;
                } else {
                  accountLabel = accounts.find(a => a.id === tx.accountId)?.name || 'Noma\'lum';
                }

                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] light-theme:hover:bg-slate-50 transition-colors">
                    <td>
                      <span className={`badge ${
                        isIncome ? 'badge-success' : isTransfer ? 'badge-info' : 'badge-danger'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-3 h-3 mr-1" /> : isTransfer ? <RefreshCw className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {isIncome ? 'Kirim' : isTransfer ? 'O\'tkazma' : 'Chiqim'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {categoryNameMap[tx.category] || tx.category || 'Belgilanmagan'}
                        </span>
                        {tx.notes && <span className="text-xs text-[var(--text-secondary)] italic mt-0.5">{tx.notes}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-[var(--text-secondary)] truncate max-w-[160px] inline-block" title={accountLabel}>
                        {accountLabel}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{new Date(tx.date).toLocaleDateString('uz-UZ')}</span>
                      </div>
                    </td>
                    <td className={`text-right font-bold text-sm ${
                      isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatUZS(tx.amount)}
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="icon-btn text-[var(--text-muted)] hover:text-red-400 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-[var(--text-muted)] text-sm">
                    Qidiruv bo'yicha hech qanday tranzaksiya topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Card List) */}
        <div className="md:hidden flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 p-1">
          {filteredTransactions.map(tx => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            let accountLabel = '';
            if (isTransfer) {
              const fromAcc = accounts.find(a => a.id === tx.fromAccountId)?.name || 'Hisob';
              const toAcc = accounts.find(a => a.id === tx.toAccountId)?.name || 'Hisob';
              accountLabel = `${fromAcc.split(' ')[0]} ➔ ${toAcc.split(' ')[0]}`;
            } else {
              accountLabel = accounts.find(a => a.id === tx.accountId)?.name || 'Noma\'lum';
            }

            return (
              <div key={tx.id} className="tx-item">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${
                        isIncome ? 'badge-success' : isTransfer ? 'badge-info' : 'badge-danger'
                      } text-[10px] px-2 py-0.5 shrink-0`}>
                        {isIncome ? 'Kirim' : isTransfer ? 'O\'tkazma' : 'Chiqim'}
                      </span>
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        {categoryNameMap[tx.category] || tx.category || 'Belgilanmagan'}
                      </span>
                    </div>
                    {tx.notes && <p className="tx-notes mt-1">{tx.notes}</p>}
                    <span className="text-[10px] text-[var(--text-muted)] mt-1.5 font-medium">
                      {accountLabel} &bull; {new Date(tx.date).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
                
                <div className="tx-right-side">
                  <span className={`tx-amount ${
                    isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-rose-400'
                  }`}>
                    {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatUZS(tx.amount)}
                  </span>
                  <button 
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="icon-btn text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <p className="text-center text-[var(--text-muted)] py-12 text-xs">
              Qidiruv bo'yicha hech qanday tranzaksiya topilmadi.
            </p>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative overflow-hidden animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xl font-bold">Yangi Amaliyot</h3>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-black/20 light-theme:bg-slate-200 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => { setType('expense'); setCategory(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Xarajat
                </button>
                <button 
                  type="button"
                  onClick={() => { setType('income'); setCategory(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Daromad
                </button>
                <button 
                  type="button"
                  onClick={() => { setType('transfer'); setCategory('transfer'); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'transfer' ? 'bg-blue-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  O'tkazma
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Summa (UZS)</label>
                <input 
                  type="number" 
                  required
                  placeholder="Summani kiriting..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Accounts Logic based on Type */}
              {type === 'transfer' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Kimdan (Jo'natuvchi)</label>
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
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Kimga (Qabul qiluvchi)</label>
                    <select 
                      required
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full"
                    >
                      <option value="">Hisob tanlang</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Hisob (Hamyon)</label>
                    <select 
                      required
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full"
                    >
                      <option value="">Tanlang</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Kategoriya</label>
                    <select 
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full"
                    >
                      <option value="">Kategoriya</option>
                      {initialCategories[type]?.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Date & Tags */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Sana</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Izoh (Izoh/Eslatma)</label>
                <textarea 
                  placeholder="Xarid tafsilotlari yoki qo'shimcha eslatma..."
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="btn-secondary rounded-xl py-2 px-4"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className={`${type === 'income' ? 'btn-success' : type === 'expense' ? 'btn-danger' : 'btn-primary'} rounded-xl py-2 px-5`}
                >
                  Qo'shish
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
