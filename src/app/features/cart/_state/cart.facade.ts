// ✅ Reusable Angular Facade Template (with NGXS + Toast + Signals)

import { Injectable, inject, computed, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CartState } from './cart.state';
import { AddToCart, ClearCart, LoadCart, LoadShippingEstimate, RemoveCartItems, UpdateCartItems } from './cart.actions';
import { CartResponseItem } from '../_models/cart-item-model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class CartFacade {
  private store = inject(Store);
  private toast = inject(ToastService);

  readonly cartSignal = this.store.selectSignal(CartState.cart);
  readonly loadingSignal = this.store.selectSignal(CartState.loading);

  readonly countSignal = computed(() => this.cartSignal()?.items?.length ?? 0);

  readonly shippingFeeSignal = this.store.selectSignal((state) => state.cart.shippingFee ?? 0);
  readonly courierNameSignal = this.store.selectSignal((state) => state.cart.courierName ?? '');
  readonly estimatedDeliveryDaysSignal = this.store.selectSignal((state) => state.cart.estimatedDeliveryDays ?? '');

  loadCart(): void {
    this.store.dispatch(new LoadCart());
  }

  clearCart(): void {
    this.store.dispatch(new ClearCart());
  }

  addToCart(productId: number, quantity: number = 1): Observable<boolean> {
    return this.store.dispatch(new AddToCart(productId, quantity)).pipe(
      switchMap(() => this.store.selectOnce(CartState.cart)),
      map(cart => !!cart),
      tap(success => {
        if (success) this.toast.showSuccess('Item added to cart');
        else this.toast.showError('Failed to add item');
      }),
      catchError(() => {
        this.toast.showError('Unexpected error');
        return of(false);
      })
    );
  }

  updateCartItems(items: { id: number; quantity: number }[]): Observable<boolean> {
    return this.store.dispatch(new UpdateCartItems(items)).pipe(
      tap(() => this.toast.showSuccess('Cart updated successfully')),
      map(() => true),
      catchError(() => {
        this.toast.showError('Failed to update cart');
        return of(false);
      })
    );
  }

  removeCartItems(itemIds: number[], countryCode: string = 'IND'): Observable<boolean> {
    return this.store.dispatch(new RemoveCartItems(itemIds, countryCode)).pipe(
      tap(() => this.toast.showSuccess('Selected items removed from cart')),
      map(() => true),
      catchError(() => {
        this.toast.showError('Failed to remove selected items');
        return of(false);
      })
    );
  }


  loadShippingEstimate(payload: {
    address_id?: number | string;
    city?: string;
    country?: string;
    country_code?: string;
    pincode?: string;
    state?: string;
  }) {
    this.store.dispatch(new LoadShippingEstimate(payload));
  }
}

// ℹ️ Use actions.ts and state.ts patterns that return predictable responses from state for composable facades.
