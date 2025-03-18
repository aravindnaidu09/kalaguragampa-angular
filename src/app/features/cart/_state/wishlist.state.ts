import { State, Action, StateContext, Selector } from '@ngxs/store';
import { IWishlist } from '../../product/_models/wishlist-model';
import { Injectable } from '@angular/core';

// ✅ Actions
export class AddToWishlist {
  static readonly type = '[Wishlist] Add Item';
  constructor(public payload: IWishlist) {}
}

export class RemoveFromWishlist {
  static readonly type = '[Wishlist] Remove Item';
  constructor(public productId: number) {}
}

export class ClearWishlist {
  static readonly type = '[Wishlist] Clear Wishlist';
}

// ✅ Wishlist State Model
export interface WishlistStateModel {
  wishlistItems: IWishlist[];
  totalItems: number;
}

// ✅ Initial State
@State<WishlistStateModel>({
  name: 'wishlist',
  defaults: {
    wishlistItems: [],
    totalItems: 0
  }
})
@Injectable()
export class WishlistState {

  // ✅ Selector to get wishlist items
  @Selector()
  static getWishlist(state: WishlistStateModel) {
    return state.wishlistItems;
  }

  // ✅ Selector to get wishlist count (for badge updates)
  @Selector()
  static getWishlistCount(state: WishlistStateModel) {
    return state.totalItems;
  }

  // ✅ Add to Wishlist
  @Action(AddToWishlist)
  addToWishlist({ getState, patchState }: StateContext<WishlistStateModel>, { payload }: AddToWishlist) {
    const state = getState();
    patchState({
      wishlistItems: [...state.wishlistItems, payload],
      totalItems: state.totalItems + 1
    });
  }

  // ✅ Remove from Wishlist
  @Action(RemoveFromWishlist)
  removeFromWishlist({ getState, patchState }: StateContext<WishlistStateModel>, { productId }: RemoveFromWishlist) {
    const state = getState();
    patchState({
      wishlistItems: state.wishlistItems.filter(item => item.productDetails.id !== productId),
      totalItems: Math.max(0, state.totalItems - 1)
    });
  }

  // ✅ Clear Wishlist (Logout or Manual)
  @Action(ClearWishlist)
  clearWishlist({ setState }: StateContext<WishlistStateModel>) {
    setState({
      wishlistItems: [],
      totalItems: 0
    });
  }
}
