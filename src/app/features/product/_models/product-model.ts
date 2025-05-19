import { Images } from "./images-model";

export interface IProduct {
  id?: number;
  name?: string;
  sku?: string;
  categoryName?: string;
  categoryId?: number;
  description?: string;
  shortDescription?: string;
  weight?: number;
  minQuantity?: number;
  maxQuantity?: number;
  barcode?: string;
  stockStatus?: string;
  image?: string;
  price?: string;
  rating?: string;
  reviewsCount?: string;
  images?: Images[];
  isAddedToWishlist?: boolean;
}

export function deserializeProducts(data: any[]): IProduct[] {
  return data.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    categoryName: product.category,
    categoryId: product.category_id,
    description: product.description,
    shortDescription: product.short_description,
    weight: Number(product.weight),
    minQuantity: Number(product.min_quantity),
    maxQuantity: Number(product.max_quantity),
    barcode: product.barcode,
    stockStatus: product.stock_status,
    image: product.image,
    price: product.price,
    rating: product.rating,
    images: product.images,
    reviewsCount: product.reviews_count
  }));
}


export function deserializeProduct(data: any): IProduct {
  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    categoryName: data.category,
    categoryId: data.category_id,
    description: data.description,
    shortDescription: data.short_description,
    weight: Number(data.weight),
    minQuantity: Number(data.min_quantity),
    maxQuantity: Number(data.max_quantity),
    barcode: data.barcode,
    stockStatus: data.stock_status,
    image: data.image,
    price: data.price,
    rating: data.rating,
    images: data.images,
    reviewsCount: data.reviews_count
  };
}
