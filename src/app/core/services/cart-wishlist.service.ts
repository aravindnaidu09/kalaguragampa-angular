import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartWishlistService {

  // Signals to manage wishlist and cart counts
  wishlistCount = signal(0); // Initial wishlist count
  cartCount = signal(0); // Initial cart count

  constructor() { }

  // Update Wishlist Count
  updateWishlistCount(count: number) {
    this.wishlistCount.set(this.wishlistCount() + count);
  }

  // Update Cart Count
  updateCartCount(count: number) {
    this.cartCount.set(this.cartCount() + count);
  }

}
