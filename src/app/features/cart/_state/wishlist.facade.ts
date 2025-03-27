// 📁 wishlist.facade.ts
import { inject, Injectable, computed, signal, Signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { IWishlist } from '../../product/_models/wishlist-model';
import { WishlistActions } from './wishlist.actions';
import { WishlistState } from './wishlist.state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistFacade {
  private store = inject(Store);

  wishlistItems = this.store.selectSignal(WishlistState.getWishlist);
  wishlistCount = this.store.selectSignal(WishlistState.getWishlistCount);
  isLoading = this.store.selectSignal(WishlistState.isLoading);
  readonly wishlistSignal = this.store.selectSignal(WishlistState.wishlistItemsSafe);

  fetch() {
    this.store.dispatch(new WishlistActions.Fetch());
  }

  add(productId: number): Observable<any> {
    return this.store.dispatch(new WishlistActions.Add(productId));
  }

  update(item: IWishlist): Observable<any> {
    return this.store.dispatch(new WishlistActions.Update(item));
  }

  remove(productId: number): Observable<any> {
    return this.store.dispatch(new WishlistActions.Remove(productId));
  }

  clear() {
    this.store.dispatch(new WishlistActions.Clear());
  }

  /** ✅ Return a reactive signal indicating if a product is wishlisted */
  isInWishlistSignal(productId: number): Signal<boolean> {
    return computed(() => {
      if (typeof productId !== 'number' || isNaN(productId)) return false;

      const items: IWishlist[] = this.wishlistSignal();
      return items.some(
        item => item.isAddedInWishlist && item.productDetails?.id === productId
      );
    });
  }
}
