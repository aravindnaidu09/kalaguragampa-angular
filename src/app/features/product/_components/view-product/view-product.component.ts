import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Signal, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';
import { environment } from '../../../../../environments/environment.dev';
import { HtmlParserPipe } from "../../../../core/utils/html-parser.pipe";
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { CartFacade } from '../../../cart/_state/cart.facade';
import { ReviewContainerComponent } from "../reviews/review-container/review-container.component";
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../auth/_services/auth.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ProductComponent } from '../product/product.component';
import { IProductQueryParams } from '../../_models/product-query-model';
import { IWishlist } from '../../_models/wishlist-model';
import { WishlistFacade } from '../../../cart/_state/wishlist.facade';
import { SeoService } from '../../../../core/services/seo.service';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbFacade } from '../../../../core/state/breadcrumb.facade';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReviewContainerComponent,
    ProductComponent,
    BreadcrumbComponent
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
  private auth = inject(AuthService);
  currencyService = inject(CurrencyService);
  private wishlistFacade = inject(WishlistFacade);
  private seoService = inject(SeoService);
  private breadCrumbFacade = inject(BreadcrumbFacade);

  product = signal<IProduct | null>(null); // ✅ Reactive Signal for Product Data
  quantity = signal<number>(1); // ✅ Default Quantity
  isLoading = signal<boolean>(true); // ✅ Loading State for Skeleton
  errorMessage = signal<string | null>(null); // ✅ Error State

  imageIndex: number = 0;

  notify: boolean = false;

  relatedProducts = signal<IProduct[]>([]);
  relatedLoading = signal<boolean>(true);
  relatedError = signal<string | null>(null);
  wishlistItems: Signal<IWishlist[]> = signal([]);

  addToCartLoading = signal(false);
  buyNowLoading = signal(false);


  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

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

    this.wishlistItems = this.wishlistFacade.wishlistSignal;

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
        this.fetchRelatedProducts(); // ✅ Fetch related products

        this.breadCrumbFacade.setBreadcrumb([
          { label: 'Home', url: '/' },
          { label: 'Products', url: '/detail-view' },
          { label: response.name!, url: this.router.url }
        ]);

        // ✅ SEO Setup
        this.seoService.update(
          `${response.name} - Buy Online at Kalagura Gampa`,
          response.shortDescription || 'Shop premium handmade herbal products with natural ingredients.',
          `${response.name}, ${response.categoryName}, Kalagura Gampa`
        );

        const canonicalSlug = response.name?.toLowerCase().replace(/\\s+/g, '-');
        this.seoService.setCanonical(`https://kalaguragampa.com/product/${canonicalSlug}/${response.id}`);
      },
      error: () => {
        this.errorMessage.set('Failed to load product details.');
        this.isLoading.set(false);
      },
    });
  }

  private fetchRelatedProducts(): void {
    this.relatedLoading.set(true);
    this.relatedError.set(null);

    const params: IProductQueryParams = {
      category_id: this.product()?.categoryId
    };
    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        if (response?.products.length) {
          this.relatedProducts.set(response.products);
        } else {
          this.relatedError.set('No related products found.');
        }
        this.relatedLoading.set(false);
      },
      error: () => {
        this.relatedError.set('Failed to load related products.');
        this.relatedLoading.set(false);
      }
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

  private tryAddToCart(): Observable<boolean> {

    const product = this.product();
    const qty = this.quantity();

    if (product?.maxQuantity && qty > product.maxQuantity) {
      this.toastService.showError(`You can only purchase up to ${product.maxQuantity} units.`);
      return of(false);
    }

    return this.cartFacade.addToCart(product?.id!, qty);
  }


  // ✅ Add to Cart Function
  addToCart(): void {
    if (!(this.auth.isAuthenticated())) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }

    this.addToCartLoading.set(true);

    this.tryAddToCart().subscribe((success) => {
      this.addToCartLoading.set(false);
      if (success) {
        // this.toastService.showSuccess('Item added to cart!');
      }
    });
  }

  // ✅ Navigate to Checkout
  goToCheckoutPage(): void {
    if (!(this.auth.isAuthenticated())) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }

    this.buyNowLoading.set(true);

    this.tryAddToCart().subscribe((success) => {
      this.buyNowLoading.set(false);
      if (success) {
        this.router.navigate(['/checkout']);
      }
    });
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

  notifyMe(productId: number | undefined) {
    if (this.notify && productId) {
      // Replace with actual logic or service call
      this.toastService.showInfo('You’ll be notified when this item is back in stock.');
    }
  }

  /** ✅ Handle wishlist toggling */
  addToWishlist(productId: number): void {
    if (!(this.auth.isAuthenticated())) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }
    const isWishlisted = this.wishlistFacade.isInWishlistSignal(productId)();

    if (isWishlisted) {
      this.wishlistFacade.remove(productId).subscribe();
    } else {
      this.wishlistFacade.add(productId).subscribe(); ''
    }
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

}
