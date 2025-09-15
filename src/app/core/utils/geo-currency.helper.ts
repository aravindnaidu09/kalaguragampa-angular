// Reusable helpers for country/currency alignment, shipping context, and Razorpay display fields.

export type CountryCode = 'IND' | 'USA' | 'UK' | 'AUS' | 'SGP' | 'CAN' | 'EUR' | string;
export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AUD' | 'SGD' | 'CAD' | string;

export interface AddressLike {
  id?: string;
  country_code?: string | null; // e.g., 'IND', 'India', 'IN'
  is_default?: boolean;
}

export interface RazorpayOrderLike {
  id: string;
  amount: number;              // subunits expected by Razorpay
  currency: string;            // 'INR' in our flow
  display_currency?: string;   // optional UI currency (e.g., 'AUD')
  display_amount?: number;     // amount in major units for display_currency
}

// --- Canonical mappings you can extend later ---
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IND: 'INR',
  USA: 'USD',
  UK:  'GBP',
  AUS: 'AUD',
  SGP: 'SGD',
  CAN: 'CAD',
  EUR: 'EUR'
};

export const CURRENCY_TO_COUNTRY: Record<string, CountryCode> = {
  INR: 'IND',
  USD: 'USA',
  GBP: 'UK',
  AUD: 'AUS',
  SGD: 'SGP',
  CAD: 'CAN',
  EUR: 'EUR'
};

// --- Normalizers (be forgiving with user/BE values) ---
export function normalizeCurrency(code?: string | null): CurrencyCode {
  if (!code) return 'INR';
  return code.toString().trim().toUpperCase() as CurrencyCode;
}

export function normalizeCountry(codeOrName?: string | null): CountryCode {
  if (!codeOrName) return 'IND';
  const t = codeOrName.toString().trim().toUpperCase();

  // Fast path common variants
  if (t === 'IN' || t === 'INDIA') return 'IND';
  if (t === 'US' || t === 'UNITED STATES' || t === 'UNITED STATES OF AMERICA') return 'USA';
  if (t === 'GB' || t === 'UK' || t === 'UNITED KINGDOM' || t === 'GREAT BRITAIN') return 'UK';
  if (t === 'AU' || t === 'AUS' || t === 'AUSTRALIA') return 'AUS';
  if (t === 'SG' || t === 'SGP' || t === 'SINGAPORE') return 'SGP';
  if (t === 'CA' || t === 'CAN' || t === 'CANADA') return 'CAN';
  if (t === 'EU' || t === 'EUR' || t === 'EUROPE' || t === 'EUROZONE') return 'EUR';

  return t as CountryCode; // fallback to whatever BE sends (already uppercased)
}

export function countryToCurrency(country: CountryCode): CurrencyCode {
  const c = normalizeCountry(country);
  return (COUNTRY_TO_CURRENCY[c] || 'INR') as CurrencyCode;
}

export function currencyToCountry(ccy: CurrencyCode): CountryCode {
  const c = normalizeCurrency(ccy);
  return (CURRENCY_TO_COUNTRY[c] || 'IND') as CountryCode;
}

// --- Core derivations used in components ---
export function getAddressCountry(address?: AddressLike | null): CountryCode {
  return normalizeCountry(address?.country_code || 'IND');
}

export function hasCountryCurrencyMismatch(addressCountry: CountryCode, uiCurrency: CurrencyCode): boolean {
  return normalizeCountry(addressCountry) !== currencyToCountry(uiCurrency);
}

/**
 * Build payload for your BE create-order API.
 * - Keeps all numbers in INR major units (as per your app rule).
 * - Uses addressCountry as the authoritative country_code.
 */
export function buildCreateOrderPayload(
  totalAmountInInr: number,
  addressId: string,
  addressCountry: CountryCode,
  extra?: Record<string, any>
) {
  return {
    total_amount: Number(totalAmountInInr || 0),
    address_id: addressId,
    courier_company_id: '0',
    country_code: normalizeCountry(addressCountry),
    currency: 'INR', // charge in INR; show display currency via Razorpay below
    ...(extra || {})
  };
}

/**
 * Add display currency fields for Razorpay checkout (visual only).
 * Pass a converter that converts INR major → target currency major (your CurrencyService).
 */
export function enhanceRazorpayDisplay(
  rpOrder: RazorpayOrderLike,
  cartTotalInInr: number,
  uiCurrency: CurrencyCode,
  convertInr: (inrAmount: number, toCode: CurrencyCode) => number
): RazorpayOrderLike {
  const ui = normalizeCurrency(uiCurrency);
  if (ui !== 'INR') {
    const displayAmount = convertInr(Number(cartTotalInInr || 0), ui);
    return { ...rpOrder, display_currency: ui, display_amount: displayAmount };
  }
  return rpOrder;
}

/**
 * Given all addresses, try to pick a default address in a target country.
 * Useful on Cart when user switches currency but you don't show address UI.
 */
export function pickDefaultAddressByCountry(
  addresses: AddressLike[] | undefined | null,
  targetCountry: CountryCode
): AddressLike | undefined {
  if (!addresses?.length) return undefined;
  const tgt = normalizeCountry(targetCountry);
  // default in target country
  const def = addresses.find(a => normalizeCountry(a.country_code) === tgt && !!a.is_default);
  if (def) return def;
  // any in target country
  return addresses.find(a => normalizeCountry(a.country_code) === tgt);
}

/**
 * Small helper to compute the current “shipping context” from
 * selected address + UI currency.
 */
export function deriveShippingContext(
  addresses: AddressLike[] | undefined | null,
  selectedAddressId: string | undefined | null,
  uiCurrency: CurrencyCode
) {
  const selected = addresses?.find(a => a.id === selectedAddressId);
  const addressCountry = getAddressCountry(selected);
  const currencyCountry = currencyToCountry(uiCurrency);
  const mismatch = addressCountry !== currencyCountry;
  return { selected, addressCountry, currencyCountry, mismatch };
}
