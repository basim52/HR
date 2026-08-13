import { Debt, Transaction, CategoryBudget, UserSettings, DebtPayment } from '../types';
import { CATEGORIES } from '../data/categories';

const DEBTS_KEY = 'debt_app_debts_v1';
const TRANSACTIONS_KEY = 'debt_app_transactions_v1';
const BUDGETS_KEY = 'debt_app_budgets_v1';
const SETTINGS_KEY = 'debt_app_settings_v1';

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => {
  listeners.forEach((l) => l());
};

// Seed Demo Data
export const getSeedDebts = (): Debt[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'debt_1',
      type: 'i_owe', // دين عليك
      personName: 'أحمد السعيد (شركة التقنية)',
      personPhone: '0501234567',
      totalAmount: 5000,
      paidAmount: 2000,
      dueDate: `${year}-${month}-28`,
      createdDate: `${year}-01-10`,
      status: 'partial',
      notes: 'متبقي من أقساط أجهزة الكمبيوتر المكتبية',
      payments: [
        {
          id: 'pay_1_1',
          debtId: 'debt_1',
          amount: 1000,
          date: `${year}-${month}-02`,
          notes: 'دفعة شهرية أُولى',
        },
        {
          id: 'pay_1_2',
          debtId: 'debt_1',
          amount: 1000,
          date: `${year}-${month}-10`,
          notes: 'دفعة شهرية ثانية',
        },
      ],
    },
    {
      id: 'debt_2',
      type: 'owed_to_me', // دين لك
      personName: 'خالد عبد الله',
      personPhone: '0559876543',
      totalAmount: 3500,
      paidAmount: 1500,
      dueDate: `${year}-${month}-20`,
      createdDate: `${year}-02-15`,
      status: 'partial',
      notes: 'قرض شخصي للمساعدة في صيانة السيارة',
      payments: [
        {
          id: 'pay_2_1',
          debtId: 'debt_2',
          amount: 1500,
          date: `${year}-${month}-05`,
          notes: 'سداد تحويل بنكي',
        },
      ],
    },
    {
      id: 'debt_3',
      type: 'i_owe',
      personName: 'المهندس ياسر الراشد',
      personPhone: '0541112233',
      totalAmount: 1200,
      paidAmount: 0,
      dueDate: `${year}-${month}-15`,
      createdDate: `${year}-03-01`,
      status: 'pending',
      notes: 'تكاليف استشارة هندسية',
      payments: [],
    },
    {
      id: 'debt_4',
      type: 'owed_to_me',
      personName: 'فهد العتيبي',
      personPhone: '0567778899',
      totalAmount: 2500,
      paidAmount: 2500,
      dueDate: `${year}-${month}-01`,
      createdDate: `${year}-01-05`,
      status: 'paid',
      notes: 'سداد كامل المبلغ شكراً له',
      payments: [
        {
          id: 'pay_4_1',
          debtId: 'debt_4',
          amount: 2500,
          date: `${year}-${month}-01`,
          notes: 'تسوية نهائية نقداً',
        },
      ],
    },
  ];
};

export const getSeedTransactions = (): Transaction[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'tx_1',
      type: 'income',
      amount: 14500,
      category: 'salary',
      title: 'الراتب الشهري الأساسي',
      date: `${year}-${month}-01`,
      paymentMethod: 'bank_transfer',
      notes: 'إيداع راتب الشهر',
    },
    {
      id: 'tx_2',
      type: 'expense',
      amount: 3200,
      category: 'housing',
      title: 'إيجار الشقة السكني',
      date: `${year}-${month}-02`,
      paymentMethod: 'bank_transfer',
      notes: 'دفعة الإيجار الشهرية',
    },
    {
      id: 'tx_3',
      type: 'expense',
      amount: 450,
      category: 'bills',
      title: 'فاتورة الكهرباء والماء',
      date: `${year}-${month}-05`,
      paymentMethod: 'card',
      notes: 'سداد عبر مدى',
    },
    {
      id: 'tx_4',
      type: 'expense',
      amount: 1150,
      category: 'food',
      title: 'مشتريات السوبرماركت والمواد الغذائية',
      date: `${year}-${month}-08`,
      paymentMethod: 'card',
    },
    {
      id: 'tx_5',
      type: 'expense',
      amount: 600,
      category: 'transport',
      title: 'وقود السيارة وصيانة دورية',
      date: `${year}-${month}-10`,
      paymentMethod: 'cash',
    },
    {
      id: 'tx_6',
      type: 'expense',
      amount: 350,
      category: 'shopping',
      title: 'ملابس واحتياجات شخصية',
      date: `${year}-${month}-12`,
      paymentMethod: 'card',
    },
    {
      id: 'tx_7',
      type: 'income',
      amount: 1800,
      category: 'investment',
      title: 'أرباح مشروع جانبي / استشارات',
      date: `${year}-${month}-11`,
      paymentMethod: 'bank_transfer',
    },
    {
      id: 'tx_8',
      type: 'expense',
      amount: 1000,
      category: 'debt',
      title: 'دفعة سداد دين (شركة التقنية)',
      date: `${year}-${month}-10`,
      paymentMethod: 'bank_transfer',
      notes: 'مرتبطة بالدين المسجل',
    },
    {
      id: 'tx_9',
      type: 'expense',
      amount: 280,
      category: 'entertainment',
      title: 'عشاء مع العائلة وسينما',
      date: `${year}-${month}-13`,
      paymentMethod: 'card',
    },
  ];
};

