import { Injectable, computed, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  LoadCart,
  ClearCart,
  AddToCart,
  UpdateCartItem,
  RemoveCartItem
} from './cart.actions';
import { CartState } from './cart.state';

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

  addToCart(productId: number, quantity: number = 1): void {
    this.store.dispatch(new AddToCart(productId, quantity));
  }

  updateCartItem(id: string, item: any): void {
    this.store.dispatch(new UpdateCartItem(id, item));
  }

  removeCartItem(id: string): void {
    this.store.dispatch(new RemoveCartItem(id));
  }
}
