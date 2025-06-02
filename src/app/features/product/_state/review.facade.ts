import { inject, Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  SubmitReview,
  ResetReviewState,
  LoadProductById,
  SetReviewProduct
} from './review.actions';
import { ReviewState } from './review.state';
import { ReviewFormData, ReviewProductInfo } from '../_models/add-review.model';

@Injectable({ providedIn: 'root' })
export class ReviewFacade {
  private store = inject(Store);

  loading$ = this.store.select(ReviewState.isLoading);
  error$ = this.store.select(ReviewState.hasError);
  submitted$ = this.store.select(ReviewState.isSubmitted);
  product$ = this.store.select(ReviewState.product);


  submitReview(id: number, data: ReviewFormData) {
    this.store.dispatch(new SubmitReview(id, data));
  }

  reset() {
    this.store.dispatch(new ResetReviewState());
  }

  loadProductById(id: string) {
    this.store.dispatch(new LoadProductById(id));
  }

  setProduct(product: ReviewProductInfo) {
    this.store.dispatch(new SetReviewProduct(product));
  }
}
