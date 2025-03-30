import { Component, Input, signal } from '@angular/core';
import { IProductReview } from '../../../_models/product-review';
import { ReviewService } from '../../../_services/review.service';
import { CommonModule } from '@angular/common';
import { ReviewSummaryComponent } from "../review-summary/review-summary.component";
import { ReviewSortFilterComponent } from "../review-sort-filter/review-sort-filter.component";
import { ReviewCardComponent } from "../review-card/review-card.component";

@Component({
  selector: 'app-review-container',
  imports: [
    CommonModule,
    ReviewSummaryComponent,
    ReviewSortFilterComponent,
    ReviewCardComponent
],
  templateUrl: './review-container.component.html',
  styleUrl: './review-container.component.scss'
})
export class ReviewContainerComponent {
  @Input() productId!: number;

  reviews = signal<IProductReview[]>([]);
  isLoading = signal<boolean>(false);
  sortBy = signal<'mostRecent' | 'highestRating' | 'lowestRating'>('mostRecent');

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.fetchReviews();
  }

  fetchReviews(): void {
    this.isLoading.set(true);
    this.reviewService.getProductReviews(this.productId).subscribe({
      next: (res) => {
        this.reviews.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  get filteredReviews(): IProductReview[] {
    const reviews = this.reviews();
    switch (this.sortBy()) {
      case 'highestRating':
        return [...reviews].sort((a, b) => b.rating! - a.rating!);
      case 'lowestRating':
        return [...reviews].sort((a, b) => a.rating! - b.rating!);
      default:
        return [...reviews].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    }
  }

  onSortChange(value: 'mostRecent' | 'highestRating' | 'lowestRating') {
    this.sortBy.set(value);
  }
}
