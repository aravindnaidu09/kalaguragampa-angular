export class LoadCart {
  static readonly type = '[Cart] Load Cart';
  constructor(public addressId?: number, public countryCode: string = 'IND', public opts?: { silent?: boolean; captureError?: boolean } ) { }
}

export class ClearCart {
  static readonly type = '[Cart] Clear Cart';
}

export class AddToCart {
  static readonly type = '[Cart] Add To Cart';
  constructor(public productId: number, public quantity: number = 1) { }
}

export class UpdateCartItems {
  static readonly type = '[Cart] Update Multiple Items';
  constructor(public items: { id: number; quantity: number }[]) { }
}

export class RemoveCartItems {
  static readonly type = '[Cart] Remove Multiple Cart Items';
  constructor(public itemIds: number[], public countryCode?: string) { }
}

export class LoadShippingEstimate {
  static readonly type = '[Cart] Load Shipping Estimate';
  constructor(public payload: {
    address_id?: number | string;
    city?: string;
    country?: string;
    country_code?: string;
    pincode?: string;
    state?: string;
  }) { }
}

/** Triggers a revalidation of the currently applied coupon against the latest cart. */
export class RevalidateCoupon {
  static readonly type = '[Coupons] Revalidate';
  constructor(public payload: { silent?: boolean } = {}) { }
}

/** Clears any applied coupon from state (and storage, if NGXS storage plugin is used). */
export class ClearAppliedCoupon {
  static readonly type = '[Coupons] Clear Applied';
}


