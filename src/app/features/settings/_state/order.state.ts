// ✅ order.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { IOrder } from '../_model/order-model';
import { OrderService } from '../_services/order.service';
import { LoadOrders, LoadOrdersSuccess, LoadOrdersFail, CancelOrder } from './order.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface OrderStateModel {
  orders: IOrder[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

@State<OrderStateModel>({
  name: 'order',
  defaults: {
    orders: [],
    loading: false,
    error: null,
    totalCount: 0
  }
})
@Injectable()
export class OrderState {
  constructor(private orderService: OrderService) { }

  @Selector()
  static orders(state: OrderStateModel): IOrder[] {
    return state.orders;
  }

  @Selector()
  static loading(state: OrderStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static totalCount(state: OrderStateModel): number {
    return state.totalCount;
  }

  @Action(LoadOrders)
  loadOrders(ctx: StateContext<OrderStateModel>, action: LoadOrders) {
    ctx.patchState({ loading: true, error: null });
    return this.orderService.getUserOrders(action.filters).pipe(
      tap((res) => {
        ctx.dispatch(new LoadOrdersSuccess({ orders: res.results, count: res.count }));
      }),
      catchError((error) => {
        ctx.dispatch(new LoadOrdersFail(error.message));
        return of(error);
      })
    );
  }


  @Action(LoadOrdersSuccess)
  loadOrdersSuccess(ctx: StateContext<OrderStateModel>, action: LoadOrdersSuccess) {
    ctx.patchState({
      orders: action.payload.orders,
      totalCount: action.payload.count,
      loading: false
    });
  }


  @Action(LoadOrdersFail)
  loadOrdersFail(ctx: StateContext<OrderStateModel>, action: LoadOrdersFail) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(CancelOrder)
  cancelOrder(ctx: StateContext<OrderStateModel>, action: CancelOrder) {
    ctx.patchState({ loading: true });

    return this.orderService.cancelOrder(action.id).pipe(
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error?.message || 'Failed to cancel order'
        });
        return of(error);
      })
    );
  }
}
