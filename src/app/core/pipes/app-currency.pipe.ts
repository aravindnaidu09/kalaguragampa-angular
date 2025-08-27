import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({ name: 'appCurrency', standalone: true, pure: true })
export class AppCurrencyPipe implements PipeTransform {
  private cs = inject(CurrencyService);

  /**
   * Usage:
   *   In TS:  currencyCode = this.currencyService.currency; // signal
   *   In HTML: {{ amountInInr | appCurrency:(currencyCode()) }}
   *
   * If 'code' is omitted, it falls back to the current selection:
   *   {{ amountInInr | appCurrency }}
   * (Works, but won’t re-run on currency changes because the pipe is pure.)
   */
  transform(amountInInr: number | string | null | undefined, code?: string): string {
    const curr = (code ?? this.cs.currency()).toUpperCase();
    return this.cs.format(amountInInr ?? 0, curr);
  }
}
