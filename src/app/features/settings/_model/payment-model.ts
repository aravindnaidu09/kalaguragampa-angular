export interface PaymentMethod {
  id: number;
  cardType: string;
  last4Digits: string;
  expiry: string;
  isDefault: boolean;
}
