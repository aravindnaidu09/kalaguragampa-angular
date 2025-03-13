import { Injectable, signal } from '@angular/core';
import { IWishlist } from '../_models/wishlist-model';
import { IProduct } from '../_models/product-model';

@Injectable({
  providedIn: 'root'
})
export class WishlistStore {
  private wishlistSignal = signal<IProduct[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get wishlist() {
    return this.wishlistSignal;
  }

  addToWishlist(item: IProduct) {
    const currentWishlist = this.wishlistSignal();
    if (!currentWishlist.some(w => w.id === item.id)) {
      const updatedWishlist = [...currentWishlist, item];
      this.wishlistSignal.set(updatedWishlist);
      this.saveToStorage(updatedWishlist);
    }
  }

  removeFromWishlist(itemId: any) {
    const updatedWishlist = this.wishlistSignal().filter(w => w.id !== itemId);
    this.wishlistSignal.set(updatedWishlist);
    this.saveToStorage(updatedWishlist);
  }

  clearWishlist() {
    this.wishlistSignal.set([]);
    localStorage.removeItem('wishlist');
  }

  private saveToStorage(wishlist: IProduct[]) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  private loadFromStorage() {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      this.wishlistSignal.set(JSON.parse(storedWishlist));
    }
  }
}
