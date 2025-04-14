// 📁 wishlist.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { deserializeWishlist, IWishlist } from '../../product/_models/wishlist-model';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { PRODUCT_API_URLS } from '../../../core/constants/product-api-urls';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getWishlist(): Observable<IWishlist[]> {
    return this.http
      .get<ApiResponse<IWishlist[]>>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.get}`)
      .pipe(map((res) => deserializeWishlist(res.data)));
  }

  addToWishlist(productId: number): Observable<IWishlist> {
    return this.http
      .post<ApiResponse<IWishlist>>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.add(productId)}`, {})
      .pipe(
        map((res) => {
          const deserialized = deserializeWishlist([res.data]); // wrap single item in array
          return deserialized[0]; // return first (and only) item
        })
      );
  }

  updateWishlistItem(item: IWishlist): Observable<IWishlist> {
    return this.http
      .put<ApiResponse<IWishlist>>(`${this.baseUrl}/wishlist/${item.productDetails.id}`, item)
      .pipe(
        map((res) => {
          const deserialized = deserializeWishlist([res.data]); // wrap single item in array
          return deserialized[0]; // return first (and only) item
        })
      );
  }


  removeFromWishlist(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.remove(id)}`)
      .pipe(map(() => undefined));
  }
}
