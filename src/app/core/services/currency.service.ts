// /core/services/currency.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { CURRENCY_LIST } from '../constants/currency-map';
import { FIXED_EXCHANGE_RATES } from '../constants/exchange-rates';

type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR' | 'AUD' | 'SGD' | 'CAD' | string;

const STORAGE_KEY = 'kg_currency';

const SYMBOLS: Record<string, string> = CURRENCY_LIST.reduce((acc, c) => {
  acc[c.code] = c.symbol;
  return acc;
}, {} as Record<string, string>);

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  /**
   * App shows prices in the user's selected currency,
   * but **all calculations remain in INR**.
   */
  private selectedCurrency = signal<CurrencyCode>('INR');
  private rates = signal<Record<string, number>>({ ...FIXED_EXCHANGE_RATES });
  private _lastUpdated = signal<string>(new Date().toISOString());

  // Public reactive reads
  currency = this.selectedCurrency.asReadonly();
  rateMap = this.rates.asReadonly();
  lastUpdated = this._lastUpdated.asReadonly();

  // Convenience computed for current symbol
  symbol$ = computed(() => this.symbol(this.selectedCurrency()));

  constructor(private _http: HttpClient) {
    // Migrate existing storage key if present
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('currency');
    if (stored) this.setCurrency(stored as CurrencyCode);

    // If you later switch to live rates, update this.rates() here.
    this.loadRates();
  }

  /** Set UI currency (persist locally). */
  setCurrency(code: CurrencyCode): void {
    const next = (code || 'INR').toUpperCase();
    this.selectedCurrency.set(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  /** Readonly signal for templates/components. */
  getCurrency() {
    return this.currency; // alias for backward-compat
  }

  /** Symbol for a given code (or current). */
  symbol(code?: CurrencyCode): string {
    const c = (code || this.selectedCurrency()).toUpperCase();
    return SYMBOLS[c] ?? '₹';
    // fallback to ₹ to avoid blank UI
  }

  /**
   * Convert an INR amount to the target currency for **display**.
   * Keeps rounding visual (2 decimals).
   */
  convertInr(amountInInr: number | string | undefined, to?: CurrencyCode): number {
    const amount = Number(amountInInr) || 0;
    const target = (to || this.selectedCurrency()).toUpperCase();
    if (target === 'INR') return +amount.toFixed(2);
    const rate = this.rates()[target] ?? 1;
    return +(amount * rate).toFixed(2);
  }

  /**
   * Format an INR amount for display in the selected (or provided) currency.
   * Adds '≈ ' prefix when not INR to make it clear it’s a conversion.
   */
  format(amountInInr: number | string | undefined, code?: CurrencyCode): string {
    const target = (code || this.selectedCurrency()).toUpperCase();
    const value = this.convertInr(amountInInr, target);
    const approx = target === 'INR' ? '' : '≈ ';
    const sym = this.symbol(target);
    return `${approx}${sym}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /** Replace fixed rates or patch with live rates later. */
  setRates(next: Record<string, number>, updatedAt = new Date().toISOString()): void {
    this.rates.set({ ...this.rates(), ...next });
    this._lastUpdated.set(updatedAt);
  }

  /** Currently loads from FIXED_EXCHANGE_RATES. Swap to live fetch when needed. */
  private loadRates(): void {
    // Example for later:
    // this._http.get<...>(...).subscribe(r => this.setRates(r, new Date().toISOString()));
    this.rates.set({ ...FIXED_EXCHANGE_RATES });
    this._lastUpdated.set(new Date().toISOString());
  }
}
