import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';
import { Debt, UserSettings } from '../types';
import { formatMoney } from '../utils/currencies';
import { recordDebtPayment } from '../utils/storage';

interface PayDebtModalProps {
  debt: Debt | null;
  onClose: () => void;
  settings: UserSettings;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({ debt, onClose, settings }) => {
  if (!debt) return null;

  const remainingAmount = debt.totalAmount - debt.paidAmount;

  const [paymentAmount, setPaymentAmount] = useState<string>(remainingAmount.toString());
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('دفعة تسوية مسددة');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      alert('يرجى إدخال مبلغ سداد صحيح.');
      return;
    }

    recordDebtPayment(debt.id, amt, notes.trim() || undefined, paymentDate);
    onClose();
  };

  const setQuickFullPay = () => {
    setPaymentAmount(remainingAmount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>تسجيل سداد دين ({debt.personName})</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debt Info */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">إجمالي الدين:</span>
            <span className="font-bold">{formatMoney(debt.totalAmount, settings.currencySymbol)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">المسدد سابقاً:</span>
            <span className="font-bold text-emerald-600">
              {formatMoney(debt.paidAmount, settings.currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="font-bold text-slate-800">المبلغ المتبقي الآن:</span>
            <span className="font-bold text-amber-600 text-sm">
              {formatMoney(remainingAmount, settings.currencySymbol)}
            </span>
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">مبلغ هذه الدفعة *</label>
              <button
                type="button"
                onClick={setQuickFullPay}
                className="text-[11px] text-emerald-600 hover:underline font-bold flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>سداد المتبقي كاملاً</span>
              </button>
            </div>
            <input
              type="number"
              step="any"
              max={remainingAmount * 1.5}
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السداد</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظة السداد</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تحويل بنكي عبر الراجحي"
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
            >
              تأكيد السداد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
