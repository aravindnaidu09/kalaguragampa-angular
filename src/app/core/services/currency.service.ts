// import { Injectable, signal } from "@angular/core";
// import { COUNTRY_CURRENCY_MAP } from "../constants/currency-map";

// @Injectable({ providedIn: 'root' })
// export class CurrencyService {
//   private _selectedCountry = signal<CountryKey>('india');

//   readonly selectedCountry = this._selectedCountry.asReadonly();

//   setCountry(country: CountryKey) {
//     this._selectedCountry.set(country);
//     localStorage.setItem('kg-country', country);
//   }

//   get currencySymbol(): string {
//     return COUNTRY_CURRENCY_MAP[this._selectedCountry()]?.symbol ?? '₹';
//   }

//   convertFromINR(price: number): number {
//     const rate = COUNTRY_CURRENCY_MAP[this._selectedCountry()]?.rate ?? 1;
//     return Math.round(price / rate * 100) / 100;
//   }

//   constructor() {
//     const stored = localStorage.getItem('kg-country') as CountryKey;
//     if (stored && COUNTRY_CURRENCY_MAP[stored]) {
//       this._selectedCountry.set(stored);
//     }
//   }
// }
