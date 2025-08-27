import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { CartFacade } from '../../_state/cart.facade';
import { CouponFacade } from '../../_state/coupon.facade';
import { ApplyCouponDialogComponent } from '../apply-coupon-dialog/apply-coupon-dialog.component';

import { filter, take, tap } from 'rxjs/operators';
import { AppCurrencyPipe } from '../../../../core/pipes/app-currency.pipe';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-price-summary',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe],
  templateUrl: './price-summary.component.html',
  styleUrls: ['./price-summary.component.scss']
})
export class PriceSummaryComponent {

  // ----- Injected services/facades -----
  private cartFacade = inject(CartFacade);
  private couponFacade = inject(CouponFacade);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private cs = inject(CurrencyService);

  /** Country context for coupon APIs. Backend defaults to IND but keep explicit. */
  private readonly countryCode = 'IND';

  // ----- Signals from facades -----
  readonly cartSignal: Signal<any> = this.cartFacade.cartSignal;
  readonly courierNameSignal = inject(CartFacade).courierNameSignal;
  readonly estimatedDeliveryDaysSignal = inject(CartFacade).estimatedDeliveryDaysSignal;

  // Current currency code (signal). Always pass currencyCode() to the pipe.
  readonly currencyCode = this.cs.currency;

  @Input() showPlaceOrderButton: boolean = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────
  private toNum = (v: unknown, fallback = 0): number => {
    if (v === null || v === undefined) return fallback;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[, ]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  };

  readonly isINR = computed(() => (this.cs.currency() ?? 'INR').toUpperCase() === 'INR');

  /** Convenience getter for templates */
  get cart() {
    return this.cartSignal();
  }

  /** Show/hide shipping & ETA block: visible if we have shippingAmount OR ETA */
  readonly shouldHideShippingAndDelivery = computed(() => {
    const c = this.cartSignal();
    const hasShippingField = c?.shippingAmount !== undefined && c?.shippingAmount !== null;
    const hasEta = !!this.estimatedDeliveryDaysSignal();
    return !(hasShippingField || hasEta);
  });

  /** Coupon state */
  readonly hasCouponApplied = computed(() => this.toNum(this.cartSignal()?.couponAmount) > 0);

  /** Totals (all in INR; display conversion is done by pipe) */
  readonly totals = computed(() => {
    const c = this.cartSignal();

    const items = this.toNum(c?.cartTotal);
    const discount = Math.max(0, this.toNum(c?.discountAmount));
    const coupon = Math.max(0, this.toNum(c?.couponAmount));
    const ship = Math.max(0, this.toNum(c?.shippingAmount));

    // Prefer server-provided grand if present; else compute
    let grand = this.toNum(c?.totalAmount);
    if (grand <= 0 && (items > 0 || discount > 0 || coupon > 0 || ship > 0)) {
      grand = Math.max(0, items - discount - coupon + ship);
    }

    const savings = Math.max(0, discount + coupon);

    return { items, discount, coupon, ship, grand, savings };
  });

  get isShippingFree(): boolean {
    // treat <= 0 as free (handles '0', 0, undefined → false)
    return this.toNum(this.cart?.shippingAmount) <= 0;
  }

  estimatedDeliveryEndRange(): number {
    const days = this.toNum(this.estimatedDeliveryDaysSignal(), 0);
    return days ? days + 2 : 0;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────────
  goToCheckoutPage(): void {
    this.router.navigate(['/checkout']);
  }

  openCouponDialog(): void {
    const addressId: number | null | undefined =
      this.cart?.shippingAddressId ?? this.cart?.addressId ?? null;

    const dialogRef = this.dialog.open(ApplyCouponDialogComponent, {
      width: '50vw',
      disableClose: true,
      data: { addressId, countryCode: this.countryCode }
    });

    dialogRef.afterClosed()
      .pipe(
        take(1),
        filter((code: string | undefined) => !!code)
      )
      .subscribe((couponCode: any) => this.applyCoupon(couponCode));
  }

  applyCoupon(code: string) {
    this.couponFacade.applyCoupon(code, this.countryCode)
      .pipe(
        take(1),
        tap(() => {
          // Refresh cart totals after successful apply; support multiple facades
          this.cartFacade.loadCart?.().pipe(take(1)).subscribe?.() ||
          (this.cartFacade as any).refresh?.() ||
          (this.cartFacade as any).fetchCart?.();
        })
      )
      .subscribe();
  }

  removeAppliedCoupon() {
    this.couponFacade.clearApplied();
    this.cartFacade.loadCart?.().pipe(take(1)).subscribe?.() ||
    (this.cartFacade as any).refresh?.() ||
    (this.cartFacade as any).fetchCart?.();
  }
}
