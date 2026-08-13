export type DebtType = 'owed_to_me' | 'i_owe'; // owed_to_me = دين لك / تطالب به | i_owe = دين عليك / مطلوب منك

export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  personPhone?: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  createdDate: string;
  status: DebtStatus;
  notes?: string;
  payments: DebtPayment[];
}

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
}

export interface CategoryBudget {
  categoryId: string;
  monthlyLimit: number;
}

export interface UserSettings {
  currencyCode: string;
  currencySymbol: string;
  monthlyBudgetGoal: number;
  payoffStrategy: 'snowball' | 'avalanche' | 'due_date';
}

export interface MonthFinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  totalDebtsOwedToMe: number;
  totalDebtsIOwe: number;
  totalDebtsOwedToMeRemaining: number;
  totalDebtsIOweRemaining: number;
  categoryExpenses: Record<string, number>;
}
