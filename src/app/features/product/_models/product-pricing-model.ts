export interface IProductPricing {
  product: number;
  country: number;
  price: number;
  tax: string;
  hsnCode: number;
}

export function deserializeProductPricing(data: any): IProductPricing {
  return {
    product: data.product,
    country: data.country,
    price: Number(data.price),  // Ensure price is a number
    tax: data.tax,
    hsnCode: Number(data.hsn_code), // Convert hsn_code to number
  };
}
