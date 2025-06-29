import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_SETTINGS } from '../constants/app-settings';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { PAYMENT_API_URLS } from '../constants/payments-api-urls';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  private http = inject(HttpClient);
  private baseUrl = `${APP_SETTINGS.apiBaseUrl}`;

  /**
   * Create a new Razorpay order
   */
  createOrder(payload: {
    total_amount: number;
    country_code: string;
    address_id: number;
    courier_company_id: string;
  }): Observable<ApiResponse<{ id: string; amount: number; currency: string }>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${PAYMENT_API_URLS.payment.createOrder}`, payload);
  }

  /**
   * Verify Razorpay payment using order PK (from backend order object)
   */
  verifyPayment(orderPk: string, payload: {
    payment_id: string;
    payment_signature: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}${PAYMENT_API_URLS.payment.verifyPayment(orderPk)}`,
      payload
    );
  }

}
