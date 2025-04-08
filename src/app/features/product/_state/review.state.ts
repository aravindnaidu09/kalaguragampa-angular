import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  SubmitReview, SubmitReviewFailure, SubmitReviewSuccess, ResetReviewState,
  LoadProductById, LoadProductByIdSuccess, LoadProductByIdFailure
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
  defaults: {
    loading: false,
    error: null,
    submitted: false,
    product: null
  }
})
@Injectable()
export class ReviewState {
  constructor(private reviewService: ReviewService) {}

  @Selector()
  static isLoading(state: ReviewStateModel) {
    return state.loading;
  }

  @Selector()
  static hasError(state: ReviewStateModel) {
    return !!state.error;
  }

  @Selector()
  static isSubmitted(state: ReviewStateModel) {
    return state.submitted;
  }

  @Selector()
  static product(state: ReviewStateModel) {
    return state.product;
  }

  @Action(SubmitReview)
  submitReview(ctx: StateContext<ReviewStateModel>, action: SubmitReview) {
    ctx.patchState({ loading: true, error: null, submitted: false });
    return this.reviewService.addReview(action.id, action.payload).pipe(
      tap(() => ctx.dispatch(new SubmitReviewSuccess())),
      catchError(err => {
        ctx.dispatch(new SubmitReviewFailure(err?.message || 'Submit failed'));
        return of();
      })
    );
  }

  @Action(SubmitReviewSuccess)
  submitSuccess(ctx: StateContext<ReviewStateModel>) {
    ctx.patchState({ loading: false, submitted: true });
  }

  @Action(SubmitReviewFailure)
  submitFailure(ctx: StateContext<ReviewStateModel>, action: SubmitReviewFailure) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(ResetReviewState)
  reset(ctx: StateContext<ReviewStateModel>) {
    ctx.setState({ loading: false, error: null, submitted: false, product: null });
  }

  // @Action(LoadProductById)
  // loadProduct(ctx: StateContext<ReviewStateModel>, action: LoadProductById) {
  //   ctx.patchState({ loading: true, error: null });
  //   return this.reviewService.getProductById(action.productId).pipe(
  //     tap((product: ReviewProductInfo) => ctx.dispatch(new LoadProductByIdSuccess(product))),
  //     catchError(err => {
  //       ctx.dispatch(new LoadProductByIdFailure(err?.message || 'Product not found'));
  //       return of();
  //     })
  //   );
  // }

  @Action(LoadProductByIdSuccess)
  loadProductSuccess(ctx: StateContext<ReviewStateModel>, action: LoadProductByIdSuccess) {
    ctx.patchState({ product: action.product, loading: false });
  }

  @Action(LoadProductByIdFailure)
  loadProductFail(ctx: StateContext<ReviewStateModel>, action: LoadProductByIdFailure) {
    ctx.patchState({ loading: false, error: action.error });
  }
}
