import React, { useState } from 'react';
import { Plus, CreditCard, Banknote, Wallet, X, ArrowRightLeft, Trash2 } from 'lucide-react';

export default function Accounts({
  accounts,
  onAddAccount,
  onDeleteAccount,
  onTransferFunds
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Add Account Form State
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('Card');
  const [color, setColor] = useState('from-violet-600 to-indigo-600');

  // Transfer Form State
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [notes, setNotes] = useState('');

  const formatUZS = (val) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'Card': return <CreditCard className="w-6 h-6" />;
      case 'Cash': return <Banknote className="w-6 h-6" />;
      default: return <Wallet className="w-6 h-6" />;
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !balance || Number(balance) < 0) {
      alert('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring');
      return;
    }

    let iconName = 'wallet';
    if (type === 'Card') iconName = 'credit-card';
    if (type === 'Cash') iconName = 'banknote';

    const newAcc = {
      id: 'acc-' + Date.now(),
      name,
      balance: Number(balance),
      color,
      icon: iconName,
      type
    };

    onAddAccount(newAcc);
    setIsAddModalOpen(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setName('');
    setBalance('');
    setType('Card');
    setColor('from-violet-600 to-indigo-600');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !transferAmount || Number(transferAmount) <= 0) {
      alert('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring');
      return;
    }

    if (fromAccountId === toAccountId) {
      alert('Jo\'natuvchi va qabul qiluvchi hisoblar bir xil bo\'lmasligi kerak');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === fromAccountId);
    if (sourceAcc.balance < Number(transferAmount)) {
      alert(`Xatolik: tanlangan hisobda yetarli mablag' mavjud emas. Qoldiq: ${formatUZS(sourceAcc.balance)}`);
      return;
    }

    onTransferFunds(fromAccountId, toAccountId, Number(transferAmount), notes);
    setIsTransferModalOpen(false);
    setFromAccountId('');
    setToAccountId('');
    setTransferAmount('');
    setNotes('');
  };

  const colors = [
    { value: 'from-violet-600 to-indigo-600', name: 'Binafsha / Indigo' },
    { value: 'from-emerald-500 to-teal-600', name: 'Yashil / Zumrad' },
    { value: 'from-amber-500 to-orange-600', name: 'Tilla / Sabzirang' },
    { value: 'from-rose-500 to-red-600', name: 'Qizil / Pushti' },
    { value: 'from-sky-500 to-blue-600', name: 'Havorang / Ko\'k' },
    { value: 'from-slate-600 to-slate-800', name: 'To\'q kulrang / Grafit' }
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hisoblar & Hamyonlar</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Barcha bank kartalari, naqd hamyonlar va omonat hisoblaringizni boshqarish.
          </p>
        </div>
        
        <div className="flex gap-2">
          {accounts.length > 1 && (
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="btn-secondary rounded-xl py-2.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>O'tkazmalar amali</span>
            </button>
          )}
          
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="btn-primary rounded-xl py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Hisob</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const share = totalBalance > 0 ? ((acc.balance / totalBalance) * 100).toFixed(0) : 0;
          return (
            <div 
              key={acc.id} 
              className={`p-6 rounded-2xl border border-white/5 bg-gradient-to-br ${acc.color} text-white shadow-xl relative overflow-hidden group flex flex-col justify-between min-h-[180px]`}
            >
              <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-4 translate-y-4 group-hover:scale-125 transition-all duration-300">
                {getAccountIcon(acc.type)}
              </div>

              {/* Upper Section */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight truncate max-w-[160px]" title={acc.name}>
                      {acc.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">{acc.type}</span>
                  </div>
                </div>

                <span className="badge bg-white/10 text-white border-none text-[10px] font-bold">
                  Ulishi: {share}%
                </span>
              </div>

              {/* Lower Section */}
              <div className="flex justify-between items-end mt-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold opacity-75">Qoldiq</p>
                  <p className="text-2xl font-black tracking-tight">{formatUZS(acc.balance)}</p>
                </div>

                {accounts.length > 1 && (
                  <button 
                    onClick={() => {
                      if (confirm('Ushbu hisobni o\'chirmoqchimisiz? Undagi mablag\'lar ham o\'chiriladi.')) {
                        onDeleteAccount(acc.id);
                      }
                    }}
                    className="p-2 text-white/50 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-all"
                    title="Hisobni o'chirish"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative overflow-hidden animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xl font-bold">Yangi Hisob Yaratish</h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Hisob nomi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: Ipak Yo'li Visa, Naqd hamyon..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Boshlang'ich qoldiq (UZS)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Masalan: 500,000"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Hisob turi</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full"
                  >
                    <option value="Card">Bank kartasi (Card)</option>
                    <option value="Cash">Naqd pul (Cash)</option>
                    <option value="Savings">Jamg'arma / Omonat (Savings)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Vizual dizayn rangi</label>
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
                  Hisob qo'shish
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm p-6 relative overflow-hidden animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold">Hisoblararo O'tkazma</h3>
              <button 
                onClick={() => { 
                  setIsTransferModalOpen(false); 
                  setFromAccountId(''); 
                  setToAccountId(''); 
                  setTransferAmount(''); 
                  setNotes(''); 
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Qaysi hisobdan (Chiqish)</label>
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
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Qaysi hisobga (Kirim)</label>
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">O'tkazma summasi (UZS)</label>
                <input 
                  type="number" 
                  required
                  placeholder="Summani kiriting..."
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Eslatma / Izoh</label>
                <input 
                  type="text" 
                  placeholder="Masalan: Karta naqdlashtirish, Omonat to'ldirish..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => { 
                    setIsTransferModalOpen(false); 
                    setFromAccountId(''); 
                    setToAccountId(''); 
                    setTransferAmount(''); 
                    setNotes(''); 
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
