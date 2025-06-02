import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { ReviewFormData, ReviewProductInfo } from '../../../_models/add-review.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReviewFacade } from '../../../_state/review.facade';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.dev';

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

  @Input() loading = false;
  @Input() submitted = false;
  @Input() error: string | null = null;
  @Input() product: ReviewProductInfo | null = null;

  @Output() submitReviewEmit = new EventEmitter<ReviewFormData>();

  product$: Observable<ReviewProductInfo | null> = this.reviewFacade.product$;

  formData: ReviewFormData = {
    rating: 0,
    description: '',
    title: '',
  };


  submitReview() {
    if (!this.formData.rating || !this.formData.description) {
      alert('Please provide a rating and description.');
      return;
    }

    console.log('Review Submitted', this.formData);
    // TODO: Call backend service here
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  getImagePath(imagePath?: string): string {
    return imagePath?.trim()
      ? `${environment.apiBaseUrl}${imagePath}`
      : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }
}
