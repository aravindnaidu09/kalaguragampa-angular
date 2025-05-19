export interface DeliveryOption {
  courier_company_id: string;
  courier_name: string;
  shipping_amount: string; // or number if backend always returns valid numeric value
  etd: string; // Estimated Time of Delivery
}

export interface DeliveryEstimate {
  shipping_cost: number;
  courier_name: string;
  estimated_delivery: string;
}

export interface DeliveryEstimateResponse {
  statusCode: number;
  message: string;
  data: DeliveryEstimate[];
}

