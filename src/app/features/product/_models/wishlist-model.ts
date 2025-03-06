export interface IWishlist {
  id: number;
  product: number;
  createdAt: Date;
  name?: string;
  price?: string;
  image?: string;
}

export function deserializeWishlist(data: any[]): IWishlist[] {
  return data.map((item) => ({
    id: item.id,
    product: item.product,
    createdAt: new Date(item.created_at),
  }));
}
