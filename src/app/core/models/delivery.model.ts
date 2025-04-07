export interface DeliveryOption {
  courier_company_id: string;
  courier_name: string;
  shipping_amount: string; // or number if backend always returns valid numeric value
  etd: string; // Estimated Time of Delivery
}
