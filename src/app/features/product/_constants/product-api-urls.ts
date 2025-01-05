import { environment } from "../../../../environments/environment.dev";

export const PRODUCT_API_URLS = {
  getProductList: `${environment.apiBaseUrl}/products`,
  getProductDetails: `${environment.apiBaseUrl}/products/:id`
};
