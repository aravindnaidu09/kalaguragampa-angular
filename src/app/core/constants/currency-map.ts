// 📁 core/constants/currency-map.ts
export const COUNTRY_CURRENCY_MAP = {
    india: { symbol: '₹', code: 'INR', rate: 1 },
    australia: { symbol: 'A$', code: 'AUD', rate: 90 },
    usa: { symbol: '$', code: 'USD', rate: 83 },
    singapore: { symbol: 'S$', code: 'SGD', rate: 61 },
    canada: { symbol: 'C$', code: 'CAD', rate: 62 },
    uk: { symbol: '£', code: 'GBP', rate: 103 },
    europe: { symbol: '€', code: 'EUR', rate: 90 },
  };
  export type CountryKey = keyof typeof COUNTRY_CURRENCY_MAP;
