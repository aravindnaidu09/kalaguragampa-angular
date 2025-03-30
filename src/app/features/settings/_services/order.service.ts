import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../_model/order-model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

}