export const getSeedBudgets = (): CategoryBudget[] => {
  return CATEGORIES.map((c) => ({
    categoryId: c.id,
    monthlyLimit: c.defaultLimit,
  }));
};

export const getSeedSettings = (): UserSettings => ({
  currencyCode: 'SAR',
  currencySymbol: 'ر.س',
  monthlyBudgetGoal: 10000,
  payoffStrategy: 'snowball',
});

// Getter / Storage Methods
export const getDebts = (): Debt[] => {
  try {
    const data = localStorage.getItem(DEBTS_KEY);
    if (!data) {
      const seeds = getSeedDebts();
      localStorage.setItem(DEBTS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(data);
  } catch (e) {
    return getSeedDebts();
  }
};

export const saveDebts = (debts: Debt[]) => {
  localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  notify();
};

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (!data) {
      const seeds = getSeedTransactions();
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(data);
  } catch (e) {
    return getSeedTransactions();
  }
};

export const saveTransactions = (txs: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  notify();
};

export const getBudgets = (): CategoryBudget[] => {
  try {
    const data = localStorage.getItem(BUDGETS_KEY);
    if (!data) {
      const seeds = getSeedBudgets();
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(data);
  } catch (e) {
    return getSeedBudgets();
  }
};

export const saveBudgets = (budgets: CategoryBudget[]) => {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  notify();
};

export const getSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      const seeds = getSeedSettings();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(data);
  } catch (e) {
    return getSeedSettings();
  }
};

export const saveSettings = (settings: UserSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  notify();
};

// CRUD Operations for Debt
export const addDebt = (debt: Omit<Debt, 'id' | 'paidAmount' | 'status' | 'payments'>) => {
  const debts = getDebts();
  const newDebt: Debt = {
    ...debt,
    id: 'debt_' + Date.now(),
    paidAmount: 0,
    status: 'pending',
    payments: [],
  };
  saveDebts([newDebt, ...debts]);
  return newDebt;
};

export const updateDebt = (updated: Debt) => {
  const debts = getDebts();
  const newDebts = debts.map((d) => (d.id === updated.id ? updated : d));
  saveDebts(newDebts);
};

export const deleteDebt = (id: string) => {
  const debts = getDebts();
  saveDebts(debts.filter((d) => d.id !== id));
};

export const recordDebtPayment = (
  debtId: string,
  amount: number,
  notes?: string,
  date?: string
) => {
  const debts = getDebts();
  const debt = debts.find((d) => d.id === debtId);
  if (!debt) return;

  const paymentDate = date || new Date().toISOString().split('T')[0];
  const newPayment: DebtPayment = {
    id: 'pay_' + Date.now(),
    debtId,
    amount,
    date: paymentDate,
    notes,
  };

  const updatedPayments = [...debt.payments, newPayment];
  const totalPaid = updatedPayments.reduce((acc, p) => acc + p.amount, 0);

  let newStatus: Debt['status'] = 'pending';
  if (totalPaid >= debt.totalAmount) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partial';
  }

  const updatedDebt: Debt = {
    ...debt,
    paidAmount: Math.min(totalPaid, debt.totalAmount),
    status: newStatus,
    payments: updatedPayments,
  };

  saveDebts(debts.map((d) => (d.id === debtId ? updatedDebt : d)));

  // Also auto-add a Transaction if paying an 'i_owe' debt
  if (debt.type === 'i_owe') {
    addTransaction({
      type: 'expense',
      amount,
      category: 'debt',
      title: `سداد دين: ${debt.personName}`,
      date: paymentDate,
      paymentMethod: 'bank_transfer',
      notes: notes || `سداد جزئي للدين رقم ${debt.id}`,
    });
  } else if (debt.type === 'owed_to_me') {
    addTransaction({
      type: 'income',
      amount,
      category: 'debt',
      title: `تحصيل دين من: ${debt.personName}`,
      date: paymentDate,
      paymentMethod: 'bank_transfer',
      notes: notes || `استلام جزء من الدين`,
    });
  }
};

// CRUD Operations for Transactions
export const addTransaction = (tx: Omit<Transaction, 'id'>) => {
  const txs = getTransactions();
  const newTx: Transaction = {
    ...tx,
    id: 'tx_' + Date.now(),
  };
  saveTransactions([newTx, ...txs]);
  return newTx;
};

export const deleteTransaction = (id: string) => {
  const txs = getTransactions();
  saveTransactions(txs.filter((t) => t.id !== id));
};

// Reset / Demo Data Reload
export const reloadDemoData = () => {
  localStorage.setItem(DEBTS_KEY, JSON.stringify(getSeedDebts()));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(getSeedTransactions()));
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(getSeedBudgets()));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(getSeedSettings()));
  notify();
};

export const clearAllData = () => {
  localStorage.setItem(DEBTS_KEY, JSON.stringify([]));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  notify();
};

// Data Backup & Export
export const exportDataJSON = () => {
  const backup = {
    debts: getDebts(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debt_and_expenses_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportTransactionsCSV = (transactions: Transaction[], currencySymbol: string) => {
  const headers = ['التاريخ', 'النوع', 'العنوان', 'المبلغ', 'الفئة', 'طريقة الدفع', 'ملاحظات'];
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'expense' ? 'مصروف' : 'دخل',
    `"${t.title.replace(/"/g, '""')}"`,
    t.amount,
    t.category,
    t.paymentMethod,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `تقرير_المصاريف_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
