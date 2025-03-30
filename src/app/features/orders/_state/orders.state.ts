import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Order } from '../../settings/_model/order-model';
import { OrderService } from '../../settings/_services/order.service';
import { LoadOrders } from './orders.action';

export interface OrderStateModel {
  orders: Order[];
}

@State<OrderStateModel>({
  name: 'orders',
  defaults: {
    orders: []
  }
})
@Injectable()
export class OrderState {
  constructor(private orderService: OrderService) {}

  @Selector()
  static getOrders(state: OrderStateModel): Order[] {
    return state.orders;
  }

  @Action(LoadOrders)
  loadOrders(ctx: StateContext<OrderStateModel>) {
    return this.orderService.getOrders().pipe(
      tap((orders) => ctx.patchState({ orders }))
    );
  }
}
