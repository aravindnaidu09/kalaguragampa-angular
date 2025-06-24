export class ApplyCoupon {
  static readonly type = '[Coupon] Apply';
  constructor(public payload: { coupon_code: string; country_code?: string }) {}
}
