import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_SETTINGS } from '../constants/app-settings';
import { DeliveryEstimate, DeliveryEstimateResponse, DeliveryOption } from '../models/delivery.model';
import { DELIVERY_API_URLS } from '../constants/delivery-urls';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private baseUrl = APP_SETTINGS.apiBaseUrl;
  private readonly deliveryUrlPaths = DELIVERY_API_URLS.delivery;

  constructor(private http: HttpClient) { }

  // ✅ Get All Delivery Options
  getShippingEstimate(payload: {
    address_id?: number | string;
    city?: string;
    country?: string;
    country_code?: string;
    pincode?: string;
    state?: string;
  }): Observable<DeliveryEstimate | null> {
    let params = new HttpParams();

    Object.entries(payload).forEach(([key, value]) => {
      if (value != null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<DeliveryEstimateResponse>(`${this.baseUrl}${this.deliveryUrlPaths.estimate}`, { params }).pipe(
      map((res) => res.data?.[0] ?? null) // ✅ return only first result, or null
    );
  }



  // ✅ Create Delivery Option
  createDeliveryOption(payload: DeliveryOption): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.deliveryUrlPaths.createOrder}`, payload);
  }

  // // ✅ Update Delivery Option
  // updateDeliveryOption(payload: DeliveryOption): Observable<any> {
  //   return this.http.put(`${this.baseUrl}${this.deliveryUrlPaths.}`, payload);
  // }

  // ✅ Track a Delivery by ID
  trackDelivery(deliveryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}${this.deliveryUrlPaths.track(deliveryId)}`);
  }
}
