// ✅ order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IOrder } from '../_model/order-model';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { ORDER_API_URLS } from '../../../core/constants/order-urls';
import { deserializeOrders } from '../_model/order.adapter';
import { DELIVERY_API_URLS } from '../../../core/constants/delivery-urls';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${APP_SETTINGS.apiBaseUrl}${ORDER_API_URLS.order.getAll}`;

  constructor(private http: HttpClient) { }

  /**
   * ✅ Get all user orders with filters: pagination + status/time/year
   */
  getUserOrders(filters: {
    limit: number;
    offset: number;
    range?: string;
    year?: string;
    status?: string;
  }): Observable<{ results: IOrder[]; count: number }> {
    let params = new HttpParams()
      .set('limit', filters.limit)
      .set('offset', filters.offset);

    if (filters.status && filters.status !== 'all') params = params.set('delivery_status', filters.status);
    if (filters.range && filters.range !== 'none') params = params.set('range', filters.range);
    if (filters.year && filters.year !== 'none') params = params.set('year', filters.year);

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((res) => ({
        results: deserializeOrders(res.data.results),
        count: res.data.count
      }))
    );
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.post(`${APP_SETTINGS.apiBaseUrl}${DELIVERY_API_URLS.delivery.cancelOrder}`, { order_id: id });
  }

  /**
 * ✅ Download invoice for a given order ID (returns Blob)
 */
  downloadInvoice(orderId: number): Observable<Blob> {
    const url = `${APP_SETTINGS.apiBaseUrl}${ORDER_API_URLS.order.invoiceDownload(orderId)}`;
    return this.http.post(url, null, {
      responseType: 'blob'
    });
  }
}
