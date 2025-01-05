import { environment } from "../../../../environments/environment.dev";

export const ORDER_API_URLS = {
  createOrder: `${environment.apiBaseUrl}/orders/create`,
  getOrderStatus: `${environment.apiBaseUrl}/orders/status/:id`
};
