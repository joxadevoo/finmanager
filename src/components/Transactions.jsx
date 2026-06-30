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
  onExportData,
  onOpenAddTransaction
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');


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
            onClick={() => onOpenAddTransaction('expense')} 
            className="btn-primary rounded-xl py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi qo'shish</span>
          </button>
        </div>
      </div>

      {/* Filter and search panel */}
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {new Date(tx.date).toLocaleDateString('uz-UZ')}
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
    </div>
  );
}
