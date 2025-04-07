import { Order } from "../_model/order-model";

// ✅ order.actions.ts
export class LoadOrders {
  static readonly type = '[Order] Load Orders';
}

export class LoadOrdersSuccess {
  static readonly type = '[Order] Load Orders Success';
  constructor(public payload: Order[]) {}
}

export class LoadOrdersFail {
  static readonly type = '[Order] Load Orders Fail';
  constructor(public error: any) {}
}
