export class LoadTrackingInfo {
  static readonly type = '[TrackOrder] Load';
  constructor(public deliveryId: number) {}
}
