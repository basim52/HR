export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع', flag: '🇴🇲' },
  { code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع', flag: '🇮🇶' },
  { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ', flag: '🇯🇴' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'يورو أوروبي', symbol: '€', flag: '🇪🇺' },
];

export const formatMoney = (amount: number, symbol: string = 'ر.س'): string => {
  const formatted = new Intl.NumberFormat('ar-SA', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${symbol}`;
};
