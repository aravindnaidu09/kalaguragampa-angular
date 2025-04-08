import { ReviewFormData, ReviewProductInfo } from "../_models/add-review.model";

export class SubmitReview {
  static readonly type = '[Review] Submit Review';
  constructor(public id: number, public payload: ReviewFormData) {}
}

export class SubmitReviewSuccess {
  static readonly type = '[Review] Submit Review Success';
}

export class SubmitReviewFailure {
  static readonly type = '[Review] Submit Review Failure';
  constructor(public error: string) {}
}

export class ResetReviewState {
  static readonly type = '[Review] Reset';
}

export class LoadProductById {
  static readonly type = '[Review] Load Product By ID';
  constructor(public productId: string) {}
}

export class LoadProductByIdSuccess {
  static readonly type = '[Review] Load Product Success';
  constructor(public product: ReviewProductInfo) {}
}

export class LoadProductByIdFailure {
  static readonly type = '[Review] Load Product Failure';
  constructor(public error: string) {}
}
