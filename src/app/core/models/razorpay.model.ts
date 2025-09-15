// src/app/shared/models/razorpay.model.ts
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  display_currency?: string; // e.g. 'USD'
  display_amount?: number;   // e.g. 12.34 (major units)
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
