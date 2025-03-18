import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CartItem } from '../../cart/_models/cart-item-model';

// ✅ Actions
export class AddToCart {
  static readonly type = '[Cart] Add Item';
  constructor(public payload: CartItem) {}
}

export class RemoveFromCart {
  static readonly type = '[Cart] Remove Item';
  constructor(public productId: number) {}
}

export class ClearCart {
  static readonly type = '[Cart] Clear Cart';
}

// ✅ Cart State Model
export interface CartStateModel {
  cartItems: CartItem[];
  totalItems: number;
}

// ✅ Initial State
@State<CartStateModel>({
  name: 'cart',
  defaults: {
    cartItems: [],
    totalItems: 0
  }
})
@Injectable()
export class CartState {

  // ✅ Selector to get cart items
  @Selector()
  static getCart(state: CartStateModel) {
    return state.cartItems;
  }

  // ✅ Selector to get cart count (for badge updates)
  @Selector()
  static getCartCount(state: CartStateModel) {
    return state.totalItems;
  }

  // ✅ Add to Cart
  @Action(AddToCart)
  addToCart({ getState, patchState }: StateContext<CartStateModel>, { payload }: AddToCart) {
    const state = getState();
    patchState({
      cartItems: [...state.cartItems, payload],
      totalItems: state.totalItems + payload.quantity
    });
  }

  // ✅ Remove from Cart
  @Action(RemoveFromCart)
  removeFromCart({ getState, patchState }: StateContext<CartStateModel>, { productId }: RemoveFromCart) {
    const state = getState();
    patchState({
      cartItems: state.cartItems.filter(item => item.product_id !== productId),
      totalItems: Math.max(0, state.totalItems - 1) // Decrease count safely
    });
  }

  // ✅ Clear Cart (Logout or Manual)
  @Action(ClearCart)
  clearCart({ setState }: StateContext<CartStateModel>) {
    setState({
      cartItems: [],
      totalItems: 0
    });
  }
}
