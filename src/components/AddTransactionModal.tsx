import React, { useState } from 'react';
import { X, Plus, Coins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { DebtType, TransactionType, UserSettings } from '../types';
import { CATEGORIES } from '../data/categories';
import { addTransaction, addDebt } from '../utils/storage';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'expense' | 'income' | 'debt';
  defaultDebtType?: DebtType;
  settings: UserSettings;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'expense',
  defaultDebtType = 'i_owe',
  settings,
}) => {
  const [mode, setMode] = useState<'expense' | 'income' | 'debt'>(defaultMode);

  // Form Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('card');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Debt fields
  const [debtType, setDebtType] = useState<DebtType>(defaultDebtType);
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح ألكبر من الصفر.');
      return;
    }

    if (mode === 'expense' || mode === 'income') {
      if (!title.trim()) {
        alert('يرجى كتابة عنوان المعاملة.');
        return;
      }

      addTransaction({
        type: mode,
        amount: numericAmount,
        category,
        title: title.trim(),
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else if (mode === 'debt') {
      if (!personName.trim()) {
        alert('يرجى إدخال اسم الشخص أو الجهة المعنية بالدين.');
        return;
      }

      addDebt({
        type: debtType,
        personName: personName.trim(),
        personPhone: personPhone.trim() || undefined,
        totalAmount: numericAmount,
        dueDate,
        createdDate: date,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <span>إضافة عملية مالية أو دين جديد</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'expense'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>مصروف</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('income')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'income'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>دخل</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('debt')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'debt'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>دين جديد</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'debt' ? (
            <>
              {/* Debt Type Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDebtType('i_owe')}
                  className={`py-2 rounded-lg font-bold transition ${
                    debtType === 'i_owe'
                      ? 'bg-amber-500 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  دين عليك (مطلوب منك سداده)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('owed_to_me')}
                  className={`py-2 rounded-lg font-bold transition ${
                    debtType === 'owed_to_me'
                      ? 'bg-teal-500 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  دين لك (تطالب به أحدهم)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشخص أو الجهة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة الكهرباء / أحمد العتيبي"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف (اختياري للواتساب)
                </label>
                <input
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={personPhone}
                  onChange={(e) => setPersonPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الاستحقاق النهائي *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مسمى المعاملة *
                </label>
                <input
                  type="text"
                  required
                  placeholder={mode === 'expense' ? 'مثال: مشتريات سوبرماركت' : 'مثال: مكافأة عمل'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المالية</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="card">بطاقة إئتمان / مدى</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="cash">نقداً</option>
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المبلغ ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المعاملة</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات توثيقية</label>
            <input
              type="text"
              placeholder="تفاصيل إضافية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition"
            >
              حفظ السجل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
