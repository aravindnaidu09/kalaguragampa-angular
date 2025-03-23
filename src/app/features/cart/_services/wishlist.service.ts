import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IWishlist } from "../../product/_models/wishlist-model";
import { APP_SETTINGS } from "../../../core/constants/app-settings";
import { PRODUCT_API_URLS } from "../../../core/constants/product-api-urls";

// 📁 wishlist.service.ts
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getWishlist(): Observable<IWishlist[]> {
    return this.http.get<IWishlist[]>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.get}`);
  }

  addToWishlist(productId: number): Observable<IWishlist> {
    return this.http.post<IWishlist>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.add(productId)}`, {});
  }

  updateWishlistItem(item: IWishlist): Observable<IWishlist> {
    return this.http.put<IWishlist>(`/api/wishlist/${item.productDetails.id}`, item);
  }

  removeFromWishlist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.remove(id)}`);
  }
}
