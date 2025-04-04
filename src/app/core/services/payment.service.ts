import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_SETTINGS } from '../constants/app-settings';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  private http = inject(HttpClient);
  private baseUrl = `${APP_SETTINGS.apiBaseUrl}/payments/api/v1`;

  /**
   * Create a new Razorpay order
   */
  createOrder(payload: {
    total_amount: number;
    country_code: string;
    address_id: number;
    courier_company_id: string;
  }): Observable<ApiResponse<{ id: string; amount: number; currency: string }>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/order/`, payload);
  }

  /**
   * Verify Razorpay payment using order PK (from backend order object)
   */
  verifyPayment(orderPk: number, payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/order/${orderPk}/verify-payment/`,
      payload
    );
  }

}
