import { Injectable, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { ReviewFormData, ReviewProductInfo } from "../_models/add-review.model";
import { SubmitReview, ResetReviewState, SetReviewProduct } from "./review.actions";
import { ReviewState } from "./review.state";

// review.facade.ts
@Injectable({ providedIn: 'root' })
export class ReviewFacade {
  private store = inject(Store);

  loading$   = this.store.select(ReviewState.isLoading);
  error$     = this.store.select(ReviewState.errorMessage); // string|null
  submitted$ = this.store.select(ReviewState.isSubmitted);
  product$   = this.store.select(ReviewState.product);

  submitReview(id: number, data: ReviewFormData) {
    return this.store.dispatch(new SubmitReview(id, data));
  }

  reset() {
    return this.store.dispatch(new ResetReviewState());
  }

  // ⛔️ Remove loadProductById — not needed for review submit
  setProduct(product: ReviewProductInfo) {
    return this.store.dispatch(new SetReviewProduct(product));
  }
}
