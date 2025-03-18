import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, catchError, tap } from 'rxjs/operators';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { PRODUCT_API_URLS } from '../../../core/constants/product-api-urls';

@Injectable({
  providedIn: 'root'
})
export class CartWishlistService {
  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  /** ✅ Subjects for Wishlist and Cart Counts */
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  private cartCountSubject = new BehaviorSubject<number>(0);

  /** ✅ Observable Streams */
  wishlistCount$ = this.wishlistCountSubject.asObservable();
  cartCount$ = this.cartCountSubject.asObservable();

  /** ✅ Debounce Fetch Wishlist */
  private fetchWishlistTrigger$ = new Subject<void>();

  constructor(private readonly httpClient: HttpClient) {
    /** ✅ Trigger API call with debounce time to prevent multiple rapid requests */
    this.fetchWishlistTrigger$
      .pipe(debounceTime(500))
      .subscribe(() => this.fetchWishlistCount());

    /** ✅ Fetch wishlist count on service initialization */
    this.fetchWishlistCount();
  }

  /** ✅ Get the Current Count */
  get wishlistCount(): number {
    return this.wishlistCountSubject.value;
  }

  get cartCount(): number {
    return this.cartCountSubject.value;
  }

  /** ✅ Update Wishlist Count */
  updateWishlistCount(change: number): void {
    const newCount = Math.max(0, this.wishlistCount + change);
    this.wishlistCountSubject.next(newCount);
    console.log('Updated Wishlist Count:', newCount);
  }

  /** ✅ Update Cart Count */
  updateCartCount(change: number): void {
    const newCount = Math.max(0, this.cartCount + change);
    this.cartCountSubject.next(newCount);
    console.log('Updated Cart Count:', newCount);
  }

  /** ✅ Fetch Wishlist Count from API */
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
          this.wishlistCountSubject.next(count);
          console.log('Fetched Wishlist Count:', count);
        })
      )
      .subscribe();
  }

  /** ✅ Manually Trigger Fetch with Debounce */
  triggerFetchWishlistCount(): void {
    this.fetchWishlistTrigger$.next();
  }

  /** ✅ Reset Wishlist and Cart Counts on Logout */
  resetCounts(): void {
    console.log('Resetting Wishlist & Cart Counts');
    this.wishlistCountSubject.next(0);
    this.cartCountSubject.next(0);
    localStorage.removeItem('wishlist');
    localStorage.removeItem('cart');
  }
}
