import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Coupon,
  GetAvailableCouponsQuery,
  ApplyCouponRequest,
  ApplyCouponResponse,
  AppliedCoupon,
} from '../_models/coupon.model';
import { ORDER_API_URLS } from '../../../core/constants/order-urls';
import { APP_SETTINGS } from '../../../core/constants/app-settings';

type ApplyEnv = {
  data?: {
    coupon_code?: string;
    discount_amount?: number | string;
    final_total?: number | string;
    cart_data?: { id?: number };
  };
};


function buildFingerprint(cart: any): string {
  const items = (cart?.items ?? [])
    .map((i: any) => `${i.id}:${i.quantity}`)
    .sort()
    .join('|');
  return `${cart?.id ?? 'x'}|${items}`;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  private api = inject(HttpClient);

  available(q: GetAvailableCouponsQuery): Observable<Coupon[]> {
    let params = new HttpParams();
    if (q?.address_id != null) params = params.set('address_id', String(q.address_id));
    if (q?.country_code) params = params.set('country_code', q.country_code);

    // Envelope from backend: { statusCode: 200, message: string, data: Coupon[] }
    type ApiEnvelope<T> = { data: T; message?: string; statusCode?: number };

    return this.api
      .get<ApiEnvelope<Coupon[]> | Coupon[]>(
        `${this.baseUrl}${ORDER_API_URLS.coupon.available}`,
        { params }
      )
      .pipe(
        map((res) => {
          // Be defensive: support both shapes (envelope or raw array)
          if (Array.isArray(res)) return res as Coupon[];
          const env = res as ApiEnvelope<Coupon[]>;
          return Array.isArray(env?.data) ? env.data : [];
        })
      );
  }

  apply(body: ApplyCouponRequest): Observable<AppliedCoupon> {
    return this.api.post<ApplyEnv>(`${this.baseUrl}${ORDER_API_URLS.coupon.apply}`, body).pipe(
      map(res => {
        const d = res?.data ?? {} as any;
        // if you have the current cart snapshot in a service or store, pass it in to fingerprint:
        const cartSnap: any = null; // (inject store/select if needed)
        return {
          code: (d.coupon_code ?? body.coupon_code) as string,
          country: body.country_code,
          amount: Number(d.discount_amount ?? 0),
          finalTotal: d.final_total != null ? Number(d.final_total) : undefined,
          cartId: d.cart_data?.id ?? null,
          fingerprint: cartSnap ? buildFingerprint(cartSnap) : undefined,
          active: Number(d.discount_amount ?? 0) > 0,
          appliedAt: Date.now(),
          // expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // optional 7-day TTL
        } as AppliedCoupon;
      })
    );
  }
}
