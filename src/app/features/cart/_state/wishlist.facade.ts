// 📁 wishlist.facade.ts
import { inject, Injectable, computed, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { IWishlist } from '../../product/_models/wishlist-model';
import { WishlistActions } from './wishlist.actions';
import { WishlistState } from './wishlist.state';

@Injectable({ providedIn: 'root' })
export class WishlistFacade {
  private store = inject(Store);

  wishlistItems = this.store.selectSignal(WishlistState.getWishlist);
  wishlistCount = this.store.selectSignal(WishlistState.getWishlistCount);
  isLoading = this.store.selectSignal(WishlistState.isLoading);

  fetch() {
    this.store.dispatch(new WishlistActions.Fetch());
  }

  add(productId: number) {
    if (!this.isInWishlist(productId)) {
      this.store.dispatch(new WishlistActions.Add(productId));
    }
  }

  update(item: IWishlist) {
    this.store.dispatch(new WishlistActions.Update(item));
  }

  remove(productId: number) {
    if (this.isInWishlist(productId)) {
      this.store.dispatch(new WishlistActions.Remove(productId));
    }
  }

  clear() {
    this.store.dispatch(new WishlistActions.Clear());
  }

  /** ✅ Check if a product is in wishlist (with all necessary checks) */
  isInWishlist = (productId: number): boolean => {
    if (productId === null || productId === undefined || typeof productId !== 'number') {
      return false;
    }

    const items = this.wishlistItems();
    if (!Array.isArray(items) || items.length === 0) {
      return false;
    }

    return items.some(item => {
      const id = item?.productDetails?.id;
      return id !== undefined && id === productId;
    });
  };
}
