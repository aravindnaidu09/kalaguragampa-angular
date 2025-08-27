import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, of, tap } from 'rxjs';
import { CouponService } from '../_services/coupon.service';
import { Coupon, ApplyCouponResponse, AppliedCoupon } from '../_models/coupon.model';
import { ApplyCoupon, ClearAppliedCoupon, LoadAvailableCoupons } from './coupon.actions';
import { RevalidateCoupon } from './cart.actions';

export interface CouponStateModel {
  available: Coupon[];
  loading: boolean;
  applying: boolean;
  applied: AppliedCoupon | null;
  error?: string | null;
}

@State<CouponStateModel>({
  name: 'coupons',
  defaults: {
    available: [],
    loading: false,
    applying: false,
    applied: null,
    error: null,
  },
})
@Injectable()
export class CouponState {
  private svc = inject(CouponService);

  // Selectors
  @Selector() static available(s: CouponStateModel) { return s.available; }
  @Selector() static loading(s: CouponStateModel) { return s.loading; }
  @Selector() static applying(s: CouponStateModel) { return s.applying; }
  @Selector() static applied(s: CouponStateModel) { return s.applied; }
  @Selector() static error(s: CouponStateModel) { return s.error; }

  // Load available
  @Action(LoadAvailableCoupons)
  loadAvailable(ctx: StateContext<CouponStateModel>, { payload }: LoadAvailableCoupons) {
    ctx.patchState({ loading: true, error: null });
    return this.svc.available({
      address_id: payload.addressId ?? null,
      country_code: payload.countryCode || 'IND',
    }).pipe(
      tap(list => ctx.patchState({ available: list, loading: false })),
      catchError(err => {
        ctx.patchState({ loading: false, error: err?.message ?? 'Failed to load coupons' });
        return of(null);
      })
    );
  }

  // Apply
  @Action(ApplyCoupon)
  apply(ctx: StateContext<CouponStateModel>, { payload }: ApplyCoupon) {
    ctx.patchState({ applying: true, error: null });

    return this.svc.apply({
      coupon_code: payload.code.trim(),
      country_code: payload.countryCode || 'IND',
    }).pipe(
      tap(applied => {
        if (!applied || !applied.amount) {
          ctx.patchState({ applying: false, applied: null, error: 'Coupon not applicable' });
          return;
        }
        ctx.patchState({ applying: false, applied, error: null });
      }),
      catchError(err => {
        ctx.patchState({ applying: false, applied: null, error: err?.message ?? 'Failed to apply coupon' });
        return of(null);
      })
    );
  }

  @Action(RevalidateCoupon)
  revalidate(ctx: StateContext<CouponStateModel>, { payload }: RevalidateCoupon) {
    const applied = ctx.getState().applied;
    if (!applied?.code) return;

    return this.svc.apply({
      coupon_code: applied.code,
      country_code: applied.country || 'IND'
    }).pipe(
      tap(res => {
        const amount = Number(res?.amount ?? (res as any)?.discountAmount ?? 0);
        if (amount > 0) {
          ctx.patchState({ applied: { ...applied, amount, active: true } });
        } else {
          ctx.patchState({ applied: { ...applied, amount: 0, active: false } });
          if (!payload?.silent) {
            // optionally toast here
            // this.toast.warn('Coupon no longer applies to your current items.');
          }
        }
      }),
      catchError(() => {
        ctx.patchState({ applied: { ...applied, amount: 0, active: false } });
        return of(null);
      })
    );
  }


  @Action(ClearAppliedCoupon)
  clear(ctx: StateContext<CouponStateModel>) {
    ctx.patchState({ applied: null });
  }
}
