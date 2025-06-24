import { Injectable, computed, inject, signal } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { ApplyCoupon } from './coupon.actions';
import { CouponState } from './coupon.state';

@Injectable({ providedIn: 'root' })
export class CouponFacade {
  private store = inject(Store);

  readonly discountAmount = computed(() => this.store.selectSnapshot(CouponState.discountAmount));
  readonly couponCode = computed(() => this.store.selectSnapshot(CouponState.couponCode));
  readonly loading = computed(() => this.store.selectSnapshot(CouponState.loading));

  applyCoupon(coupon_code: string, country_code: string = 'IND') {
    this.store.dispatch(new ApplyCoupon({ coupon_code, country_code }));
  }
}
