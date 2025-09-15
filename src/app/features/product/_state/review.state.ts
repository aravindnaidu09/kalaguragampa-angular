// review.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import {
  SubmitReview, SubmitReviewFailure, SubmitReviewSuccess, ResetReviewState,
  // LoadProductById, LoadProductByIdSuccess, LoadProductByIdFailure,  <-- remove these
  SetReviewProduct
} from './review.actions';
import { ReviewProductInfo } from '../_models/add-review.model';
import { ReviewService } from '../_services/review.service';

export interface ReviewStateModel {
  loading: boolean;
  error: string | null;
  submitted: boolean;
  product: ReviewProductInfo | null;
}

@State<ReviewStateModel>({
  name: 'review',
  defaults: { loading: false, error: null, submitted: false, product: null }
})
@Injectable()
export class ReviewState {
  constructor(private reviewService: ReviewService) {}

  // Selectors
  @Selector() static isLoading(s: ReviewStateModel)     { return s.loading; }
  @Selector() static errorMessage(s: ReviewStateModel)  { return s.error; }       // string|null
  @Selector() static isSubmitted(s: ReviewStateModel)   { return s.submitted; }
  @Selector() static product(s: ReviewStateModel)       { return s.product; }

  // Submit Review
  @Action(SubmitReview)
  submitReview(ctx: StateContext<ReviewStateModel>, a: SubmitReview) {
    ctx.patchState({ loading: true, error: null, submitted: false });
    return this.reviewService.addReview(a.id, a.payload).pipe(
      tap(() => ctx.dispatch(new SubmitReviewSuccess())),
      catchError(err => {
        ctx.dispatch(new SubmitReviewFailure(err?.message || 'Submit failed'));
        return EMPTY;
      })
    );
  }

  @Action(SubmitReviewSuccess)
  submitSuccess(ctx: StateContext<ReviewStateModel>) {
    ctx.patchState({ loading: false, submitted: true, error: null });
  }

  @Action(SubmitReviewFailure)
  submitFailure(ctx: StateContext<ReviewStateModel>, a: SubmitReviewFailure) {
    ctx.patchState({ loading: false, error: a.error, submitted: false });
  }

  @Action(ResetReviewState)
  reset(ctx: StateContext<ReviewStateModel>) {
    ctx.setState({ loading: false, error: null, submitted: false, product: null });
  }

  @Action(SetReviewProduct)
  setProduct(ctx: StateContext<ReviewStateModel>, a: SetReviewProduct) {
    ctx.patchState({ product: a.product });
  }

  // ⛔️ Remove LoadProductById handlers entirely
}
