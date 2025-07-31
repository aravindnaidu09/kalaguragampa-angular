export interface CountryOption {
  label: string;
  value: string; // Currency code (e.g., INR)
  symbol: string; // Currency symbol (e.g., ₹)
  countryCode: string; // Phone code (e.g., +91)
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { label: 'Australia', value: 'AUD', symbol: 'A$', countryCode: '+61' },
  { label: 'Canada', value: 'CAD', symbol: 'C$', countryCode: '+1' },
  { label: 'Europe', value: 'EUR', symbol: '€', countryCode: '+43' }, // You may use a general EU code or country-specific like Austria
  { label: 'India', value: 'INR', symbol: '₹', countryCode: '+91' },
  { label: 'UK', value: 'GBP', symbol: '£', countryCode: '+44' },
  { label: 'USA', value: 'USD', symbol: '$', countryCode: '+1' },
  { label: 'Singapore', value: 'SGD', symbol: 'S$', countryCode: '+65' },
];

