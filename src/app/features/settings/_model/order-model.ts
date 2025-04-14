export interface OrderItem {
  id?: number;
  productId?: number;
  productName?: string;
  image?: string;
  color?: string;
  price?: number;
  quantity?: number;
  isRated?: boolean;
  status?: 'Delivered' | 'Pending' | 'Cancelled';
  deliveryDate?: string
}

export interface Order {
  id: number;
  total: number;
  date: string; // ISO string
  deliveryDate: string; // ISO string
  status: 'Delivered' | 'Pending' | 'Cancelled';
  shippingAddress: string;
  items: OrderItem[];
}

export interface IOrder {
  order_id: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; // Add more as needed
  total_amount: number;
  coupon_code: string | null;
  coupon_discount: number;
  created_at: string; // ISO string format
  delivery_date: string | null; // ISO string or null
  delivery_status: string | null;
}

