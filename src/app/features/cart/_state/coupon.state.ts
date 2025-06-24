import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CouponService } from '../_services/coupon.service';
import { ApplyCoupon } from './coupon.actions';

export interface CouponStateModel {
  discountAmount: number | null;
  couponCode: string | null;
  loading: boolean;
}

@State<CouponStateModel>({
  name: 'coupon',
  defaults: {
    discountAmount: null,
    couponCode: null,
    loading: false
  }
})
@Injectable()
export class CouponState {
  constructor(private couponService: CouponService) {}

  @Selector()
  static discountAmount(state: CouponStateModel): number | null {
    return state.discountAmount;
  }

  @Selector()
  static couponCode(state: CouponStateModel): string | null {
    return state.couponCode;
  }

  @Selector()
  static loading(state: CouponStateModel): boolean {
    return state.loading;
  }

  @Action(ApplyCoupon)
  applyCoupon(ctx: StateContext<CouponStateModel>, action: ApplyCoupon) {
    ctx.patchState({ loading: true });

    return this.couponService.applyCoupon(action.payload).pipe(
      tap((res) => {
        ctx.patchState({
          discountAmount: res.data?.discount || null,
          couponCode: action.payload.coupon_code,
          loading: false
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false });
        return of(err);
      })
    );
  }
}
