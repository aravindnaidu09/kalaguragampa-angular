import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, Signal, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IProduct } from '../../_models/product-model';
import { HtmlParserPipe } from '../../../../core/utils/html-parser.pipe';
import { ProductService } from '../../_services/product.service';
import { WishlistStore } from '../../_services/wishliststore';
import { environment } from '../../../../../environments/environment.dev';
import { CartService } from '../../../cart/_services/cart.service';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../../../auth/_services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Store } from '@ngxs/store';
import { IWishlist } from '../../_models/wishlist-model';
import { WishlistFacade } from '../../../cart/_state/wishlist.facade';
import { IsInWishlistPipe } from "../../../../core/utils/is-in-wishlist.pipe";
// import { AddToWishlist, RemoveFromWishlist } from '../../../cart/_state/wishlist.state';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    HtmlParserPipe,
    IsInWishlistPipe
],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
  providers: [
    ProductService,
    WishlistStore,
    AuthService,
    CartService,
    ToastService,
    WishlistStore
  ]
})
export class ProductComponent implements OnChanges {
  private store = inject(Store);

  @Input() productsList: IProduct[] = [];
  @Output() wishlistUpdated = new EventEmitter<boolean>(false);
  displayedProducts = signal<IProduct[]>([]);

  @ViewChild('productList', { static: false }) productList!: ElementRef;

  // private wishlistStore = inject(WishlistStore);

  /** ✅ Scroll Debounce (Prevents excessive calls) */
  private scrollDebounce$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly wishlistStore: WishlistStore,
    private readonly wishlistFacade: WishlistFacade
  ) { }

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
    if (!this.isUserLoggedIn()) {
      this.toastService.showError('Please log in to add items to your cart.');
      return;
    }

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

    const isWishlisted = this.wishlistFacade.isInWishlist(product.id!);

    if (isWishlisted) {
      this.wishlistFacade.remove(product.id!);
    } else {
      const wishlistItem: IWishlist = {
        id: product.id!,
        productDetails: product
      };
      this.wishlistFacade.add(product.id!);
    }
  }

  // Method to remove the wishlist item
  removeFromWishlist(productId: number) {
    if (!this.isUserLoggedIn()) {
      this.toastService.showError('Please log in to remove items from your wishlist.');
      return;
    }

    this.wishlistFacade.remove(productId);
  }

  /** ✅ Navigate to Product Details */
  goToProductDetailsPage(name: string, id: number) {
    this.router.navigate([`/product/${name}/${id}`]);
  }

  /** ✅ Toggle Wishlist */
  toggleWishlist(product: IProduct): void {
    const isWishlisted = this.wishlistFacade.isInWishlist(product.id!);

    if (isWishlisted) {
      this.wishlistFacade.remove(product.id!);
    } else {
      this.wishlistFacade.add(product.id!);
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
