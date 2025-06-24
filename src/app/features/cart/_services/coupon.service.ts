import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { ORDER_API_URLS } from '../../../core/constants/order-urls';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor(private http: HttpClient) { }

  /**
 * ✅ Apply a coupon to user's cart
 */
  applyCoupon(payload: { coupon_code: string; country_code?: string }): Observable<ApiResponse<any>> {
    const url = `${APP_SETTINGS.apiBaseUrl}${ORDER_API_URLS.coupon.apply}`;
    return this.http.post<ApiResponse<any>>(url, payload);
  }


}
