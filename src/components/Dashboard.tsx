import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  PlusCircle,
  Coins,
  Sparkles,
  ChevronLeft,
  Calendar,
  Clock,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { Debt, Transaction, CategoryBudget, UserSettings } from '../types';
import { formatMoney } from '../utils/currencies';
import { CATEGORIES, getCategoryById } from '../data/categories';

interface DashboardProps {
  currentMonth: string;
  debts: Debt[];
  transactions: Transaction[];
  budgets: CategoryBudget[];
  settings: UserSettings;
  onNavigateTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenPayDebtModal: (debt: Debt) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentMonth,
  debts,
  transactions,
  budgets,
  settings,
  onNavigateTab,
  onOpenAddModal,
  onOpenPayDebtModal,
}) => {
  // Filter month's transactions
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));

  const totalIncome = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Debts statistics
  const debtsOwedToMe = debts.filter((d) => d.type === 'owed_to_me');
  const debtsIOwe = debts.filter((d) => d.type === 'i_owe');

  const totalOwedToMeRemaining = debtsOwedToMe.reduce(
    (acc, d) => acc + (d.totalAmount - d.paidAmount),
    0
  );
  const totalIOweRemaining = debtsIOwe.reduce(
    (acc, d) => acc + (d.totalAmount - d.paidAmount),
    0
  );

  const netDebtBalance = totalOwedToMeRemaining - totalIOweRemaining;

  // Urgent overdue or due soon debts (due within 10 days or overdue)
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentDebts = debts.filter((d) => {
    if (d.status === 'paid') return false;
    const isOverdue = d.dueDate < todayStr;
    const isDueSoon =
      d.dueDate >= todayStr &&
      new Date(d.dueDate).getTime() - new Date(todayStr).getTime() <= 10 * 86400000;
    return isOverdue || isDueSoon;
  });

  // Calculate Health Score (0 - 100)
  let healthScore = 75;
  if (totalIncome > 0) {
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio < 0.5) healthScore += 15;
    else if (expenseRatio > 0.9) healthScore -= 20;

    const debtRatio = totalIOweRemaining / totalIncome;
    if (debtRatio > 3) healthScore -= 25;
    else if (debtRatio < 1) healthScore += 10;
  }
  healthScore = Math.max(10, Math.min(100, healthScore));

  const getHealthBadge = (score: number) => {
    if (score >= 80)
      return { text: 'ممتاز وفائض آمن', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 60)
      return { text: 'مستقر ومتوازن', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 40)
      return { text: 'يحتاج انتباه حذر', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: 'تنبيه: ضغط ديون ومصاريف', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const healthBadge = getHealthBadge(healthScore);

  // Group month expenses by category
  const categorySpendingMap: Record<string, number> = {};
  monthTxs
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + t.amount;
    });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-medium">
              الشهر المحدد: {currentMonth}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${healthBadge.bg}`}>
              {healthBadge.text}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            ملخص الحالة المالية والديون
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            متابعة دقيقة لحركة الأموال، سداد الديون المستحقة، وضبط الميزانية بدقة احترافية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm text-xs sm:text-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.2]" />
            <span>+ إضافة مصروف / دين</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-lg text-xs sm:text-sm transition"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>استعراض التقارير</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الدخل الشهري</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatMoney(totalIncome, settings.currencySymbol)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>مدخولات هذا الشهر</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي المصاريف</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatMoney(totalExpenses, settings.currencySymbol)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>مصاريف هذا الشهر</span>
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </div>

        {/* Debts Owed To Me Card */}
        <div
          onClick={() => onNavigateTab('debts')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ديون لك (تطالب بها)</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatMoney(totalOwedToMeRemaining, settings.currencySymbol)}
            </div>
            <p className="text-xs text-teal-600 font-medium mt-1 flex items-center gap-1">
              <span>{debtsOwedToMe.length} شخص مدين لك</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500"></div>
        </div>

        {/* Debts I Owe Card */}
        <div
          onClick={() => onNavigateTab('debts')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ديون عليك (مطلوب سدادها)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatMoney(totalIOweRemaining, settings.currencySymbol)}
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <span>{debtsIOwe.length} جهات تطلبك</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>
      </div>

      {/* Net Cash Flow & Debt Net Impact Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Flow summary card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>الصافي النقدي هذا الشهر</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {currentMonth}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">إجمالي الفائض / العجز النقدي:</span>
                <span
                  className={`font-bold ${
                    netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatMoney(netCashFlow, settings.currencySymbol)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">صافي ميزان الديون (لك - عليك):</span>
                <span
                  className={`font-bold ${
                    netDebtBalance >= 0 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {formatMoney(netDebtBalance, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-slate-500 font-medium">مؤشر الانضباط المالي</span>
              <span className="font-bold text-slate-700">{healthScore}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  healthScore >= 70
                    ? 'bg-emerald-500'
                    : healthScore >= 40
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Urgent Debt Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>تنبيهات الاستحقاقات القريبة والديون المعلقة</span>
            </h3>
            <button
              onClick={() => onNavigateTab('debts')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
            >
              <span>عرض كل الديون ({debts.length})</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            {urgentDebts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">لا توجد ديون مستحقة عاجلة هذا الأسبوع!</p>
                <p className="text-xs text-slate-400 mt-1">
                  جميع الديون مسددة أو تاريخ استحقاقها أبعد من 10 أيام.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentDebts.slice(0, 3).map((d) => {
                  const remaining = d.totalAmount - d.paidAmount;
                  const isIowe = d.type === 'i_owe';
                  const isOverdue = d.dueDate < todayStr;

                  return (
                    <div
                      key={d.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isOverdue
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                          : 'bg-amber-50/80 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{d.personName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isIowe
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-teal-200 text-teal-800'
                            }`}
                          >
                            {isIowe ? 'دين عليك' : 'دين لك'}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              متأخر!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>تاريخ الاستحقاق: {d.dueDate}</span>
                          {d.notes && <span>• {d.notes}</span>}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-slate-500 block">المتبقي:</span>
                          <span className="font-bold text-sm text-slate-900">
                            {formatMoney(remaining, settings.currencySymbol)}
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenPayDebtModal(d)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition"
                        >
                          تسجيل سداد
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Budgets vs Spending Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>استهلاك الميزانيات الشهرية حسب الفئات</span>
            </h3>
            <p className="text-xs text-slate-500">مراقبة الحدود المالية المحددة لكل فئة لتجنب العجز</p>
          </div>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>تفاصيل المصاريف</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {CATEGORIES.filter((c) => c.type === 'expense' || c.type === 'both').map((cat) => {
            const spent = categorySpendingMap[cat.id] || 0;
            const budgetItem = budgets.find((b) => b.categoryId === cat.id);
            const limit = budgetItem ? budgetItem.monthlyLimit : cat.defaultLimit;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

            const isExceeded = pct > 100;
            const isWarning = pct >= 80 && pct <= 100;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
                  <span>المصروف: {formatMoney(spent, settings.currencySymbol)}</span>
                  <span>الحد: {formatMoney(limit, settings.currencySymbol)}</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>آخر المعاملات المسجلة لشهر ({currentMonth})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>إدارة جميع المعاملات ({monthTxs.length})</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4">
          {monthTxs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl">
              لم تسجل أي معاملات هذا الشهر حتى الآن.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {monthTxs.slice(0, 5).map((tx) => {
                const catDef = getCategoryById(tx.category);
                const isExpense = tx.type === 'expense';

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${catDef.bgLight}`}
                      >
                        {isExpense ? '-' : '+'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{tx.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{catDef.name}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span
                        className={`font-bold text-sm ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatMoney(tx.amount, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input-based Financial Reports Summary Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold">تقارير حسابية دقيقة ومباشرة</h3>
          </div>
          <p className="text-slate-300 text-sm opacity-90">
            تتم معالجة واحتساب كافة مؤشرات الديون، المصاريف، الميزانيات ونسب التسوية بدقة فائقة بناءً على السجلات والبيانات المدخلة من قبلك فقط.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('reports')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shrink-0"
        >
          عرض التقارير التفصيلية
        </button>
      </div>
    </div>
  );
};
