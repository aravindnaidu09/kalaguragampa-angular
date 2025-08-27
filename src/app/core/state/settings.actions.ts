export class SetCurrency {
  static readonly type = '[Settings] Set Currency';
  constructor(public code: string) {}
}
