// This file defines the IOrder interface for the order model.
export interface IOrder {
    awb_code?: string;
    color?: string;
    coupon_code: string | null;
    coupon_discount: number;
    created_at: string;    // ISO 8601 string
    delivery_date: string | null;    // ISO or null if not delivered yet
    delivery_id?: number;
    delivery_status: string | null;    // Optional, e.g. "in_transit", "failed", etc.
    image?: string;
    is_international?: boolean;
    is_rated?: boolean;
    order_id: number;
    order_status?: string;
    product: IOrderProduct[];
    product_name?: string;
    quantity?: number;
    receipt?: string;
    shipment_number?: number
    status: string;    // adjust if backend adds more
    total_amount: number;
}

export interface IOrderProduct {
    color?: string;
    id: number;
    images?: string[];
    is_rated?: boolean;
    name: string;
    qty?: number;
    quantity?: number;
    sku: string;
}
