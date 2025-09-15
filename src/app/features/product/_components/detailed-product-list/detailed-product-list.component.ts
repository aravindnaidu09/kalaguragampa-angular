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
import { WishlistButtonComponent } from "../../../../shared/components/wishlist-button/wishlist-button.component";

@Component({
  selector: 'app-detailed-product-list',
  imports: [
    CommonModule,
    WishlistButtonComponent
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

  private _busy = signal<Set<number>>(new Set());
  isWishlistUpdating = (id: number) => this._busy().has(id);

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
    // ev?.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }

    const id = product.id!;
    if (this.isWishlistUpdating(id)) return; // guard against double click

    const set = new Set(this._busy());
    set.add(id);
    this._busy.set(set);

    const isIn = this.wishlistFacade.isInWishlistSignal(id)();

    const obs = isIn
      ? this.wishlistFacade.remove(id)
      : this.wishlistFacade.add(id);

    obs.subscribe({
      next: () => {
        // optional: toast success
      },
      error: (e) => {
        this.toastService.showError('Wishlist action failed. Please try again.');
        // optional: revert optimistic UI if you flipped anything locally
      },
      complete: () => {
        const after = new Set(this._busy());
        after.delete(id);
        this._busy.set(after);
      }
    });
  }

  isWishlisted(productId: number): boolean {
    const items = this.wishlistFacade.wishlistItems();
    return items?.some(i => i.productDetails?.id === productId) ?? false;
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
