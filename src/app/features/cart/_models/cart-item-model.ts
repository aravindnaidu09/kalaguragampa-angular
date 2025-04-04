import { IProduct } from "../../product/_models/product-model";

export interface CartItem {
  product_id: number;
  quantity: number;
}

export interface CartResponseItem {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  items: Item[];
  cartTotal?: string;
  taxAmount?: string;
  shippingAmount?: string;
  discountAmount?: string;
  totalAmount?: string;
}
export interface Item {
  id?: number;
  product?: IProduct;
  quantity?: number,
  basePrice?: string,
  gstRate?: string,
  taxAmount?: string,
  subtotal?: string
}

export function deserializeItems(data: any[]): Item[] {
  return data.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    basePrice: item.base_price,
    gstRate: item.gst_rate,
    taxAmount: item.tax_amount,
    subtotal: item.subtotal,
    product: item.product ? {
      id: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      category: item.product.category,
      description: item.product.description,
      shortDescription: item.product.short_description,
      weight: Number(item.product.weight),
      minQuantity: Number(item.product.min_quantity),
      maxQuantity: Number(item.product.max_quantity),
      barcode: item.product.barcode,
      stockStatus: item.product.stock_status,
      image: item.product.image,
      price: item.product.price,
      rating: item.product.rating,
      images: item.product.images
    } : undefined
  }));
}

export function deserializeCartResponse(data: any): CartResponseItem {
  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    cartTotal: data.cart_total,
    taxAmount: data.tax_amount,
    shippingAmount: data.shipping_amount,
    discountAmount: data.discount_amount,
    totalAmount: data.total_amount,
    items: Array.isArray(data.items) ? deserializeItems(data.items) : []
  };
}
