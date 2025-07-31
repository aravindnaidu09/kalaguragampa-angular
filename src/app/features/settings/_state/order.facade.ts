import { Injectable, computed, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { OrderState } from './order.state';
import { CancelOrder, LoadOrders } from './order.actions';

@Injectable({ providedIn: 'root' })
export class OrderFacade {
  private store = inject(Store);

  readonly ordersSignal = this.store.selectSignal(OrderState.orders);
  readonly loadingSignal = this.store.selectSignal(OrderState.loading);
  readonly totalCountSignal = this.store.selectSignal(OrderState.totalCount);

  loadOrdersWithFilters(filters: {
    limit: number;
    offset: number;
    range?: string;
    year?: string;
    status?: string;
  }) {
    return this.store.dispatch(new LoadOrders(filters));
  }

  cancelOrder(deliveryId: number) {
    return this.store.dispatch(new CancelOrder(deliveryId));
  }

  updateTrackingSignal(newStatus: any) {
    this.store.reset({
      ...this.store.snapshot(),
      track: {
        ...this.store.snapshot().track,
        status: newStatus
      }
    });
  }

  orderById = (id: number) =>
    computed(() => this.ordersSignal().find(order => order.order_id === id));
}
