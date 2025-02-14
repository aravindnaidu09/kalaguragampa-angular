import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../../../core/constants/api-urls';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { CART_API_URLS } from '../../../core/constants/cart-api-urls';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient) {}

  getCart(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}${CART_API_URLS.cart.getCart}`);
  }

  clearCart(): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}${CART_API_URLS.cart.clearCart}`);
  }

  addItemToCart(item: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${CART_API_URLS.cart.addItem}`, item);
  }

  updateCartItem(id: string, item: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}${CART_API_URLS.cart.updateItem(id)}`, item);
  }

  removeCartItem(id: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}${CART_API_URLS.cart.removeItem(id)}`);
  }

}
