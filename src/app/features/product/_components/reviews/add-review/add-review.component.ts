import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { ReviewFormData, ReviewProductInfo } from '../../../_models/add-review.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  @Input() loading = false;
  @Input() submitted = false;
  @Input() error: string | null = null;
  @Input() product: ReviewProductInfo | null = null;

  @Output() submitReviewEmit = new EventEmitter<ReviewFormData>();

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
}
