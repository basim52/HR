import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  PieChart as PieIcon,
  BarChart2,
  Printer,
  Calendar,
  CheckCircle2,
  Coins,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Debt, Transaction, CategoryBudget, UserSettings } from '../types';
import { formatMoney } from '../utils/currencies';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { exportTransactionsCSV } from '../utils/storage';

interface FinancialReportsProps {
  currentMonth: string;
  debts: Debt[];
  transactions: Transaction[];
  budgets: CategoryBudget[];
  settings: UserSettings;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  currentMonth,
  debts,
  transactions,
  budgets,
  settings,
}) => {
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>(currentMonth);

  // Month transactions
  const monthTxs = transactions.filter((t) => t.date.startsWith(selectedReportMonth));

  const totalIncome = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  // Prepare Pie Chart Data: Expense Category Breakdown
  const categorySpendingMap: Record<string, number> = {};
  monthTxs
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + t.amount;
    });

  const pieChartData = Object.entries(categorySpendingMap).map(([catId, amount]) => {
    const cat = getCategoryById(catId);
    return {
      name: cat.name,
      value: amount,
      color: cat.color,
    };
  });

  // Prepare Cash Flow Bar Chart Data (Comparison across months)
  const getPastSixMonthsData = () => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('ar-SA', { month: 'short' });

      const txs = transactions.filter((t) => t.date.startsWith(mKey));
      const inc = txs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

      data.push({
        month: label,
        دخل: inc,
        مصاريف: exp,
        صافي: inc - exp,
      });
    }
    return data;
  };

  const cashFlowChartData = getPastSixMonthsData();

  // Debt Breakdown
  const totalDebtsOwedToMe = debts
    .filter((d) => d.type === 'owed_to_me')
    .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const totalDebtsIOwe = debts
    .filter((d) => d.type === 'i_owe')
    .reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      // 1. Generate PNG data url with html-to-image
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
        pixelRatio: 2,
        fontEmbedCSS: '',
        skipFonts: true,
      });

      // 2. Load into HTML Image
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 3. Create square canvas based on max dimension + padding
      const padding = 40; // extra padding around the square
      const maxDim = Math.max(img.width, img.height) + padding * 2;
      const canvas = document.createElement('canvas');
      canvas.width = maxDim;
      canvas.height = maxDim;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Fill background color
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, maxDim, maxDim);

        // Draw image centered in the square canvas
        const offsetX = (maxDim - img.width) / 2;
        const offsetY = (maxDim - img.height) / 2;
        ctx.drawImage(img, offsetX, offsetY);
      }

      // 4. Download final square image
      const squareDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `تقرير_مالي_مربع_${selectedReportMonth}.png`;
      link.href = squareDataUrl;
      link.click();
    } catch (err) {
      console.error('Export image error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-indigo-600" />
            <span>التقارير والتحليلات المالية الدقيقة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            رسومات بيانية دقيقة لتوزيع المصاريف والتدفق النقدي مع خيارات الطباعة والتصدير كصورة
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-medium px-4 py-2.5 rounded-lg shadow-xs transition text-xs sm:text-sm disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <ImageIcon className="w-4 h-4 text-indigo-600" />
            )}
            <span>{isExporting ? 'جاري إنشاء الصورة...' : 'تصدير كصورة'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-xs sm:text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير PDF</span>
          </button>
        </div>
      </div>

      {/* Exportable Report Content Wrapper */}
      <div ref={reportRef} className="space-y-6 bg-slate-50/50 p-2 sm:p-4 rounded-2xl">
        {/* Report Filter & Month Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-base">تقرير شهر ({selectedReportMonth})</h3>
            <p className="text-xs text-slate-400">بيانات دقيقة موثقة للعمليات المالية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">اختر شهر التقرير:</span>
          <input
            type="month"
            value={selectedReportMonth}
            onChange={(e) => setSelectedReportMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* Key Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-card">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي الدخل المحصل</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">
            {formatMoney(totalIncome, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي المصاريف المُنَفَذة</span>
          <span className="text-xl font-bold text-rose-600 mt-1 block">
            {formatMoney(totalExpenses, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي الديون القائمة عليك</span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">
            {formatMoney(totalDebtsIOwe, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي الديون التي لك مع الآخرين</span>
          <span className="text-xl font-bold text-teal-600 mt-1 block">
            {formatMoney(totalDebtsOwedToMe, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Input-based Deterministic Analytics Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print-card">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <span>المؤشرات المالية الحسابية بناءً على السجلات المدخلة</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">معدل الفائض/الادخار من الدخل</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {totalIncome > 0 ? `${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}%` : '0%'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalIncome - totalExpenses >= 0 ? 'فائض مالي إيجابي قابل للادخار أو السداد' : 'عجز مالي يتطلب الحد من المصاريف'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">نسبة استهلاك المصاريف من الدخل</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {totalIncome > 0 ? `${Math.round((totalExpenses / totalIncome) * 100)}%` : '0%'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              مجموع الإنفاق الفعلي مقسوماً على الدخل الكلي المدخل
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">أعلى فئة إنفاق مسجلة</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block truncate">
              {pieChartData.length > 0
                ? [...pieChartData].sort((a, b) => b.value - a.value)[0].name
                : 'لا توجد مصاريف'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {pieChartData.length > 0
                ? formatMoney([...pieChartData].sort((a, b) => b.value - a.value)[0].value, settings.currencySymbol)
                : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Expenses by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print-card">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            <span>توزيع المصاريف حسب الفئات الرسمية</span>
          </h3>

          {pieChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              لا توجد مصاريف مسجلة لشهر التقرير الحالي.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatMoney(Number(value), settings.currencySymbol)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Six Month Cash Flow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print-card">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>مقارنة التدفق النقدي (الدخل vs المصاريف) لآخر 6 أشهر</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => formatMoney(Number(value), settings.currencySymbol)}
                />
                <Legend />
                <Bar dataKey="دخل" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="مصاريف" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High Precision Financial Report Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print-card">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-slate-700" />
          <span>جدول التفاصيل المالية الدقيقة لشهر ({selectedReportMonth})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">الفئة المالية</th>
                <th className="p-3">نوع العملية</th>
                <th className="p-3">إجمالي القيمة</th>
                <th className="p-3">نسبة المساهمة من الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(categorySpendingMap).map(([catId, amount]) => {
                const cat = getCategoryById(catId);
                const pct =
                  totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;

                return (
                  <tr key={catId} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{cat.name}</td>
                    <td className="p-3">
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        مصروف
                      </span>
                    </td>
                    <td className="p-3 font-bold">{formatMoney(amount, settings.currencySymbol)}</td>
                    <td className="p-3">{pct}%</td>
                  </tr>
                );
              })}

              {totalIncome > 0 && (
                <tr className="bg-emerald-50/50 hover:bg-emerald-50">
                  <td className="p-3 font-bold text-emerald-950">إجمالي مدخولات الشهر</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      دخل
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-700">
                    {formatMoney(totalIncome, settings.currencySymbol)}
                  </td>
                  <td className="p-3">100%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
