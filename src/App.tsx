/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DebtManager } from './components/DebtManager';
import { ExpenseTracker } from './components/ExpenseTracker';
import { FinancialReports } from './components/FinancialReports';
import { AddTransactionModal } from './components/AddTransactionModal';
import { PayDebtModal } from './components/PayDebtModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { Debt, Transaction, DebtType, TransactionType } from './types';
import {
  getDebts,
  getTransactions,
  getBudgets,
  getSettings,
  subscribeStorage,
  reloadDemoData,
} from './utils/storage';

export default function App() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States
  const [debts, setDebts] = useState<Debt[]>(getDebts);
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);
  const [budgets, setBudgets] = useState(getBudgets);
  const [settings, setSettings] = useState(getSettings);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultMode, setAddModalDefaultMode] = useState<'expense' | 'income' | 'debt'>('expense');
  const [addModalDebtType, setAddModalDebtType] = useState<DebtType>('i_owe');

  const [payDebtModalDebt, setPayDebtModalDebt] = useState<Debt | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Storage listener effect
  useEffect(() => {
    const unsub = subscribeStorage(() => {
      setDebts(getDebts());
      setTransactions(getTransactions());
      setBudgets(getBudgets());
      setSettings(getSettings());
    });
    return unsub;
  }, []);

  const handleOpenAddModal = (type?: TransactionType | 'debt', debtType?: DebtType) => {
    if (type === 'income' || type === 'expense') {
      setAddModalDefaultMode(type);
    } else if (type === 'debt') {
      setAddModalDefaultMode('debt');
      if (debtType) setAddModalDebtType(debtType);
    } else {
      setAddModalDefaultMode('expense');
    }
    setIsAddModalOpen(true);
  };

  const handleOpenPayDebtModal = (debt: Debt) => {
    setPayDebtModalDebt(debt);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Cairo',sans-serif]">
      {/* Navbar Header */}
      <Navbar
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        settings={settings}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReloadDemo={() => {
          if (confirm('هل ترغب في إعادة تحميل أحدث بيانات العرض التجريبية؟')) {
            reloadDemoData();
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentMonth={currentMonth}
            debts={debts}
            transactions={transactions}
            budgets={budgets}
            settings={settings}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAddModal={() => handleOpenAddModal()}
            onOpenPayDebtModal={handleOpenPayDebtModal}
          />
        )}

        {activeTab === 'debts' && (
          <DebtManager
            debts={debts}
            settings={settings}
            onOpenAddModal={(dType) => handleOpenAddModal('debt', dType)}
            onOpenPayDebtModal={handleOpenPayDebtModal}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker
            currentMonth={currentMonth}
            transactions={transactions}
            budgets={budgets}
            settings={settings}
            onOpenAddModal={(type) => handleOpenAddModal(type)}
          />
        )}

        {activeTab === 'reports' && (
          <FinancialReports
            currentMonth={currentMonth}
            debts={debts}
            transactions={transactions}
            budgets={budgets}
            settings={settings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4">
          نظام إدارة الديون والمصاريف الشهرية © {new Date().getFullYear()} — تقارير مالية دقيقة وتخطيط ذكي
        </div>
      </footer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultMode={addModalDefaultMode}
        defaultDebtType={addModalDebtType}
        settings={settings}
      />

      <PayDebtModal
        debt={payDebtModalDebt}
        onClose={() => setPayDebtModalDebt(null)}
        settings={settings}
      />

      <BudgetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        budgets={budgets}
      />
    </div>
  );
}
