import React, { useState } from 'react';
import {
  Coins,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  MessageSquare,
  History,
  Trash2,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { Debt, DebtType, UserSettings } from '../types';
import { formatMoney } from '../utils/currencies';
import { deleteDebt } from '../utils/storage';

interface DebtManagerProps {
  debts: Debt[];
  settings: UserSettings;
  onOpenAddModal: (type?: DebtType) => void;
  onOpenPayDebtModal: (debt: Debt) => void;
}

export const DebtManager: React.FC<DebtManagerProps> = ({
  debts,
  settings,
  onOpenAddModal,
  onOpenPayDebtModal,
}) => {
  const [activeDebtType, setActiveDebtType] = useState<DebtType>('i_owe'); // Default to debts I owe
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter debts by type, search, and status
  const filteredDebts = debts.filter((d) => {
    if (d.type !== activeDebtType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.personName.toLowerCase().includes(q);
      const matchPhone = (d.personPhone || '').includes(q);
      const matchNotes = (d.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchNotes) return false;
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        if (d.status === 'paid' || d.dueDate >= todayStr) return false;
      } else if (d.status !== statusFilter) {
        return false;
      }
    }

    return true;
  });

  // Calculate totals for active type
  const typeDebts = debts.filter((d) => d.type === activeDebtType);
  const totalAmountSum = typeDebts.reduce((acc, d) => acc + d.totalAmount, 0);
  const totalPaidSum = typeDebts.reduce((acc, d) => acc + d.paidAmount, 0);
  const totalRemainingSum = totalAmountSum - totalPaidSum;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت تأكد من حذف سجل الدين الخاص بـ (${name})؟`)) {
      deleteDebt(id);
    }
  };

  const getStatusBadge = (d: Debt) => {
    if (d.status === 'paid') {
      return {
        text: 'مسدد بالكامل',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: CheckCircle2,
      };
    }
    if (d.dueDate < todayStr) {
      return {
        text: 'متأخر عن الموعد',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: AlertCircle,
      };
    }
    if (d.status === 'partial') {
      return {
        text: 'مدفوع جزئياً',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Clock,
      };
    }
    return {
      text: 'معلق بالكامل',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: Clock,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Coins className="w-6 h-6 text-indigo-600" />
            <span>إدارة الديون والتسويات المالية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل ومتابعة الديون المستحقة لك وللآخرين، وتوثيق دفعات التسوية بدقة
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal(activeDebtType)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>
            {activeDebtType === 'i_owe' ? '+ إضافة دين عليك جديد' : '+ إضافة دين لك جديد'}
          </span>
        </button>
      </div>

      {/* Main Category Tabs: i_owe vs owed_to_me */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveDebtType('i_owe')}
          className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between ${
            activeDebtType === 'i_owe'
              ? 'bg-amber-500/10 border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm sm:text-base">ديون عليك (تطالب بها الجهات)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
              {debts.filter((d) => d.type === 'i_owe').length} ديون
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">المال المطلوب منك سداده للآخرين</p>
          <div className="text-lg font-bold text-slate-900">
            متبقي:{' '}
            {formatMoney(
              debts
                .filter((d) => d.type === 'i_owe')
                .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0),
              settings.currencySymbol
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveDebtType('owed_to_me')}
          className={`p-4 rounded-2xl border text-right transition flex flex-col justify-between ${
            activeDebtType === 'owed_to_me'
              ? 'bg-teal-500/10 border-teal-500 text-teal-950 shadow-sm ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm sm:text-base">ديون لك (أنت تطالب بها)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {debts.filter((d) => d.type === 'owed_to_me').length} ديون
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">الأموال المعارة للأقارب أو الأصدقاء</p>
          <div className="text-lg font-bold text-slate-900">
            متبقي:{' '}
            {formatMoney(
              debts
                .filter((d) => d.type === 'owed_to_me')
                .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0),
              settings.currencySymbol
            )}
          </div>
        </button>
      </div>

      {/* Summary Metrics Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-xs text-slate-400 block">إجمالي المبلغ المطلوب:</span>
          <span className="text-base font-bold">
            {formatMoney(totalAmountSum, settings.currencySymbol)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">المبلغ المسدد بالفعل:</span>
          <span className="text-base font-bold text-emerald-400">
            {formatMoney(totalPaidSum, settings.currencySymbol)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">المبلغ المتبقي المطلوب:</span>
          <span className="text-base font-bold text-amber-400">
            {formatMoney(totalRemainingSum, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم الشخص أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'pending', 'partial', 'paid', 'overdue'].map((st) => {
            const labels: Record<string, string> = {
              all: 'الكل',
              pending: 'معلق',
              partial: 'مدفوع جزئياً',
              paid: 'مسدد بالكامل',
              overdue: 'متأخر',
            };
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Debt Cards List */}
      <div className="space-y-4">
        {filteredDebts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500">
            <Coins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-base text-slate-700">لا توجد ديون مسجلة تحت هذه التصفية</p>
            <p className="text-xs text-slate-400 mt-1">يمكنك إضافة دين جديد بالضغط على الزر أعلاه</p>
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const badge = getStatusBadge(debt);
            const BadgeIcon = badge.icon;
            const remaining = debt.totalAmount - debt.paidAmount;
            const pctPaid = Math.min(
              100,
              Math.round((debt.paidAmount / debt.totalAmount) * 100)
            );
            const isExpanded = expandedDebtId === debt.id;

            return (
              <div
                key={debt.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow transition p-5 space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{debt.personName}</h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.text}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>الاستحقاق: {debt.dueDate}</span>
                        </span>
                        {debt.personPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{debt.personPhone}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {debt.personPhone && (
                      <a
                        href={`https://wa.me/${debt.personPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="تواصل عبر واتساب"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">واتساب</span>
                      </a>
                    )}

                    {debt.status !== 'paid' && (
                      <button
                        onClick={() => onOpenPayDebtModal(debt)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center gap-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>سداد / دفع دفعة</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(debt.id, debt.personName)}
                      className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                      title="حذف الدين"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amounts Breakdown */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50/80 p-3 rounded-xl text-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">المبلغ الإجمالي</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatMoney(debt.totalAmount, settings.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">المسدد حتى الآن</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatMoney(debt.paidAmount, settings.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">المتبقي</span>
                    <span className="text-sm font-bold text-amber-600">
                      {formatMoney(remaining, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Payment Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
                    <span>نسبة الإنجاز في السداد</span>
                    <span className="font-bold text-slate-800">{pctPaid}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${pctPaid}%` }}
                    ></div>
                  </div>
                </div>

                {debt.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold">ملاحظات:</span> {debt.notes}
                  </p>
                )}

                {/* Payments History Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedDebtId(isExpanded ? null : debt.id)}
                    className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>سجل الدفعات والتسديدات الجزئية ({debt.payments.length})</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {debt.payments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">
                          لا توجد دفعات مسددة سابقة لهذا الدين.
                        </p>
                      ) : (
                        debt.payments.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800 block">
                                دفعة بقيمة {formatMoney(p.amount, settings.currencySymbol)}
                              </span>
                              <span className="text-slate-400 text-[10px]">{p.date}</span>
                            </div>
                            {p.notes && (
                              <span className="text-slate-500 italic max-w-xs truncate">
                                {p.notes}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
