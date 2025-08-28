export class LoadTrackingInfo {
  static readonly type = '[TrackOrder] Load';
  constructor(public deliveryId: number) {}
}

export class ClearTrackingInfo {
  static readonly type = '[TrackOrder] Clear';
  constructor(public deliveryId?: number) {}
}
