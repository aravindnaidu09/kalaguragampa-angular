// This file defines the IOrder interface for the order model.
export interface IOrder {
  order_id: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; // adjust if backend adds more
  total_amount: number;
  coupon_code: string | null;
  coupon_discount: number;
  created_at: string;           // ISO 8601 string
  delivery_date: string | null; // ISO or null if not delivered yet
  delivery_status: string | null; // Optional, e.g. "in_transit", "failed", etc.
  delivery_id?: number;
  product_name?: string;
  image?: string;
  is_rated?: boolean;
  color?: string;
  quantity?: number;
  product: IOrderProduct[];
}

export interface IOrderProduct {
  id: number;
  name: string;
  sku: string;
  images?: string[];
  quantity?: number;
  color?: string;
  is_rated?: boolean;
  qty?: number;
}
