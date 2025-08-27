// core/state/settings.state.ts
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { FIXED_EXCHANGE_RATES } from '../constants/exchange-rates';
import { SetCurrency } from './settings.actions';
import { CURRENCY_LIST } from '../constants/currency-map';

export interface SettingsStateModel {
  currency: string; // 'INR' | 'USD' | ...
  rates: Record<string, number>; // INR->target
  symbols: Record<string, string>; // 'INR' -> '₹'
  lastUpdated?: string;
}

const SYMBOLS = CURRENCY_LIST.reduce<Record<string,string>>((a, c) => {
  a[c.code] = c.symbol; return a;
}, {});

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    currency: localStorage.getItem('kg_currency') || 'INR',
    rates: FIXED_EXCHANGE_RATES, // keep math in INR, convert for display only
    symbols: SYMBOLS,
    lastUpdated: new Date().toISOString()
  }
})
export class SettingsState {
  @Selector() static currency(s: SettingsStateModel) { return s.currency; }
  @Selector() static rates(s: SettingsStateModel) { return s.rates; }
  @Selector() static symbols(s: SettingsStateModel) { return s.symbols; }
  @Selector() static lastUpdated(s: SettingsStateModel) { return s.lastUpdated; }

  @Action(SetCurrency)
  setCurrency(ctx: StateContext<SettingsStateModel>, { code }: SetCurrency) {
    localStorage.setItem('kg_currency', code);
    ctx.patchState({ currency: code });
  }
}
