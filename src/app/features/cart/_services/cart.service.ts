import { HttpClient, HttpParams } from "@angular/common/http";
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
  getCart(addressId?: number, countryCode: string = 'IND'): Observable<ApiResponse<CartResponseItem>> {
    const params: any = {};

    if (addressId !== undefined) {
      params.address_id = addressId;
    }

    if (countryCode) {
      params.country_code = countryCode;
    }

    return this.httpClient
      .get<ApiResponse<any>>(`${this.baseUrl}${CART_API_URLS.cart.getCart}`, { params })
      .pipe(
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
  updateCartItems(items: { id: number; quantity: number }[]): Observable<ApiResponse<CartResponseItem>> {
    console.log('url: ', `${this.baseUrl}${CART_API_URLS.cart.updateItem}`);
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
