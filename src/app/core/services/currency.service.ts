// import { Injectable, signal } from "@angular/core";
// import { COUNTRY_CURRENCY_MAP } from "../constants/currency-map";

import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { CURRENCY_LIST } from "../constants/currency-map";
import { FIXED_EXCHANGE_RATES } from "../constants/exchange-rates";

// /core/services/currency.service.ts
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private baseCurrency = signal<'INR' | string>('INR');
  private exchangeRates = signal<Record<string, number>>({});

  constructor(private http: HttpClient) {
    this.loadRates();
  }

  setCurrency(code: string) {
    this.baseCurrency.set(code);
  }

  getCurrency() {
    return this.baseCurrency.asReadonly();
  }

  getSymbol(): string {
    return CURRENCY_LIST.find(c => c.code === this.baseCurrency())?.symbol || '₹';
  }

  convertPrice(inrAmount: number | string | undefined): number {
    const amount = Number(inrAmount) || 0;
    const to = this.baseCurrency();
    if (to === 'INR') return amount;
    const rate = this.exchangeRates()[to] || 1;
    return +(amount * rate).toFixed(2);
  }


  private loadRates() {
    this.exchangeRates.set(FIXED_EXCHANGE_RATES);
  }
}

