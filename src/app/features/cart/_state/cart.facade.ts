import { Injectable, computed, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  LoadCart,
  ClearCart,
  AddToCart,
  RemoveCartItem,
  UpdateCartItems
} from './cart.actions';
import { CartState } from './cart.state';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartFacade {
  private store = inject(Store);

  readonly cartSignal = this.store.selectSignal(CartState.cart);
  readonly loadingSignal = this.store.selectSignal(CartState.loading);

  // ✅ computed count based on cart items
  readonly countSignal = computed(() => this.cartSignal()?.items?.length ?? 0);

  loadCart(): void {
    this.store.dispatch(new LoadCart());
  }

  clearCart(): void {
    this.store.dispatch(new ClearCart());
  }

  addToCart(productId: number, quantity: number = 1): Observable<boolean> {
    return this.store.dispatch(new AddToCart(productId, quantity)).pipe(
      switchMap(() => this.store.selectOnce(CartState.cart)), // optional if you want to verify result
      map((cart) => !!cart), // ✅ confirm presence of cart or simply return true earlier
      catchError(() => of(false))
    );
  }

  updateCartItems(items: { id: number; quantity: number }[]): Observable<any> {
    return this.store.dispatch(new UpdateCartItems(items));
  }

  removeCartItem(id: number): void {
    this.store.dispatch(new RemoveCartItem(id));
  }
}
