import { environment } from "../../../../environments/environment.dev";

export const CHECKOUT_API_URLS = {
  createCheckout: `${environment.apiBaseUrl}/checkout/create`,
  getCheckoutStatus: `${environment.apiBaseUrl}/checkout/status/:id`
};
