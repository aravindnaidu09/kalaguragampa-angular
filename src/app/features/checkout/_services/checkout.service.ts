import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PAYMENT_API_URLS } from '../../../core/constants/payments-api-urls';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient) {}

  placeOrder(orderData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PAYMENT_API_URLS.payment.createOrder}`, orderData);
  }

  verifyOrderPayment(orderPk: string, paymentData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PAYMENT_API_URLS.payment.verifyPayment(orderPk)}`, paymentData);
  }
}
