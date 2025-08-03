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

  // productReviews = signal<IProductReview[]>([
  //   {
  //     fullName: 'Amit Reddy',
  //     rating: 5,
  //     comment: 'The packaging was perfect and the quality is truly organic. Will definitely buy again!',
  //     createdAt: new Date('2025-07-30')
  //   },
  //   {
  //     fullName: 'Sneha Kapoor',
  //     rating: 4,
  //     comment: 'Loved the fragrance and texture. Felt natural and soothing on skin.',
  //     createdAt: new Date('2025-07-28')
  //   },
  //   {
  //     fullName: 'Ravi Teja',
  //     rating: 3,
  //     comment: 'Good product but delivery was delayed by 3 days.',
  //     createdAt: new Date('2025-07-25')
  //   },
  //   {
  //     fullName: 'Fatima Noor',
  //     rating: 5,
  //     comment: 'I’ve used this for over a week now. My hair feels softer and shinier. Highly recommended!',
  //     createdAt: new Date('2025-07-23')
  //   },
  //   {
  //     fullName: 'Karthik Iyer',
  //     rating: 4,
  //     comment: 'Packaging was eco-friendly and product works well. Would’ve loved more usage instructions though.',
  //     createdAt: new Date('2025-07-22')
  //   },
  //   {
  //     fullName: 'Ananya Sharma',
  //     rating: 5,
  //     comment: 'Authentic herbal feel. Perfect for my skincare routine.',
  //     createdAt: new Date('2025-07-21')
  //   }
  // ]);


  constructor(private reviewService: ReviewService) { }

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
