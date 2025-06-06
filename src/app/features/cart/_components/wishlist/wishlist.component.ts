import { Component, effect, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IProduct } from '../../../product/_models/product-model';
import { environment } from '../../../../../environments/environment.dev';
import { ToastService } from '../../../../core/services/toast.service';
import { WishlistFacade } from '../../_state/wishlist.facade';
import { CartService } from '../../_services/cart.service';
import { IWishlist } from '../../../product/_models/wishlist-model';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { CartFacade } from '../../_state/cart.facade';
import { CurrencyService } from '../../../../core/services/currency.service';
import { BreadcrumbFacade } from '../../../../core/state/breadcrumb.facade';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-wishlist',
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  private wishlistFacade = inject(WishlistFacade);
  activeTab = signal<'favorites' | 'collections' | 'feed'>('favorites');
  gridView = signal<boolean>(true);
  sortOptions = ['Date', 'Price', 'Popularity'];
  selectedSort = signal<string>('Date');
  ascendingOrder = signal<boolean>(true);

  wishlistItems = this.wishlistFacade.wishlistSignal;
  isLoading = this.wishlistFacade.isLoading;

  removingItemIds = new Set<number>();
  movingItemIds = new Set<number>();
  isBulkClearing = false;
  isBulkAdding = false;

  constructor(
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly confirmService: ConfirmDialogService,
    private readonly cartFacade: CartFacade,
    public currencyService: CurrencyService,
    private breadcrumbFacade: BreadcrumbFacade
  ) { }

  ngOnInit(): void {
    this.wishlistFacade.fetch();

    this.breadcrumbFacade.setBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Wishlist', url: '/wishlist' }
    ]);
  }

  addAllToCart(): void {
    const products = this.wishlistItems();
    if (!products.length) return;

    this.isBulkAdding = true;
    let completed = 0;
    let failed = 0;

    products.forEach((product) => {
      this.cartFacade.addToCart(product.productDetails.id!).subscribe({
        next: () => {
          completed++;
          this.checkAllComplete(completed, products.length, failed);
        },
        error: () => {
          failed++;
          completed++;
          this.checkAllComplete(completed, products.length, failed);
        }
      });
    });
  }

  private checkAllComplete(done: number, total: number, failed: number) {
    if (done === total) {
      this.isBulkAdding = false;
      if (failed > 0) {
        this.toastService.showError(`${failed} items failed to add`);
      } else {
        this.toastService.showSuccess('All items added to cart');
      }
      this.wishlistFacade.fetch();
    }
  }


  toggleView(): void {
    this.gridView.set(!this.gridView());
  }

  removeFromWishlist(productId: number): void {
    this.confirmService.confirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from the wishlist?',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        // this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.removingItemIds.add(productId);
        this.wishlistFacade.remove(productId).subscribe({
          next: () => {
            this.removingItemIds.delete(productId);
            this.wishlistFacade.fetch();
          },
          error: () => this.removingItemIds.delete(productId)
        });
      }
    });

  }

  addToCart(product: IWishlist): void {
    const id = product.id!;
    this.movingItemIds.add(id);

    this.cartFacade.addToCart(product.productDetails.id!).subscribe({
      next: () => {
        this.movingItemIds.delete(id);
        this.wishlistFacade.fetch();
      },
      error: () => this.movingItemIds.delete(id)
    });
  }


  changeSorting(sortType: string): void {
    this.selectedSort.set(sortType);
    this.ascendingOrder.set(!this.ascendingOrder());
    this.toastService.showInfo(`Sorted by ${sortType} ${this.ascendingOrder() ? '▲' : '▼'}`);
  }

  getImagePath(imagePath?: string): string {
    return `${environment.apiBaseUrl}${imagePath}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  goToProduct(product: IWishlist): void {
    this.router.navigate([`/product/${product.productDetails.name}/${product.productDetails.id}`]);
  }

  clearWishlist(): void {
    this.confirmService.confirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from the wishlist?',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        const products = this.wishlistItems();
        if (!products.length) return;

        this.isBulkClearing = true;
        let removed = 0;

        products.forEach(product => {
          this.wishlistFacade.remove(product.id!).subscribe({
            next: () => {
              removed++;
              if (removed === products.length) {
                this.isBulkClearing = false;
                this.wishlistFacade.fetch();
              }
            },
            error: () => {
              removed++;
              if (removed === products.length) this.isBulkClearing = false;
            }
          });
        });
      }
    });
  }


  trackById(index: number, item: IWishlist): number | string {
    return item.id;
  }

  goToHomePage(): void {
    this.router.navigate(['/']);
  }
}
