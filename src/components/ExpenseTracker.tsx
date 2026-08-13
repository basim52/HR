import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Transaction, TransactionType, CategoryBudget, UserSettings } from '../types';
import { formatMoney } from '../utils/currencies';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { deleteTransaction } from '../utils/storage';

interface ExpenseTrackerProps {
  currentMonth: string;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  settings: UserSettings;
  onOpenAddModal: (type?: TransactionType) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  currentMonth,
  transactions,
  budgets,
  settings,
  onOpenAddModal,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter transactions
  const filteredTxs = transactions.filter((t) => {
    if (!t.date.startsWith(currentMonth)) return false;

    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = (t.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }

    return true;
  });

  // Calculate totals for month
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const monthIncome = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const monthExpenses = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleDeleteTx = (id: string, title: string) => {
    if (confirm(`هل أنت تأكد من حذف المعاملة: (${title})؟`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>تتبع المصاريف والدخل الشهري</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل كافة تدفقاتك النقدية الشهرية، صنف المصروفات، وراقب ميزانيتك أولاً بأول
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>+ إضافة مصروف</span>
          </button>
          <button
            onClick={() => onOpenAddModal('income')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>+ إضافة دخل</span>
          </button>
        </div>
      </div>

      {/* Month Totals Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 font-semibold block">دخل الشهر الحالي</span>
            <span className="text-xl font-bold text-emerald-950 mt-1 block">
              {formatMoney(monthIncome, settings.currencySymbol)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-800 font-semibold block">مصاريف الشهر الحالي</span>
            <span className="text-xl font-bold text-rose-950 mt-1 block">
              {formatMoney(monthExpenses, settings.currencySymbol)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-200/60 text-rose-800 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">الصافي المتبقي</span>
            <span
              className={`text-xl font-bold mt-1 block ${
                monthIncome - monthExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatMoney(monthIncome - monthExpenses, settings.currencySymbol)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <span>📊</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالمسمى أو الملاحظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                typeFilter === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                typeFilter === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-slate-600'
              }`}
            >
              مصاريف
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                typeFilter === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600'
              }`}
            >
              دخل
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">جميع الفئات</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">لا توجد معاملات مسجلة تطابق التصفية</p>
            <p className="text-xs text-slate-400 mt-1">تأكد من اختيار الشهر الحالي الصحيح ({currentMonth})</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTxs.map((tx) => {
              const catDef = getCategoryById(tx.category);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${catDef.bgLight}`}
                    >
                      {isExpense ? '-' : '+'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{tx.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {catDef.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>
                          {tx.paymentMethod === 'bank_transfer'
                            ? 'تحويل بنكي'
                            : tx.paymentMethod === 'card'
                            ? 'بطاقة إئتمان/مدى'
                            : 'نقدي'}
                        </span>
                        {tx.notes && <span>• {tx.notes}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span
                        className={`text-base font-bold ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatMoney(tx.amount, settings.currencySymbol)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTx(tx.id, tx.title)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="حذف المعاملة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
