import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { APP_SETTINGS } from "../../../core/constants/app-settings";
import { CART_API_URLS } from "../../../core/constants/cart-api-urls";
import { ApiResponse } from "../../../core/models/api-response.model";
import { CartResponseItem, deserializeCartResponse, CartItem } from "../_models/cart-item-model";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient) { }

  /**
   * ✅ Get current user's cart
   * Deserializes response to CartResponseItem (camelCase typed)
   */
  getCart(): Observable<ApiResponse<CartResponseItem>> {
    return this.httpClient.get<ApiResponse<any>>(`${this.baseUrl}${CART_API_URLS.cart.getCart}`).pipe(
      map((response) => ({
        ...response,
        data: deserializeCartResponse(response.data)
      }))
    );
  }

  /**
   * ✅ Clear entire cart
   */
  clearCart(): Observable<ApiResponse<null>> {
    return this.httpClient.delete<ApiResponse<null>>(`${this.baseUrl}${CART_API_URLS.cart.clearCart}`);
  }

  /**
   * ✅ Add product to cart
   */
  addToCart(productId: number, quantity: number = 1): Observable<ApiResponse<CartResponseItem>> {
    const payload: CartItem[] = [{ product_id: productId, quantity }];
    return this.httpClient.post<ApiResponse<any>>(`${this.baseUrl}${CART_API_URLS.cart.addItem}`, payload).pipe(
      map((response) => ({
        ...response,
        data: deserializeCartResponse(response.data)
      }))
    );
  }

  /**
   * ✅ Update quantity or item details
   */
  updateCartItem(id: string, item: any): Observable<ApiResponse<CartResponseItem>> {
    return this.httpClient.put<ApiResponse<any>>(`${this.baseUrl}${CART_API_URLS.cart.updateItem(id)}`, item).pipe(
      map((response) => ({
        ...response,
        data: deserializeCartResponse(response.data)
      }))
    );
  }

  /**
   * ✅ Remove an item from the cart
   */
  removeCartItem(id: string): Observable<ApiResponse<CartResponseItem>> {
    return this.httpClient.delete<ApiResponse<any>>(`${this.baseUrl}${CART_API_URLS.cart.removeItem(id)}`).pipe(
      map((response) => ({
        ...response,
        data: deserializeCartResponse(response.data)
      }))
    );
  }
}
