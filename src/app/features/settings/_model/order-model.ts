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
