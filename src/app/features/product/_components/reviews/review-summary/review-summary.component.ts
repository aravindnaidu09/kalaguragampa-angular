import { Component, Input } from '@angular/core';
import { IProductReview } from '../../../_models/product-review';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-summary',
  imports: [
    CommonModule
  ],
  templateUrl: './review-summary.component.html',
  styleUrl: './review-summary.component.scss'
})
export class ReviewSummaryComponent {
  @Input() reviews: IProductReview[] = [];
  @Input() totalReviews: any;

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    const total = this.reviews.reduce((sum, r) => sum + r.rating!, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  get ratingBreakdown(): { star: number; count: number }[] {
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: this.reviews.filter(r => r.rating === star).length
    }));
  }


  getRatingPercentage(star: number): number {
    const total = this.reviews.length;
    if (total === 0) return 0;

    const count = this.reviews.filter(r => r.rating === star).length;
    return Math.round((count / total) * 100);
  }

}
