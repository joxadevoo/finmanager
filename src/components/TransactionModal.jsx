import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, CreditCard, FolderOpen, Calendar, AlignLeft, ChevronDown } from 'lucide-react';
import { initialCategories } from '../data/mockData';

const getCategoryColorClass = (catColor) => {
  if (!catColor) return 'bg-purple-500';
  if (catColor.includes('bg-')) {
    const match = catColor.match(/bg-([a-z]+)-/);
    const color = match ? match[1] : 'purple';
    return `bg-${color}-500`;
  }
  return `bg-${catColor}-500`;
};


export default function TransactionModal({
  isOpen,
  onClose,
  accounts,
  onAddTransaction,
  initialType = 'expense',
  categories = initialCategories
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Sync initial type when modal opens
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      resetForm();
      if (accounts && accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
  }, [isOpen, initialType, accounts]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setAccountId('');
    setFromAccountId('');
    setToAccountId('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const setDateHelper = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() - daysOffset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  const formatUZS = (val) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

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
      ...(type === 'transfer' ? { fromAccountId, toAccountId } : { accountId: accountId || accounts[0]?.id })
    };

    onAddTransaction(newTx);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 9999999
      }}
    >
      <div className="glass-panel w-full max-w-md p-6 relative overflow-hidden animate-scale-up space-y-6 rounded-3xl border-white/10" style={{ background: 'var(--panel-bg)', backdropFilter: 'blur(30px)', zIndex: 10000000 }}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h3 className="text-xl font-bold tracking-tight">Yangi Amaliyot</h3>
          <button 
            type="button"
            onClick={() => { onClose(); resetForm(); }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Type Switcher */}
          <div className="relative flex bg-black/20 p-1.5 rounded-full border border-white/5 h-[46px] items-center">
            {/* Sliding background pill */}
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-out border"
              style={{
                width: 'calc(50% - 8px)',
                left: type === 'expense' ? '6px' : 'calc(50% + 2px)',
                backgroundColor: type === 'expense' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                borderColor: type === 'expense' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                boxShadow: type === 'expense' ? '0 4px 6px -1px rgba(244, 63, 94, 0.1)' : '0 4px 6px -1px rgba(16, 185, 129, 0.1)'
              }}
            />

            <button 
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'expense' ? 'text-rose-300' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Xarajat</span>
            </button>
            <button 
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'income' ? 'text-emerald-300' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Daromad</span>
            </button>
          </div>

          {/* Amount (Summa) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Summa (UZS)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-extrabold text-xs pointer-events-none">
                UZS
              </span>
              <input 
                type="number" 
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-14 p-3 text-sm focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Kategoriya</label>
            <div className="relative">
              {/* Custom Trigger Button */}
              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-10 p-3 text-sm focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none flex items-center justify-between text-left cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none flex items-center">
                  <FolderOpen className="w-5 h-5" />
                </span>
                <span>
                  {category ? (categories[type]?.find(c => c.id === category)?.name || category) : 'Kategoriyani tanlang'}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isCatDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCatDropdownOpen(false)} />
                  <div 
                    className="absolute left-0 right-0 mt-2 rounded-2xl shadow-xl z-50 overflow-y-auto p-1.5 animate-scale-up"
                    style={{
                      background: 'var(--panel-bg-solid)',
                      border: '1px solid var(--panel-border)',
                      backdropFilter: 'blur(30px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                      maxHeight: '240px'
                    }}
                  >
                    {categories[type]?.length === 0 ? (
                      <div className="p-3 text-xs text-[var(--text-secondary)] text-center">Kategoriyalar mavjud emas</div>
                    ) : (
                      categories[type]?.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategory(cat.id);
                            setIsCatDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm transition-all text-left cursor-pointer"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getCategoryColorClass(cat.color)}`} />
                          <span>{cat.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Date with helper pills */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Sana</label>
              <div className="flex gap-1.5">
                <button 
                  type="button" 
                  onClick={() => setDateHelper(0)}
                  className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-0.5 text-purple-300 font-bold cursor-pointer hover:bg-purple-500/20 transition-all"
                >
                  Bugun
                </button>
                <button 
                  type="button" 
                  onClick={() => setDateHelper(1)}
                  className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-0.5 text-purple-300 font-bold cursor-pointer hover:bg-purple-500/20 transition-all"
                >
                  Kecha
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none flex items-center">
                <Calendar className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                required
                placeholder="YYYY-MM-DD"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full font-mono text-sm rounded-2xl border border-white/10 bg-white/5 pl-11 p-3 focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Izoh (Eslatma)</label>
            <div className="relative">
              <span className="absolute left-4 text-amber-400 pointer-events-none flex items-start" style={{ top: '14px' }}>
                <AlignLeft className="w-5 h-5" />
              </span>
              <textarea 
                placeholder="Xarid tafsilotlari yoki qo'shimcha eslatma..."
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 pl-11 p-3 text-sm focus:border-purple-500/50 focus:bg-white/10 transition-all outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-3 border-t border-white/5">
            <button 
              type="button" 
              onClick={() => { onClose(); resetForm(); }}
              className="btn-secondary rounded-full py-3 px-6 text-xs font-bold flex-1 cursor-pointer transition-all border border-white/10 hover:bg-white/10 text-center justify-center"
            >
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className={`${
                type === 'income' 
                  ? 'btn-success bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' 
                  : type === 'expense' 
                    ? 'btn-danger bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' 
                    : 'btn-primary bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              } rounded-full py-3 px-6 text-xs font-extrabold flex-1 cursor-pointer transition-all shadow-lg text-center justify-center`}
            >
              Qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
