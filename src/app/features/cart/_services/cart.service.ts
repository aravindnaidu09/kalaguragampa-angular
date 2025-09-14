import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { APP_SETTINGS } from "../../../core/constants/app-settings";
import { CART_API_URLS } from "../../../core/constants/cart-api-urls";
import { ApiResponse } from "../../../core/models/api-response.model";
import { CartResponseItem, deserializeCartResponse, CartItem } from "../_models/cart-item-model";
import { SILENT_HTTP } from "../../../core/http/http-context.tokens";

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
  // cart.service.ts
  getCart(addressId?: number, countryCode: string = 'IND', opts?: { silent?: boolean }) {
    let params = new HttpParams();
    if (addressId !== undefined && addressId !== null) {
      params = params.set('address_id', String(addressId));   // ← conditional
    }
    // If your API needs country here, uncomment:
    // params = params.set('country_code', countryCode);

    const url = `${this.baseUrl}${CART_API_URLS.cart.getCart}`;

    return this.httpClient
      .get<ApiResponse<any>>(url, { params })                 // ← no HttpContext needed
      .pipe(map((response) => ({
        ...response,
        data: deserializeCartResponse(response.data),
      })));
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
  updateCartItems(items: { id: number; quantity: number }[]): Observable<ApiResponse<CartResponseItem>> {
    return this.httpClient.put<ApiResponse<any>>(`${this.baseUrl}${CART_API_URLS.cart.updateItem}`, items).pipe(
      map((response) => ({
        ...response,
        data: deserializeCartResponse(response.data)
      }))
    );
  }

  /**
   * ✅ Remove an item from the cart
   */
  removeCartItems(itemIds: number[], countryCode: string = 'IND'): Observable<ApiResponse<CartResponseItem>> {
    let params = new HttpParams();
    // .set('country_code', countryCode);

    // Append multiple item_ids
    itemIds.forEach(id => {
      params = params.append('item_ids', id.toString());
    });
    params = params.append('country_code', countryCode);

    return this.httpClient.delete<ApiResponse<any>>(
      `${this.baseUrl}${CART_API_URLS.cart.removeItem}`,
      { params }
    ).pipe(
      map(response => ({
        ...response,
        data: deserializeCartResponse(response.data)
      }))
    );
  }

}
