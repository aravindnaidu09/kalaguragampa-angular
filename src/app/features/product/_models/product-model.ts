export interface IProduct {
  id: string;
  name: string;
  sku: string;
  category: number;
  description: string;
  shortDescription: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
  barcode: string;
  stockStatus: string;
  image: string;
  price: string;
  rating: string;
}

export function deserializeProducts(data: any[]): IProduct[] {
  return data.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description,
    shortDescription: product.short_description,
    weight: Number(product.weight),
    minQuantity: Number(product.min_quantity),
    maxQuantity: Number(product.max_quantity),
    barcode: product.barcode,
    stockStatus: product.stock_status,
    image: product.image,
    price: product.price,
    rating: product.rating
  }));
}


export function deserializeProduct(data: any): IProduct {
  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    description: data.description,
    shortDescription: data.short_description,
    weight: Number(data.weight),
    minQuantity: Number(data.min_quantity),
    maxQuantity: Number(data.max_quantity),
    barcode: data.barcode,
    stockStatus: data.stock_status,
    image: data.image,
    price: data.price,
    rating: data.rating
  };
}
