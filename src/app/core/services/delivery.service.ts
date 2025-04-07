import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_SETTINGS } from '../constants/app-settings';
import { DeliveryOption } from '../models/delivery.model';
import { DELIVERY_API_URLS } from '../constants/delivery-urls';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ✅ Get All Delivery Options
  getDeliveryOptions(countryCode: string = 'IND'): Observable<DeliveryOption[]> {
    return this.http.get<any[]>(`${this.baseUrl}${DELIVERY_API_URLS.delivery.getAll}`,
      { params: { country_code: countryCode } }).pipe(
      map((res) =>
        res.map((item) => ({
          ...item,
          shipping_amount: parseFloat(item.shipping_amount),
        }))
      )
    );
  }

  // ✅ Create Delivery Option
  createDeliveryOption(payload: DeliveryOption): Observable<any> {
    return this.http.post(`${this.baseUrl}${DELIVERY_API_URLS.delivery.create}`, payload);
  }

  // ✅ Update Delivery Option
  updateDeliveryOption(payload: DeliveryOption): Observable<any> {
    return this.http.put(`${this.baseUrl}${DELIVERY_API_URLS.delivery.update}`, payload);
  }

  // ✅ Track a Delivery by ID
  trackDelivery(deliveryId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${DELIVERY_API_URLS.delivery.track(deliveryId)}`);
  }
}
