export class LoadCart {
  static readonly type = '[Cart] Load Cart';
}

export class ClearCart {
  static readonly type = '[Cart] Clear Cart';
}

export class AddToCart {
  static readonly type = '[Cart] Add To Cart';
  constructor(public productId: number, public quantity: number = 1) {}
}

export class UpdateCartItems {
  static readonly type = '[Cart] Update Multiple Items';
  constructor(public items: { id: number; quantity: number }[]) {}
}

export class RemoveCartItems {
  static readonly type = '[Cart] Remove Multiple Cart Items';
  constructor(public itemIds: number[], public countryCode?: string) {}
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
  }) {}
}

