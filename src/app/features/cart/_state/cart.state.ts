import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { Injectable } from '@angular/core';
import { Selector, Action, StateContext, State } from '@ngxs/store';
import { CartResponseItem } from '../_models/cart-item-model';
import { CartService } from '../_services/cart.service';
import { LoadCart, ClearCart, AddToCart, RemoveCartItem, UpdateCartItems } from './cart.actions';

export interface CartStateModel {
  cart: CartResponseItem | null;
  loading: boolean;
}

@State<CartStateModel>({
  name: 'cart',
  defaults: {
    cart: null,
    loading: false
  }
})
@Injectable()
export class CartState {
  constructor(
    private cartService: CartService,
    private toast: ToastService
  ) {}

  @Selector()
  static cart(state: CartStateModel): CartResponseItem | null {
    return state.cart;
  }

  @Selector()
  static loading(state: CartStateModel): boolean {
    return state.loading;
  }

  @Action(LoadCart)
  loadCart(ctx: StateContext<CartStateModel>) {
    ctx.patchState({ loading: true });

    return this.cartService.getCart().pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
        } else {
          this.toast.showError('Cart data is empty or malformed.');
        }
        ctx.patchState({ loading: false });
      }),
      catchError((err) => {
        this.toast.showError('Failed to load cart.');
        ctx.patchState({ loading: false });
        return of(err);
      })
    );
  }

  @Action(ClearCart)
  clearCart(ctx: StateContext<CartStateModel>) {
    return this.cartService.clearCart().pipe(
      tap(() => {
        ctx.patchState({ cart: null });
        this.toast.showSuccess('Cart cleared successfully.');
      }),
      catchError((err) => {
        this.toast.showError('Failed to clear cart.');
        return of(err);
      })
    );
  }

  @Action(AddToCart)
  addToCart(ctx: StateContext<CartStateModel>, action: AddToCart) {
    return this.cartService.addToCart(action.productId, action.quantity).pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
          this.toast.showSuccess('Product added to cart.');
        } else {
          this.toast.showError('Failed to add product to cart.');
        }
      }),
      catchError((err) => {
        this.toast.showError('Error adding to cart.');
        return of(err);
      })
    );
  }

  @Action(UpdateCartItems)
updateCartItems(ctx: StateContext<CartStateModel>, action: UpdateCartItems) {
  return this.cartService.updateCartItems(action.items).pipe(
    tap((res) => {
      if (res?.data) {
        ctx.patchState({ cart: res.data });
        // this.toast.showSuccess('Cart updated successfully.');
      } else {
        // this.toast.showError('Failed to update cart.');
      }
    }),
    catchError((err) => {
      // this.toast.showError('Error updating cart.');
      return of(err);
    })
  );
}

  @Action(RemoveCartItem)
  removeCartItem(ctx: StateContext<CartStateModel>, action: RemoveCartItem) {
    return this.cartService.removeCartItem(action.id).pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
          // this.toast.showSuccess('Item removed from cart.');
        } else {
          // this.toast.showError('Failed to remove item.');
        }
      }),
      catchError((err) => {
        // this.toast.showError('Error removing item from cart.');
        return of(err);
      })
    );
  }
}
