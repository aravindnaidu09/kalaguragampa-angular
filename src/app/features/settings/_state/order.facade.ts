import { Injectable, computed, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { OrderState } from './order.state';
import { LoadOrders } from './order.actions';

@Injectable({ providedIn: 'root' })
export class OrderFacade {
  private store = inject(Store);

  readonly ordersSignal = this.store.selectSignal(OrderState.orders);
  readonly loadingSignal = this.store.selectSignal(OrderState.loading);

  loadOrders() {
    this.store.dispatch(new LoadOrders());
  }

  orderById = (id: number) =>
    computed(() => this.ordersSignal().find(order => order.order_id === id));
}
