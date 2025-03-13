import { IProduct } from "./product-model";

export interface IWishlist {
  id: number;
  productDetails: IProduct;
  image?: string;
}

export function deserializeWishlist(data: any[]): IWishlist[] {
  return data.map((item) => ({
    id: item.id,
    productDetails: item.product_details,
    createdAt: new Date(item.created_at),
  }));
}
