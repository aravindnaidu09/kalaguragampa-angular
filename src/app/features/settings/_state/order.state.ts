import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Order } from '../_model/order-model';
import { OrderService } from '../_services/order.service';
import { LoadOrders, LoadOrdersSuccess, LoadOrdersFail } from './order.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface OrderStateModel {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

@State<OrderStateModel>({
  name: 'order',
  defaults: {
    orders: [],
    loading: false,
    error: null
  }
})
@Injectable()
export class OrderState {
  constructor(private orderService: OrderService) {}

  @Selector()
  static orders(state: OrderStateModel): Order[] {
    return state.orders;
  }

  @Selector()
  static loading(state: OrderStateModel): boolean {
    return state.loading;
  }

  @Action(LoadOrders)
  loadOrders(ctx: StateContext<OrderStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.orderService.getUserOrders().pipe(
      tap((orders) => {
        ctx.dispatch(new LoadOrdersSuccess(orders));
      }),
      catchError((error) => {
        ctx.dispatch(new LoadOrdersFail(error.message));
        return of(error);
      })
    );
  }

  @Action(LoadOrdersSuccess)
  loadOrdersSuccess(ctx: StateContext<OrderStateModel>, action: LoadOrdersSuccess) {
    ctx.patchState({ orders: action.payload, loading: false });
  }

  @Action(LoadOrdersFail)
  loadOrdersFail(ctx: StateContext<OrderStateModel>, action: LoadOrdersFail) {
    ctx.patchState({ loading: false, error: action.error });
  }
}
