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

// Seed Demo Data - Returns empty arrays for clean default state
export const getSeedDebts = (): Debt[] => [];

export const getSeedTransactions = (): Transaction[] => [];

export const getSeedBudgets = (): CategoryBudget[] => {
  return CATEGORIES.map((c) => ({
    categoryId: c.id,
    monthlyLimit: 0,
  }));
};

export const getSeedSettings = (): UserSettings => ({
  currencyCode: 'SAR',
  currencySymbol: 'ر.س',
  monthlyBudgetGoal: 0,
  payoffStrategy: 'snowball',
});

// Helper to ensure initial storage keys exist without overwriting user data
const ensureCleanInitialState = () => {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(DEBTS_KEY) === null) {
    localStorage.setItem(DEBTS_KEY, JSON.stringify([]));
  }
  if (localStorage.getItem(TRANSACTIONS_KEY) === null) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  }
  if (localStorage.getItem(BUDGETS_KEY) === null) {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(getSeedBudgets()));
  }
  if (localStorage.getItem(SETTINGS_KEY) === null) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(getSeedSettings()));
  }
};

// Getter / Storage Methods
export const getDebts = (): Debt[] => {
  try {
    ensureCleanInitialState();
    const data = localStorage.getItem(DEBTS_KEY);
    if (!data) {
      localStorage.setItem(DEBTS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveDebts = (debts: Debt[]) => {
  localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  notify();
};

export const getTransactions = (): Transaction[] => {
  try {
    ensureCleanInitialState();
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (!data) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveTransactions = (txs: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  notify();
};

export const getBudgets = (): CategoryBudget[] => {
  try {
    ensureCleanInitialState();
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
    ensureCleanInitialState();
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
    id: 'debt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
    id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
    paidAmount: totalPaid,
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
      notes: notes || `سداد للدين`,
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
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
