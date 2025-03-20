import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, Signal, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartWishlistService } from '../../../cart/_services/cart-wishlist.service';
import { IProduct } from '../../_models/product-model';
import { HtmlParserPipe } from '../../../../core/utils/html-parser.pipe';
import { ProductService } from '../../_services/product.service';
import { WishlistStore } from '../../_services/wishliststore';
import { environment } from '../../../../../environments/environment.dev';
import { CartService } from '../../../cart/_services/cart.service';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../../../auth/_services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    HtmlParserPipe
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
  providers: [
    CartWishlistService,
    ProductService,
    WishlistStore,
    AuthService,
    CartService,
    ToastService,
    WishlistStore
  ]
})
export class ProductComponent implements OnChanges {
  @Input() productsList: IProduct[] = [];
  @Output() wishlistUpdated = new EventEmitter<boolean>(false);
  displayedProducts = signal<IProduct[]>([]);

  @ViewChild('productList', { static: false }) productList!: ElementRef;

  // private wishlistStore = inject(WishlistStore);

  /** ✅ Scroll Debounce (Prevents excessive calls) */
  private scrollDebounce$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly cartWishListService: CartWishlistService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly wishlistStore: WishlistStore
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productsList']?.currentValue) {
      this.displayedProducts.set(this.productsList);
    }
  }

  /** ✅ Check if user is authenticated */
  isUserLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  // ✅ Scroll Left (With Debounce)
  scrollLeft(): void {
    this.scrollDebounce$.next();
    this.productList?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  // ✅ Scroll Right (With Debounce)
  scrollRight(): void {
    this.scrollDebounce$.next();
    this.productList?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  /** ✅ Add to Cart (Debounced Requests) */
  addToCart(productId: number) {
    this.cartWishListService.updateCartCount(1);
    this.cartService.addToCart(productId).subscribe({
      next: (result) => console.log('Cart Updated: ', result),
      error: (err) => console.error('Cart Error:', err)
    });
  }

  /** ✅ Add or Remove from Wishlist (Optimistic UI Update) */
  addToWishlist(product: IProduct) {

    if (!this.isUserLoggedIn()) {
      this.toastService.showError('Please log in to add items to your wishlist.');
      return;
    }

    const isWishlisted = this.isInWishlist(product.id!);

    // ✅ Optimistically update UI before API response
    if (isWishlisted) {
      this.removeFromWishlist(product.id!);
      return;
    }

    // ✅ Make API Call
    this.productService.addToWishlist(product.id!).subscribe({
      next: () => {
        this.wishlistStore.addToWishlist(product);
        this.toastService.showSuccess('Added to Wishlist');
        this.cartWishListService.updateWishlistCount(1);
        this.wishlistUpdated.emit(true);
      },
      error: () => {
        if (isWishlisted) {
          this.wishlistStore.addToWishlist(product);
          this.cartWishListService.updateWishlistCount(1);
        }

        this.toastService.showError('Failed to update wishlist. Please try again.');
      }
    });
  }


  // Method to remove the wishlist item
  removeFromWishlist(productId: number) {
    // ✅ Make API Call
    this.productService.removeFromWishlist(productId!).subscribe({
      next: () => {
        this.toastService.showSuccess('Removed from Wishlist');
        this.wishlistStore.removeFromWishlist(productId);
        this.cartWishListService.updateWishlistCount(-1);
      },
      error: () => {
        this.toastService.showError('Failed to update wishlist. Please try again.');
      }
    });
  }


  /** ✅ Navigate to Product Details */
  goToProductDetailsPage(name: string, id: number) {
    this.router.navigate([`/product/${name}/${id}`]);
  }

  /** ✅ Check if product is in wishlist */
  isInWishlist(productId: number): boolean {
    return this.wishlistStore.wishlist().some(w => w.id === productId);
  }

  /** ✅ Toggle Wishlist */
  toggleWishlist(product: IProduct): void {
    if (this.isInWishlist(product.id!)) {
      this.wishlistStore.removeFromWishlist(product.id);
      console.log(`Removed from Wishlist: ${product.name}`);
    } else {
      this.wishlistStore.addToWishlist(product);
    }
  }

  /** ✅ Lazy Loading Image Handler */
  getImagePath(imagePath?: string): string {
    return imagePath && imagePath.trim() ? `${environment.apiBaseUrl}${imagePath}` : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  /** ✅ Handle Image Error */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }
}
