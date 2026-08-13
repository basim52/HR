import React from 'react';
import {
  Wallet,
  Calendar,
  Settings,
  PlusCircle,
  Plus,
  Sparkles,
  RefreshCw,
  Coins,
  FileSpreadsheet,
  BarChart3,
} from 'lucide-react';
import { UserSettings } from '../types';
import { CURRENCIES } from '../utils/currencies';

interface NavbarProps {
  currentMonth: string; // YYYY-MM
  setCurrentMonth: (month: string) => void;
  settings: UserSettings;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onReloadDemo: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  setCurrentMonth,
  settings,
  onOpenAddModal,
  onOpenSettings,
  onReloadDemo,
  activeTab,
  setActiveTab,
}) => {
  // Generate last 12 months for picker
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const val = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  };

  const currentCurrency =
    CURRENCIES.find((c) => c.code === settings.currencyCode) || CURRENCIES[0];

  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-2.5 sm:py-3 gap-2">
            {/* Brand Logo & Name */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shadow-indigo-950/40">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  إدارة الديون والمصاريف
                  <span className="text-[10px] sm:text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                    الاحترافي
                  </span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400">تتبع دقيق وتخطيط مالي متكامل</p>
              </div>
            </div>

            {/* Header Controls: Month Selector + Currency + Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Month Picker */}
              <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700/80 px-2 py-1.5 text-xs text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:ring-0 cursor-pointer outline-none font-medium max-w-[110px] sm:max-w-none truncate"
                >
                  {getMonthOptions().map((m) => (
                    <option key={m.val} value={m.val} className="bg-slate-900 text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Indicator */}
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700/80 rounded-lg border border-slate-700/80 px-2 py-1.5 text-xs text-slate-200 transition min-h-[36px]"
                title="تغيير العملة والميزانية"
              >
                <span>{currentCurrency.flag}</span>
                <span className="font-semibold">{currentCurrency.symbol}</span>
              </button>

              {/* Demo Reset */}
              <button
                onClick={onReloadDemo}
                className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs transition"
                title="إعادة تحميل البيانات التجريبية"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>بيانات تجريبية</span>
              </button>

              {/* Settings */}
              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="الإعدادات والميزانيات"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Desktop Add Entry Button */}
              <button
                onClick={onOpenAddModal}
                className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs shadow-sm transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.2]" />
                <span>إضافة معاملة / دين</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 space-x-reverse overflow-x-auto py-2 border-t border-slate-800/80 text-xs sm:text-sm font-medium scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>لوحة التحكم</span>
            </button>

            <button
              onClick={() => setActiveTab('debts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'debts'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>إدارة الديون</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'expenses'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>المصاريف والدخل</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>التقارير الدقيقة</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (App-like thumb bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 text-slate-400 no-print px-1 py-1 shadow-2xl">
        <div className="flex items-center justify-around relative max-w-md mx-auto">
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">الرئيسية</span>
          </button>

          {/* Debts */}
          <button
            onClick={() => setActiveTab('debts')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'debts' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Coins className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">الديون</span>
          </button>

          {/* Central Floating Action Button (Add Transaction) */}
          <button
            onClick={onOpenAddModal}
            className="-mt-5 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg shadow-indigo-900/50 border-4 border-slate-900 flex items-center justify-center transition active:scale-90"
            title="إضافة جديد"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>

          {/* Expenses */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'expenses' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">المصاريف</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition ${
              activeTab === 'reports' ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">التقارير</span>
          </button>
        </div>
      </nav>
    </>
  );
};

