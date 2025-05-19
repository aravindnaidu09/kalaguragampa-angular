import { IOrder } from '../_model/order-model';

// ✅ Deserialize single order
export function deserializeOrder(raw: any): IOrder {
  return {
    order_id: raw.order_id,
    status: raw.status,
    total_amount: Number(raw.total_amount),
    coupon_code: raw.coupon_code ?? null,
    coupon_discount: Number(raw.coupon_discount ?? 0),
    created_at: raw.created_at,
    delivery_date: raw.delivery_date ?? null,
    delivery_status: raw.delivery_status ?? null,
  };
}

// ✅ Deserialize array of orders
export function deserializeOrders(rawArray: any[]): IOrder[] {
  return rawArray.map(deserializeOrder);
}

// 🔁 Optional: Serialize IOrder → API format
export function serializeOrder(order: IOrder): any {
  return {
    order_id: order.order_id,
    status: order.status,
    total_amount: order.total_amount,
    coupon_code: order.coupon_code,
    coupon_discount: order.coupon_discount,
    created_at: order.created_at,
    delivery_date: order.delivery_date,
    delivery_status: order.delivery_status
  };
}
