import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { PRODUCT_API_URLS } from '../../../core/constants/product-api-urls';

@Injectable({
  providedIn: 'root'
})
export class CartWishlistService {
  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  /** ✅ Signals for Wishlist and Cart Counts */
  private wishlistCountSignal = signal<number>(this.loadFromLocalStorage('wishlistCount', 0));
  private cartCountSignal = signal<number>(this.loadFromLocalStorage('cartCount', 0));

  /** ✅ Exposed Read-Only Signals (Encapsulation Best Practice) */
  readonly wishlistCount = computed(() => this.wishlistCountSignal());
  readonly cartCount = computed(() => this.cartCountSignal());

  constructor(private readonly httpClient: HttpClient) {
    this.fetchWishlistCount();
  }

  /** ✅ Get Wishlist Count from API */
  fetchWishlistCount(): void {
    this.httpClient
      .get<{ data: any[] }>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.get}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching wishlist count:', error);
          return []; // Return empty data on failure
        }),
        tap(response => {
          const count = response?.data?.length || 0;
          this.updateWishlistCount(count, true);
        })
      )
      .subscribe();
  }

  /** ✅ Update Wishlist Count */
  updateWishlistCount(change: number, absolute = false): void {
    const newCount = absolute ? change : Math.max(0, this.wishlistCountSignal() + change);
    this.wishlistCountSignal.set(newCount);
    this.saveToLocalStorage('wishlistCount', newCount);
    console.log('Updated Wishlist Count:', newCount, this.wishlistCount());
  }

  /** ✅ Update Cart Count */
  updateCartCount(change: number, absolute = false): void {
    const newCount = absolute ? change : Math.max(0, this.cartCountSignal() + change);
    this.cartCountSignal.set(newCount);
    this.saveToLocalStorage('cartCount', newCount);
    console.log('Updated Cart Count:', newCount);
  }

  /** ✅ Reset Wishlist and Cart Counts on Logout */
  resetCounts(): void {
    console.log('Resetting Wishlist & Cart Counts');
    this.wishlistCountSignal.set(0);
    this.cartCountSignal.set(0);
    this.clearLocalStorage();
  }

  /** ✅ Local Storage Utilities */
  private saveToLocalStorage(key: string, value: number): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private loadFromLocalStorage(key: string, defaultValue: number): number {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(defaultValue));
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('wishlistCount');
    localStorage.removeItem('cartCount');
  }
}
