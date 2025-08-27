import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, switchMap } from 'rxjs';
import { Coupon, ApplyCouponResponse, AppliedCoupon } from '../_models/coupon.model';
import { CouponState } from './coupon.state';
import { ApplyCoupon, ClearAppliedCoupon, LoadAvailableCoupons } from './coupon.actions';

@Injectable({ providedIn: 'root' })
export class CouponFacade {
  private store = inject(Store);

  available$: Observable<Coupon[]> = this.store.select(CouponState.available);
  loading$: Observable<boolean> = this.store.select(CouponState.loading);
  applying$: Observable<boolean> = this.store.select(CouponState.applying);
  applied$: Observable<AppliedCoupon  | null> = this.store.select(CouponState.applied);
  error$: Observable<string | null | undefined> = this.store.select(CouponState.error);

  loadAvailable(addressId?: number | null, countryCode: string = 'IND') {
    this.store.dispatch(new LoadAvailableCoupons({ addressId, countryCode }));
  }

  applyCoupon(code: string, countryCode = 'IND') {
    return this.store.dispatch(new ApplyCoupon({ code, countryCode }))
      .pipe(switchMap(() => this.store.selectOnce(CouponState.applied))); // optional: return applied snapshot
  }

  clearApplied() {
    this.store.dispatch(new ClearAppliedCoupon());
  }
}
