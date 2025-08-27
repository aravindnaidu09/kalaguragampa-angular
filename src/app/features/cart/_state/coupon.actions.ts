export class LoadAvailableCoupons {
  static readonly type = '[Coupons] Load Available';
  constructor(public payload: { addressId?: number | null; countryCode?: string }) {}
}

export class ApplyCoupon {
  static readonly type = '[Coupons] Apply';
  constructor(public payload: { code: string; countryCode: string }) {}
}

export class ClearAppliedCoupon {
  static readonly type = '[Coupons] Clear Applied';
}
