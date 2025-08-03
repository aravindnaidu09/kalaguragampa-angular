export interface IProductReview {
  id?: number;
  user?: number;
  fullName?: string;
  product?: number;
  rating?: number;
  comment?: string;
  createdAt?: Date;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  notHelpfulCount?: number;
}

export function deserializeProductReview(data: any): IProductReview {
  return {
    id: data.id,
    user: data.user,
    fullName: data.full_name,
    product: data.product,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(data.created_at),
    verifiedPurchase: data.verified_purchase,
    helpfulCount: data.helpful_count ?? 0,
    notHelpfulCount: data.not_helpful_count ?? 0
  };
}
