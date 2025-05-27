import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { inject, Injectable } from '@angular/core';
import { Selector, Action, StateContext, State, Store } from '@ngxs/store';
import { CartResponseItem } from '../_models/cart-item-model';
import { CartService } from '../_services/cart.service';
import { LoadCart, ClearCart, AddToCart, UpdateCartItems, LoadShippingEstimate, RemoveCartItems } from './cart.actions';
import { DeliveryService } from '../../../core/services/delivery.service';

export interface CartStateModel {
  cart: CartResponseItem | null;
  loading: boolean;
  shippingFee?: number;
  courierName?: string;
  estimatedDeliveryDays?: string;
}


@State<CartStateModel>({
  name: 'cart',
  defaults: {
    cart: null,
    loading: false,
    shippingFee: 0,
    courierName: '',
    estimatedDeliveryDays: ''
  }
})
@Injectable()
export class CartState {
  constructor(
    private cartService: CartService,
    private toast: ToastService,
    private store: Store
  ) { }

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
          // this.toast.showError('Cart data is empty or malformed.');
        }
        ctx.patchState({ loading: false });
      }),
      catchError((err) => {
        // this.toast.showError('Failed to load cart.');
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
        // this.toast.showSuccess('Cart cleared successfully.');
      }),
      catchError((err) => {
        // this.toast.showError('Failed to clear cart.');
        return of(err);
      })
    );
  }

  @Action(AddToCart)
  addToCart(ctx: StateContext<CartStateModel>, action: AddToCart): Observable<boolean> {
    return this.cartService.addToCart(action.productId, action.quantity).pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
        }
      }),
      map((res) => !!res?.data), // ✅ return true on success
      catchError((err) => {
        return of(false); // ✅ return false on failure
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

  @Action(RemoveCartItems)
  removeCartItems(ctx: StateContext<CartStateModel>, action: RemoveCartItems) {

    return this.cartService.removeCartItems(action.itemIds, action.countryCode ?? 'IND').pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
          this.store.dispatch(new LoadCart());
        } else {
          // this.toast.showError('Failed to remove selected items.');
        }
      }),
      catchError((err) => {
        // this.toast.showError('Error removing selected items from cart.');
        return of(err);
      })
    );
  }


  @Action(LoadShippingEstimate)
  loadShippingEstimate(ctx: StateContext<CartStateModel>, action: LoadShippingEstimate) {
    const deliveryService = inject(DeliveryService);

    return deliveryService.getShippingEstimate(action.payload).pipe(
      tap((estimate) => {
        if (estimate) {
          ctx.patchState({
            shippingFee: estimate.shipping_cost,
            courierName: estimate.courier_name,
            estimatedDeliveryDays: estimate.estimated_delivery
          });
        } else {
          ctx.patchState({
            shippingFee: 0,
            courierName: '',
            estimatedDeliveryDays: ''
          });
        }
      }),
      catchError((err) => {
        ctx.patchState({
          shippingFee: 0,
          courierName: '',
          estimatedDeliveryDays: ''
        });
        return of(err);
      })
    );
  }

}
