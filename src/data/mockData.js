export const initialAccounts = [
  {
    id: 'card',
    name: 'Plastik Karta (Uzcard/Humoy)',
    balance: 14500000,
    color: 'from-violet-600 to-indigo-600',
    icon: 'credit-card',
    type: 'Card'
  },
  {
    id: 'cash',
    name: 'Naqd Pullar',
    balance: 3200000,
    color: 'from-emerald-500 to-teal-600',
    icon: 'banknote',
    type: 'Cash'
  },
  {
    id: 'savings',
    name: 'Omonat (Jamg\'arma)',
    balance: 25000000,
    color: 'from-amber-500 to-orange-600',
    icon: 'wallet',
    type: 'Savings'
  }
];

export const initialCategories = {
  expense: [
    { id: 'food', name: 'Oziq-ovqat', icon: 'utensils', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: 'transport', name: 'Transport', icon: 'car', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'utilities', name: 'Kommunal to\'lovlar', icon: 'home', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'entertainment', name: 'Hordiq va Ko\'ngilochar', icon: 'film', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'shopping', name: 'Xaridlar (Kiyim/Texnika)', icon: 'shopping-bag', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { id: 'health', name: 'Sog\'liq va Tibbiyot', icon: 'heart-pulse', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'education', name: 'Ta\'lim', icon: 'graduation-cap', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: 'other_exp', name: 'Boshqa xarajatlar', icon: 'more-horizontal', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
  ],
  income: [
    { id: 'salary', name: 'Oylik Ish Haqi', icon: 'briefcase', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'freelance', name: 'Frilans / Biznes', icon: 'laptop', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { id: 'investment', name: 'Investitsiyalar', icon: 'trending-up', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { id: 'gift', name: 'Hadiya / Sovg\'a', icon: 'gift', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { id: 'other_inc', name: 'Boshqa daromadlar', icon: 'plus-circle', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
  ]
};

export const initialTransactions = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 8500000,
    category: 'salary',
    date: '2026-06-12',
    accountId: 'card',
    notes: 'May oyi uchun asosiy oylik ish haqi',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 450000,
    category: 'food',
    date: '2026-06-12',
    accountId: 'card',
    notes: 'Korzinka.uz supermarket xaridi',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 120000,
    category: 'transport',
    date: '2026-06-11',
    accountId: 'cash',
    notes: 'Yandex Taxi va benzin xarajati',
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 350000,
    category: 'utilities',
    date: '2026-06-10',
    accountId: 'card',
    notes: 'Elektr energiyasi va internet to\'lovi',
  },
  {
    id: 'tx-5',
    type: 'income',
    amount: 1800000,
    category: 'freelance',
    date: '2026-06-09',
    accountId: 'card',
    notes: 'Telegram bot dasturlash xizmati uchun',
  },
  {
    id: 'tx-6',
    type: 'expense',
    amount: 1200000,
    category: 'shopping',
    date: '2026-06-08',
    accountId: 'card',
    notes: 'Yozgi kiyim-bosh xarid qilish',
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 250000,
    category: 'health',
    date: '2026-06-07',
    accountId: 'cash',
    notes: 'Dorixona va shifokor ko\'rigi',
  },
  {
    id: 'tx-8',
    type: 'transfer',
    amount: 1500000,
    fromAccountId: 'card',
    toAccountId: 'savings',
    category: 'savings',
    date: '2026-06-05',
    notes: 'Omonat hisobini to\'ldirish (Jamg\'arma)',
  }
];

export const initialBudgets = [
  { category: 'food', limit: 3000000, spent: 1450000 },
  { category: 'transport', limit: 1000000, spent: 480000 },
  { category: 'utilities', limit: 800000, spent: 350000 },
  { category: 'shopping', limit: 2500000, spent: 1200000 },
  { category: 'entertainment', limit: 1500000, spent: 650000 },
  { category: 'health', limit: 1000000, spent: 250000 }
];

export const initialGoals = [
  {
    id: 'goal-1',
    name: 'MacBook Pro M3 Pro',
    target: 28000000,
    current: 18000000,
    deadline: '2026-10-31',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'goal-2',
    name: 'Sayohat (Antalya)',
    target: 15000000,
    current: 7000000,
    deadline: '2026-08-15',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'goal-3',
    name: 'Favqulodda Hamyon (Piyoda)',
    target: 10000000,
    current: 5000000,
    deadline: '2026-12-31',
    color: 'from-emerald-500 to-teal-500'
  }
];

export const financialTips = [
  "Daromadingizning kamida 10-20% qismini omonat yoki investitsiyalarga yo'naltiring.",
  "Har oylik budjet chegaralarini o'rnating va ularga qat'iy rioya qilishga harakat qiling.",
  "Kundalik mayda xarajatlarni ham yozib boring, ular oylik yakunda katta summani tashkil qilishi mumkin.",
  "Katta xaridlardan oldin 24 soat kuting. Bu impulsiv (hissiyotga berilib) xaridlarning oldini oladi.",
  "Qarz va kreditlarni imkon qadar tezroq yoping, foizlar pulingizni yeb bitiradi.",
  "Favqulodda vaziyatlar uchun kamida 3-6 oylik xarajatlaringizga teng bo'lgan zaxira hamyonini yarating."
];
