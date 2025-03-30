import { Component, Input } from '@angular/core';
import { IProductReview } from '../../../_models/product-review';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-card',
  imports: [
    CommonModule
  ],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss'
})
export class ReviewCardComponent {
  @Input() review: IProductReview = {};

  get formattedDate(): string {
    return new Date(this.review.createdAt!).toLocaleDateString();
  }

  getStars(): number[] {
    return Array(this.review.rating).fill(0);
  }
}
