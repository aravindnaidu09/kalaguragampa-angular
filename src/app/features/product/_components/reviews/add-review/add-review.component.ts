import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { ReviewFormData, ReviewProductInfo } from '../../../_models/add-review.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReviewFacade } from '../../../_state/review.facade';
import { filter, Observable, take, withLatestFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment.dev';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-add-review',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StarRatingComponent
  ],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.scss'
})
export class AddReviewComponent {
  private reviewFacade = inject(ReviewFacade);
  private toastService = inject(ToastService);

  @Input() loading = false;
  @Input() submitted = false;
  @Input() error: string | null = null;
  @Input() product: ReviewProductInfo | null = null;

  @Output() submitReviewEmit = new EventEmitter<ReviewFormData>();

  product$: Observable<ReviewProductInfo | null> = this.reviewFacade.product$;

  isSubmitting = false;

  formData: ReviewFormData = {
    rating: 0,
    description: '',
    title: '',
  };


  // submitReview() {
  //   if (!this.formData.rating || !this.formData.description) {
  //     alert('Please provide a rating and description.');
  //     return;
  //   }

  //   console.log('Review Submitted', this.formData);
  //   // TODO: Call backend service here

  // }

  submitReview(): void {
    if (!this.formData.rating || !this.formData.description) {
      this.toastService.showError('Please provide both rating and review text.');
      return;
    }

    this.isSubmitting = true;

    this.reviewFacade.submitted$
      .pipe(
        withLatestFrom(this.reviewFacade.product$),
        filter(([submitted, product]) => !!product && submitted === true),
        take(1)
      )
      .subscribe(([_, product]) => {
        this.toastService.showSuccess('Thank you! Your review has been submitted.');
        this.resetForm();
        this.isSubmitting = false;
      });

    // Dispatch after setting up the subscription
    this.reviewFacade.product$
      .pipe(take(1))
      .subscribe(product => {
        if (!product?.id) {
          this.toastService.showError('Invalid product context.');
          this.isSubmitting = false;
          return;
        }

        this.reviewFacade.submitReview(product.id, this.formData);
      });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  getImagePath(imagePath?: string): string {
    return imagePath?.trim()
      ? `${environment.apiBaseUrl}${imagePath}`
      : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  resetForm(): void {
    this.formData = {
      rating: 0,
      description: '',
      title: ''
    };
    this.submitted = false;
    this.error = null;
    this.isSubmitting = false;
  }
}
