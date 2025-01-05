import { environment } from "../../../../environments/environment.dev";

export const CART_API_URLS = {
  createCart: `${environment.apiBaseUrl}/cart/create`,
  getCartStatus: `${environment.apiBaseUrl}/cart/status/:id`
};
