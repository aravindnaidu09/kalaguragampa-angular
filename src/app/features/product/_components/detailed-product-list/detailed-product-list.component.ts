import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, Signal, signal, SimpleChanges } from '@angular/core';
import { IProduct } from '../../_models/product-model';
import { ProductService } from '../../_services/product.service';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';
import { IProductQueryParams } from '../../_models/product-query-model';
import { environment } from '../../../../../environments/environment.dev';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/_services/auth.service';
import { WishlistFacade } from '../../../cart/_state/wishlist.facade';
import { ToastService } from '../../../../core/services/toast.service';
import { IWishlist } from '../../_models/wishlist-model';
import { CurrencyService } from '../../../../core/services/currency.service';
import { Store } from '@ngxs/store';
import { AddToCart } from '../../../cart/_state/cart.actions';

@Component({
  selector: 'app-detailed-product-list',
  imports: [
    CommonModule,
  ],
  templateUrl: './detailed-product-list.component.html',
  styleUrl: './detailed-product-list.component.scss'
})
export class DetailedProductListComponent implements OnInit, OnChanges {
  @Input() queryParams: IProductQueryParams = {};
  // ✅ Signals for State Management
  @Input() products = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);
  // viewMode = signal<'list' | 'grid'>('grid');

  // ✅ New signals for pagination metadata
  totalProducts = signal(0); // Total product count
  nextPage = signal<string | null>(null); // Next page URL
  previousPage = signal<string | null>(null); // Previous page URL

  @Input() wishlistItems!: Signal<IWishlist[]>;

  constructor(private readonly productService: ProductService,
     private readonly store: Store,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly wishlistFacade: WishlistFacade,
    private readonly toastService: ToastService,
    public currencyService: CurrencyService
  ) { }

  ngOnInit(): void {
    // this.fetchProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['queryParams']) {
      // this.fetchProducts();
    }
  }

  isWishlisted(productId: number): boolean {
    const items = this.wishlistFacade.wishlistItems();
    return items?.some(item => item.productDetails?.id === productId) ?? false;
  }

addProductToCart(product: IProduct): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.showWarning('Please log in to add items to your cart!');
      return;
    }
    this.store.dispatch(new AddToCart(product.id!, 1));
    this.toastService.showSuccess('Product added to cart successfully!');
    }

  navigateToProductPage(item: IProduct) {
    this.router.navigate([`/product/${item.name}/${item.id}`]);
  }

  /**
   * ✅ Toggle Wishlist
   */
  toggleWishlist(product: IProduct): void {
    if (!(this.authService.isAuthenticated())) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }
    const isWishlisted = this.wishlistFacade.isInWishlistSignal(product.id!)();

    if (isWishlisted) {
      this.wishlistFacade.remove(product.id!).subscribe();
    } else {
      this.wishlistFacade.add(product.id!).subscribe(); ''
    }
  }

  /**
   * ✅ TrackBy for Performance
   */
  trackById(index: number, product: IProduct): number {
    return product.id!;
  }

  getImagePath(imagePath?: string): string {
    if (!imagePath || imagePath.trim() === '' || imagePath === 'null' || imagePath === 'undefined') {
      return `${environment.apiBaseUrl}/media/KG_LOGO.png`;
    }
    return `${environment.apiBaseUrl}${imagePath}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }
}
