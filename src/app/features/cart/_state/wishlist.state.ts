// 📁 wishlist.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { IWishlist } from '../../product/_models/wishlist-model';
import { WishlistService } from '../_services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { WishlistActions } from './wishlist.actions';

export interface WishlistStateModel {
  wishlistItems: IWishlist[];
  totalItems: number;
  loaded: boolean;
  loading: boolean;
}

function normalizeWishlist(items: IWishlist[]): IWishlist[] {
  return (items || []).map(item => ({
    ...item,
    isAddedInWishlist: true,
    productDetails: {
      ...item.productDetails,
      isAddedToWishlist: true // ✅ ensures nested flag is set
    }
  }));
}


@State<WishlistStateModel>({
  name: 'wishlist',
  defaults: {
    wishlistItems: normalizeWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]')),
    totalItems: JSON.parse(localStorage.getItem('wishlistCount') || '[]').length,
    loaded: false,
    loading: false
  }
})
@Injectable()
export class WishlistState {
  constructor(
    private wishlistService: WishlistService,
    private toast: ToastService
  ) { }

  @Selector()
  static getWishlist(state: WishlistStateModel) {
    return state.wishlistItems;
  }

  @Selector()
  static getWishlistCount(state: WishlistStateModel) {
    return state.totalItems;
  }

  @Selector()
  static isLoading(state: WishlistStateModel) {
    return state.loading;
  }

  @Selector()
  static wishlistItemsSafe(state: WishlistStateModel): IWishlist[] {
    return Array.isArray(state?.wishlistItems) ? state.wishlistItems : [];
  }

  @Action(WishlistActions.Fetch)
  fetchWishlist(ctx: StateContext<WishlistStateModel>) {
    ctx.patchState({ loading: true });

    return this.wishlistService.getWishlist().pipe(
      tap((items: IWishlist[]) => {
        const normalized = normalizeWishlist(items);

        ctx.patchState({
          wishlistItems: normalized,
          totalItems: normalized.length,
          loaded: true,
          loading: false
        });
        localStorage.setItem('wishlist', JSON.stringify(items));
      }),
      catchError((err) => {
        ctx.patchState({ loading: false });
        this.toast.showError('Failed to load wishlist.');
        return of();
      })
    );
  }

  @Action(WishlistActions.Add)
  addToWishlist(ctx: StateContext<WishlistStateModel>, { productId }: WishlistActions.Add) {
    ctx.patchState({ loading: true });

    return this.wishlistService.addToWishlist(productId).pipe(
      tap((item: IWishlist) => {
        const currentState = ctx.getState();

        // ✅ Deep clone the item with flags
        const newItem: IWishlist = {
          ...item,
          isAddedInWishlist: true,
          productDetails: {
            ...item.productDetails,
            isAddedToWishlist: true
          }
        };

        // ✅ Ensure a new array reference (forces Signal/Selector update)
        const updatedWishlist = [...currentState.wishlistItems, newItem];

        // ✅ Patch new state
        ctx.setState({
          ...currentState,
          wishlistItems: updatedWishlist,
          totalItems: updatedWishlist.length,
          loading: false
        });

        // ✅ Sync localStorage (optional but good UX)
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        localStorage.setItem('wishlistCount', JSON.stringify(updatedWishlist.length));

        // ✅ Notify user
        this.toast.showSuccess('Added to wishlist');
      }),
      catchError((err) => {
        ctx.patchState({ loading: false });
        this.toast.showError('Add to wishlist failed');
        return of();
      })
    );
  }


  @Action(WishlistActions.Remove)
  removeFromWishlist(ctx: StateContext<WishlistStateModel>, { productId }: WishlistActions.Remove) {
    ctx.patchState({ loading: true });

    return this.wishlistService.removeFromWishlist(productId).pipe(
      tap(() => {
        const state = ctx.getState();
        const filtered = state.wishlistItems.filter(item => item.productDetails.id !== productId);
        ctx.patchState({
          wishlistItems: filtered,
          totalItems: filtered.length,
          loading: false
        });
        localStorage.setItem('wishlist', JSON.stringify(filtered));
        this.toast.showSuccess('Removed from wishlist');
      }),
      catchError((err) => {
        ctx.patchState({ loading: false });
        this.toast.showError('Remove from wishlist failed');
        return of();
      })
    );
  }

  @Action(WishlistActions.Update)
  updateWishlistItem(ctx: StateContext<WishlistStateModel>, { payload }: WishlistActions.Update) {
    return this.wishlistService.updateWishlistItem(payload).pipe(
      tap(() => {
        this.toast.showSuccess('Wishlist item updated');
      }),
      catchError((err) => {
        this.toast.showError('Update failed');
        return of();
      })
    );
  }

  @Action(WishlistActions.Clear)
  clearWishlist({ setState }: StateContext<WishlistStateModel>) {
    setState({
      wishlistItems: [],
      totalItems: 0,
      loaded: false,
      loading: false
    });
    localStorage.removeItem('wishlist');
  }
}
