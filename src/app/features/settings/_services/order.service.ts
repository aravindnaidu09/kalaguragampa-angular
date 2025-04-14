import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IOrder, Order } from '../_model/order-model';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { ORDER_API_URLS } from '../../../core/constants/order-urls';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${APP_SETTINGS.apiBaseUrl}${ORDER_API_URLS.order.getAll}`;

  constructor(private http: HttpClient) {}

  /**
   * ✅ Get all user orders
   */
  getUserOrders(): Observable<IOrder[]> {
    return this.http.get<ApiResponse<IOrder[]>>(`${this.baseUrl}`).pipe(
      map(res => res.data)
    );
  }

  // You can also add methods like getOrderDetails(id), downloadInvoice(id), etc. if needed in the future.
}
