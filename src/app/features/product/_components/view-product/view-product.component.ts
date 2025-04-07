import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';
import { environment } from '../../../../../environments/environment.dev';
import { HtmlParserPipe } from "../../../../core/utils/html-parser.pipe";
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { CartFacade } from '../../../cart/_state/cart.facade';
import { ReviewContainerComponent } from "../reviews/review-container/review-container.component";

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReviewContainerComponent
],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.scss',
})
export class ViewProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private cartFacade = inject(CartFacade);

  product = signal<IProduct | null>(null); // ✅ Reactive Signal for Product Data
  quantity = signal<number>(1); // ✅ Default Quantity
  isLoading = signal<boolean>(true); // ✅ Loading State for Skeleton
  errorMessage = signal<string | null>(null); // ✅ Error State

  imageIndex: number = 0;

  reviews = signal([
    {
      userName: 'John Doe',
      userImage: 'https://i.pravatar.cc/40',
      rating: 5,
      comment: 'Excellent product! Highly recommended.',
      date: '2024-03-14'
    },
    {
      userName: 'Jane Smith',
      userImage: 'https://i.pravatar.cc/41',
      rating: 4,
      comment: 'Good quality, but shipping took longer than expected.',
      date: '2024-03-12'
    }
  ]);
  newReview = signal({ comment: '', rating: 0 });

  ngOnInit(): void {
    this.route.params
    .subscribe((params: any) => {
      const productId = params['id'];
      this.fetchProductDetails(productId);
    });
  }

  // ✅ Fetch Product by ID from API
  private fetchProductDetails(productId: string): void {
    if (!productId) {
      this.errorMessage.set('Product not found.');
      this.router.navigate(['/products']);
      return;
    }

    this.productService.getProductById(productId).subscribe({
      next: (response) => {
        this.product.set(response); // ✅ Extract product from API response
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load product details.');
        this.isLoading.set(false);
      },
    });
  }

  // ✅ Increase Quantity (Limit: Stock Available)
  increaseQuantity(): void {
    if (this.quantity() < (this.product()?.maxQuantity || 1)) {
      this.quantity.update((q) => q + 1);
    } else {
      this.toastService.showWarning('Limit Reached!')
    }
  }

  // ✅ Decrease Quantity (Limit: 1)
  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  // ✅ Add to Cart Function
  addToCart(): void {
    if (this.product()?.maxQuantity && this.quantity() > this.product()?.maxQuantity!) {
      this.toastService.showError(`You can only purchase up to ${this.product()?.maxQuantity} units.`);
      return;
    }

    // ✅ All good, dispatch add to cart
    this.cartFacade.addToCart(this.product()?.id!, this.quantity());
  }

  // ✅ Navigate to Checkout
  goToCheckoutPage(): void {
    this.router.navigate(['/checkout']);
  }

  // ✅ Get Image Path with Fallback
  getImagePath(imagePath?: string): string {
    return imagePath ? `${environment.apiBaseUrl}${imagePath}` : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  // ✅ Handle Image Load Errors
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  getStars(rating: number): string[] {
    return new Array(rating).fill('⭐');
  }

  // ✅ Set Review Rating
  setRating(star: number): void {
    this.newReview.update((r) => ({ ...r, rating: star }));
  }

  // ✅ Submit New Review
  submitReview(): void {
    if (!this.newReview().comment || this.newReview().rating === 0) {
      alert('Please provide a comment and rating.');
      return;
    }

    const newReview = {
      userName: 'Guest User',
      userImage: 'https://i.pravatar.cc/42',
      rating: this.newReview().rating,
      comment: this.newReview().comment,
      date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    };

    this.reviews.update((reviews) => [newReview, ...reviews]); // Add review at top
    this.newReview.set({ comment: '', rating: 0 }); // Reset form
  }

  showClickedSpecificImage(index: number) {
    this.imageIndex = index;
  }
}
