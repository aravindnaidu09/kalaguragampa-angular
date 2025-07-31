import { IOrder } from "../_model/order-model";

export class LoadOrders {
  static readonly type = '[Order] Load Orders';
  constructor(
    public filters: {
      limit: number;
      offset: number;
      range?: string;
      year?: string;
      status?: string;
    }
  ) {}
}

export class LoadOrdersSuccess {
  static readonly type = '[Order] Load Orders Success';
  constructor(
    public payload: {
      orders: IOrder[];
      count: number;
    }
  ) {}
}

export class LoadOrdersFail {
  static readonly type = '[Order] Load Orders Fail';
  constructor(public error: any) {}
}

export class CancelOrder {
  static readonly type = '[TrackOrder] Cancel';
  constructor(public deliveryId: number) {}
}
