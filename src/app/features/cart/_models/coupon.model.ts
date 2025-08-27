export interface Coupon {
  id: number;
  code: string;
  description: string;
  coupon_type: 'percentage' | 'flat' | string;
  discount_value: number;          // e.g. 10 for 10% or ₹10
  min_order_value: number;         // minimum order to qualify
  max_discount?: number | null;    // cap for percentage coupons
  use_type?: string;               // e.g. 'one time'
  start_date?: string | null;
  end_date?: string | null;
  eligible?: string | null;        // some backends return string 'true/false' or message
  ineligible_reason?: string | null;
  discount_preview?: string | null;// human friendly preview
  is_personal?: string | null;     // e.g. 'Y'/'N'
}

export interface GetAvailableCouponsQuery {
  address_id?: number | null;      // shipping address context for tax/shipping
  country_code?: string;           // defaults to 'IND' on the backend
}

export interface ApplyCouponRequest {
  coupon_code: string;
  country_code: string;            // 'IND'
}

/** Your POST swagger shows `{}` on 200; treat as side-effect (cart/totals updated server-side).
 *  Keep this to allow future enrichment without breaking callers. */
export interface ApplyCouponResponse {
  success?: boolean;
  message?: string;
  code?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'flat' | string;
}

export interface AppliedCoupon {
  code: string;
  country: string;           // 'IND'
  amount: number;            // discount for the CURRENT cart

  // Optional but very useful:
  finalTotal?: number;       // from apply API (if present) - snapshot only
  cartId?: number | null;    // cart_data.id from apply API if provided
  fingerprint?: string;      // hash of items/qty to detect cart changes
  active: boolean;           // set true on valid apply/revalidate, false if cart no longer qualifies
  appliedAt: number;         // Date.now()
  expiresAt?: number;        // TTL if you want auto-expiry (e.g., Date.now() + 7d)
}
