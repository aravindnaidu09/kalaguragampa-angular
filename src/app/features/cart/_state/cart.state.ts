import { catchError, map, tap } from 'rxjs/operators';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { Injectable, inject } from '@angular/core';
import { Selector, Action, StateContext, State, Store } from '@ngxs/store';
import { CartResponseItem } from '../_models/cart-item-model';
import { CartService } from '../_services/cart.service';
import { LoadCart, ClearCart, AddToCart, UpdateCartItems, LoadShippingEstimate, RemoveCartItems, ClearAppliedCoupon, RevalidateCoupon } from './cart.actions';
import { DeliveryService } from '../../../core/services/delivery.service';

// ⬇️ Revalidation/clear actions from Coupons feature

export interface CartStateModel {
  cart: CartResponseItem | null;
  loading: boolean;
  shippingFee?: number;
  courierName?: string;
  estimatedDeliveryDays?: string;
  shippingError: string | null;
}

@State<CartStateModel>({
  name: 'cart',
  defaults: {
    cart: null,
    loading: false,
    shippingFee: 0,
    courierName: '',
    estimatedDeliveryDays: '',
    shippingError: null
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

  @Selector()
  static shippingError(s: CartStateModel) {
    return s.shippingError;
  }

  /** Small helper so we don't duplicate dispatches everywhere */
  private triggerRevalidation(silent: boolean = true): void {
    this.store.dispatch(new RevalidateCoupon({ silent }));
  }

  @Action(LoadCart)
  loadCart(ctx: StateContext<CartStateModel>, action: LoadCart) {
    const { addressId, countryCode, opts } = action;
    const silent = !!opts?.silent;
    const captureError = !!opts?.captureError;
    const ignoreAddress = !!opts?.ignoreAddress;

    ctx.patchState({ loading: true });

    const effectiveAddressId = ignoreAddress ? undefined : addressId;

    return this.cartService.getCart(effectiveAddressId, countryCode, { silent }).pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data, loading: false, shippingError: null });
          this.triggerRevalidation(true);
        } else {
          ctx.patchState({ loading: false });
        }
      }),
      catchError((err) => {
        if (captureError) {
          const msg = err?.error?.message ?? err?.message ?? 'Unable to load cart.';
          ctx.patchState({ loading: false, shippingError: msg });
          return throwError(() => err);
        }
        ctx.patchState({ loading: false });
        return silent ? EMPTY : throwError(() => err);
      })
    );
  }


  @Action(ClearCart)
  clearCart({ setState }: StateContext<CartStateModel>) {
    setState({
      cart: null,
      loading: false,
      shippingFee: undefined,
      courierName: undefined,
      estimatedDeliveryDays: undefined,
      shippingError: null
    });
    // ⬇️ If the cart is cleared, also clear any applied coupon
    this.store.dispatch(new ClearAppliedCoupon());
  }

  @Action(AddToCart)
  addToCart(ctx: StateContext<CartStateModel>, action: AddToCart): Observable<boolean> {
    return this.cartService.addToCart(action.productId, action.quantity).pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
          // ⬇️ Cart changed → revalidate coupon
          this.triggerRevalidation(true);
        }
      }),
      map((res) => !!res?.data),
      catchError(() => of(false))
    );
  }

  @Action(UpdateCartItems)
  updateCartItems(ctx: StateContext<CartStateModel>, action: UpdateCartItems) {
    return this.cartService.updateCartItems(action.items).pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
          // ⬇️ Cart changed → revalidate coupon
          this.triggerRevalidation(true);
        }
      }),
      catchError((err) => of(err))
    );
  }

  @Action(RemoveCartItems)
  removeCartItems(ctx: StateContext<CartStateModel>, action: RemoveCartItems) {
    return this.cartService.removeCartItems(action.itemIds, action.countryCode ?? 'IND').pipe(
      tap((res) => {
        if (res?.data) {
          ctx.patchState({ cart: res.data });
          // ⬇️ Cart changed → revalidate coupon
          this.triggerRevalidation(true);

          // NOTE: you previously dispatched LoadCart() here. That causes an extra HTTP call
          // and will also trigger revalidation again in loadCart. If you still want a full
          // reload from backend, uncomment the next line, but expect double revalidation.
          // this.store.dispatch(new LoadCart());
        }
      }),
      catchError((err) => of(err))
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

        // ⬇️ Shipping/country/pincode changes can affect coupon eligibility → revalidate
        this.triggerRevalidation(true);
      }),
      catchError((err) => {
        ctx.patchState({
          shippingFee: 0,
          courierName: '',
          estimatedDeliveryDays: ''
        });
        // still revalidate, as the shipping context effectively changed/failed
        this.triggerRevalidation(true);
        return of(err);
      })
    );
  }
}
