import React, { useState } from 'react';
import { X, Settings, Download, Upload, RefreshCw, Trash2, Save, Coins } from 'lucide-react';
import { CategoryBudget, UserSettings } from '../types';
import { CURRENCIES } from '../utils/currencies';
import { CATEGORIES } from '../data/categories';
import {
  saveSettings,
  saveBudgets,
  exportDataJSON,
  reloadDemoData,
  clearAllData,
} from '../utils/storage';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  budgets: CategoryBudget[];
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  budgets,
}) => {
  if (!isOpen) return null;

  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  const [budgetMap, setBudgetMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    budgets.forEach((b) => {
      map[b.categoryId] = b.monthlyLimit;
    });
    return map;
  });

  const handleSave = () => {
    const curr = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

    saveSettings({
      ...settings,
      currencyCode: curr.code,
      currencySymbol: curr.symbol,
    });

    const newBudgets: CategoryBudget[] = Object.entries(budgetMap).map(([categoryId, monthlyLimit]) => ({
      categoryId,
      monthlyLimit: Number(monthlyLimit) || 0,
    }));

    saveBudgets(newBudgets);
    onClose();
  };

  const handleBudgetChange = (catId: string, val: string) => {
    setBudgetMap((prev) => ({
      ...prev,
      [catId]: parseFloat(val) || 0,
    }));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (json.debts && json.transactions) {
          localStorage.setItem('debt_app_debts_v1', JSON.stringify(json.debts));
          localStorage.setItem('debt_app_transactions_v1', JSON.stringify(json.transactions));
          if (json.budgets) localStorage.setItem('debt_app_budgets_v1', JSON.stringify(json.budgets));
          if (json.settings) localStorage.setItem('debt_app_settings_v1', JSON.stringify(json.settings));
          alert('تم استعادة النسخة الاحتياطية بنجاح!');
          window.location.reload();
        } else {
          alert('الملف المرفوع لا يحتوي على التنسيق الصحيح للبيانات.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <span>إعدادات التطبيق والميزانيات الشهرية</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            اختيار عملة الحساب والتطبيق:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrencyCode(c.code)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                  currencyCode === c.code
                    ? 'bg-slate-900 text-white border-slate-900 shadow'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Limits */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>تحديد حدود الميزانيات الشهرية لكل فئة:</span>
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto p-1">
            {CATEGORIES.filter((c) => c.type === 'expense' || c.type === 'both').map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs"
              >
                <span className="font-bold text-slate-800">{cat.name}</span>
                <div className="flex items-center gap-1 w-32">
                  <input
                    type="number"
                    value={budgetMap[cat.id] ?? cat.defaultLimit}
                    onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup & Data Actions */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-800">إدارة النسخ الاحتياطية والبيانات:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={exportDataJSON}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نسخة JSON</span>
            </button>

            <label className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>استعادة نسخة JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('هل تريد إعادة تعيين البيانات التجريبية الشاملة؟')) {
                  reloadDemoData();
                  onClose();
                }
              }}
              className="flex-1 p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>استعادة البيانات التجريبية</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('هل تريد مسح كافة البيانات المسجلة نهائياً؟')) {
                  clearAllData();
                  onClose();
                }
              }}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
              title="مسح الكل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
