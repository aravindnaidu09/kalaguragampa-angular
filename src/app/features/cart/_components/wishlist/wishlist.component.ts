import { Component, signal } from '@angular/core';
import { IProduct } from '../../../product/_models/product-model';
import { CartService } from '../../_services/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../product/_services/product.service';
import { FormsModule } from '@angular/forms';
import { IWishlist } from '../../../product/_models/wishlist-model';
import { environment } from '../../../../../environments/environment.dev';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { CartItem } from '../../_models/cart-item-model';

@Component({
  selector: 'app-wishlist',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  // ✅ Tabs
  activeTab = signal<'favorites' | 'collections' | 'feed'>('favorites');

  // ✅ Products in Wishlist
  wishlistItems = signal<IWishlist[]>([]);
  gridView = signal<boolean>(true); // ✅ Toggle for Grid/List View

  // ✅ Sorting
  sortOptions = ['Date', 'Price', 'Popularity'];
  selectedSort = signal<string>('Date');
  ascendingOrder = signal<boolean>(true);

  // ✅ Loading State
  isLoading = signal<boolean>(true);

  constructor(
    private readonly wishlistService: ProductService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.loadWishlist();
  }

  // ✅ Load Wishlist Items
  loadWishlist(): void {
    this.isLoading.set(true);

    this.wishlistService.getWishlist().subscribe({
      next: (products: IWishlist[]) => {
        this.wishlistItems.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.showError('Failed to load wishlist. Please try again later.');
      }
    });
  }

  // ✅ Add All Items to Cart
  addAllToCart(): void {
    this.isLoading.set(true);

    this.wishlistItems().forEach(product => {
      this.cartService.addToCart(product.productDetails.id!).subscribe({
        next: () => {
          this.toastService.showSuccess(`${product.productDetails.name} added to cart`);
        },
        error: () => {
          this.toastService.showError(`Failed to add ${product.productDetails.name} to cart`);
        }
      });
    });

    this.isLoading.set(false);
  }

  // ✅ Toggle View
  toggleView(): void {
    this.gridView.set(!this.gridView());
  }

  // ✅ Remove from Wishlist
  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.toastService.showSuccess('Item removed from wishlist');
        this.loadWishlist(); // Reload Wishlist after removal
      },
      error: () => {
        this.toastService.showError('Failed to remove item from wishlist');
      }
    });
  }

  // ✅ Add Single Product to Cart
  addToCart(product: IWishlist): void {
    this.cartService.addToCart(product.productDetails.id!).subscribe({
      next: () => {
        this.toastService.showSuccess(`${product.productDetails.name} added to cart`);
      },
      error: () => {
        this.toastService.showError(`Failed to add ${product.productDetails.name} to cart`);
      }
    });
  }

  // ✅ Change Sorting Order
  changeSorting(sortType: string): void {
    this.selectedSort.set(sortType);
    this.ascendingOrder.set(!this.ascendingOrder());
    this.toastService.showInfo(`Sorted by ${sortType} ${this.ascendingOrder() ? '▲' : '▼'}`);
  }

  getImagePath(imagePath?: string): string {
    return `${environment.apiBaseUrl}${imagePath}`;
  }

  /** ✅ Handle Image Error */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  /** ✅ Navigate to Product Page */
  goToProduct(product: IProduct): void {
    this.router.navigate([`/product/${product.name}/${product.id}`]);
  }

  /** ✅ Clear Wishlist */
  clearWishlist(): void {
    this.isLoading.set(true);

    this.wishlistItems().forEach((element: any) => {
      this.wishlistService.removeFromWishlist(element.productDetails.id!).subscribe({
        next: () => {
          this.toastService.showSuccess('Wishlist cleared successfully');
        },
        error: () => {
          this.toastService.showError('Failed to clear wishlist');
        }
      })
    });
  }

  /** ✅ TrackBy for Performance */
  trackById(index: number, item: IWishlist): number {
    return item.id;
  }

  goToHomePage() {
    this.router.navigate(['/'])
  }
}
