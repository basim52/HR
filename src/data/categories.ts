export interface CategoryDef {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'both';
  icon: string;
  color: string;
  bgLight: string;
  defaultLimit: number;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'food',
    name: 'الطعام والمشروبات',
    type: 'expense',
    icon: 'Utensils',
    color: '#ef4444',
    bgLight: 'bg-red-50 text-red-600 border-red-200',
    defaultLimit: 1500,
  },
  {
    id: 'housing',
    name: 'السكن والإيجار',
    type: 'expense',
    icon: 'Home',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 text-blue-600 border-blue-200',
    defaultLimit: 3000,
  },
  {
    id: 'bills',
    name: 'الفواتير والخدمات',
    type: 'expense',
    icon: 'Zap',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 text-amber-600 border-amber-200',
    defaultLimit: 800,
  },
  {
    id: 'transport',
    name: 'المواصلات والوقود',
    type: 'expense',
    icon: 'Car',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    defaultLimit: 1000,
  },
  {
    id: 'health',
    name: 'الصحة والأدوية',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ec4899',
    bgLight: 'bg-pink-50 text-pink-600 border-pink-200',
    defaultLimit: 500,
  },
  {
    id: 'shopping',
    name: 'التسوق والملابس',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 text-purple-600 border-purple-200',
    defaultLimit: 1200,
  },
  {
    id: 'entertainment',
    name: 'الترفيه والرحلات',
    type: 'expense',
    icon: 'Tv',
    color: '#06b6d4',
    bgLight: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    defaultLimit: 700,
  },
  {
    id: 'education',
    name: 'التعليم والدورات',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#6366f1',
    bgLight: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    defaultLimit: 1000,
  },
  {
    id: 'salary',
    name: 'الراتب الشهري',
    type: 'income',
    icon: 'Wallet',
    color: '#10b981',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultLimit: 0,
  },
  {
    id: 'investment',
    name: 'الأرباح والاستثمارات',
    type: 'income',
    icon: 'TrendingUp',
    color: '#059669',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    defaultLimit: 0,
  },
  {
    id: 'debt',
    name: 'سداد واسترداد الديون',
    type: 'both',
    icon: 'HandCoins',
    color: '#d97706',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    defaultLimit: 0,
  },
  {
    id: 'other',
    name: 'مصاريف أخرى',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b',
    bgLight: 'bg-slate-50 text-slate-600 border-slate-200',
    defaultLimit: 500,
  },
];

export const getCategoryById = (id: string): CategoryDef => {
  return (
    CATEGORIES.find((c) => c.id === id) || {
      id: 'other',
      name: 'غير مصنف',
      type: 'expense',
      icon: 'MoreHorizontal',
      color: '#64748b',
      bgLight: 'bg-slate-50 text-slate-600 border-slate-200',
      defaultLimit: 500,
    }
  );
};
