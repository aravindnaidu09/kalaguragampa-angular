import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CouponFacade } from '../../_state/coupon.facade';
import { Coupon } from '../../_models/coupon.model';
import { CurrencyService } from '../../../../core/services/currency.service'; // ✅ add

@Component({
  selector: 'app-apply-coupon-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './apply-coupon-dialog.component.html',
  styleUrl: './apply-coupon-dialog.component.scss'
})
export class ApplyCouponDialogComponent {
  @Input() addressId?: number | null;
  @Input() countryCode: string = 'IND';

  private facade = inject(CouponFacade);
  private destroyRef = inject(DestroyRef);
  private currencyService = inject(CurrencyService); // ✅ add

  code = new FormControl('', [Validators.required, Validators.minLength(3)]);
  available$ = this.facade.available$;
  loading$ = this.facade.loading$;
  applying$ = this.facade.applying$;
  error$ = this.facade.error$;

  // ✅ expose the selected currency as a signal for template reactivity
  readonly currency = this.currencyService.getCurrency();

  constructor(
    private ref: MatDialogRef<ApplyCouponDialogComponent, string | null>
  ) {}

  ngOnInit(): void {
    this.facade.loadAvailable(this.addressId ?? null, this.countryCode);
  }

  pick(c: Coupon) {
    this.code.setValue(c.code);
  }

  apply() {
    if (this.code.invalid) { this.code.markAsTouched(); return; }
    this.facade.applyCoupon(this.code.value!, this.countryCode);
    this.ref.close(this.code.value!.trim());
  }

  close(): void {
    this.ref.close(null);
  }

  trackById = (_: number, c: Coupon) => c.id;

  // ✅ tiny formatter that keeps all inputs in INR but *displays* as selected currency
  fmt(amountInInr: number | string | undefined, code: string): string {
    return this.currencyService.format(amountInInr, code);
  }
}
