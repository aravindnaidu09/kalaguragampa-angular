export interface IProductImage {
  product: number;
  image: string;
  is_primary: boolean;
}


export function deserializeProductImage(data: any): IProductImage {
  return {
    product: data.product || 0,
    image: data.image || '',
    is_primary: data.is_primary ?? false,
  };
}
