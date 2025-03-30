import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { ICategory } from '../../_models/category-model';
import { IProduct } from '../../_models/product-model';
import { ProductService } from '../../_services/product.service';
import { Router } from '@angular/router';
import { debounceTime, Subject, take } from 'rxjs';
import { IProductQueryParams } from '../../_models/product-query-model';
import { WishlistFacade } from '../../../cart/_state/wishlist.facade';
import { ProductComponent } from '../product/product.component';
import { IWishlist } from '../../_models/wishlist-model';
import { SkeletonLoaderComponent } from "../../../../shared/components/skeleton-loader/skeleton-loader.component";
import { AuthService } from '../../../auth/_services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductComponent, SkeletonLoaderComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private categoryCache = new Map<number, IProduct[]>();
  private categorySelection$ = new Subject<number>();
  private cdr = inject(ChangeDetectorRef);

  categories = signal<ICategory[]>([]);
  productsList = signal<IProduct[]>([]);
  topSellers = signal<IProduct[]>([]);
  weekTopSellers = signal<IProduct[]>([]);
  newArrivals = signal<IProduct[]>([]);

  selectedCategory = signal<number | null>(null);
  isLoading = signal<boolean>(true);

  wishlistItems: Signal<IWishlist[]> = signal([]);
  selectedCategoryId: number | null = null;

  isTopSellersLoading = signal(true);
  isWeekTopSellersLoading = signal(true);
  isNewArrivalsLoading = signal(true);

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('categoryScrollRef', { static: false }) categoryScrollRef!: ElementRef;
  @ViewChild('topSellersScroll') topSellersScroll!: ElementRef;
  @ViewChild('weekTopSellersScroll') weekTopSellersScroll!: ElementRef;
  @ViewChild('newArrivalsScroll') newArrivalsScroll!: ElementRef;

  constructor(
    private readonly productService: ProductService,
    private readonly wishlistFacade: WishlistFacade,
    private readonly router: Router
  ) {
    this.categorySelection$.pipe(debounceTime(300)).subscribe((categoryId) => {
      this.isLoading.set(true);
      this.fetchProductList(categoryId);
    });
  }

  ngOnInit(): void {
    this.preloadCategories();
    this.wishlistItems = this.wishlistFacade.wishlistSignal;
  }

  /** ✅ Preload top categories */
  private preloadCategories(): void {
    this.productService.getCategories().pipe(take(1)).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);

        if (categories.length > 0) {
          this.selectedCategory.set(categories[0].id);
          this.fetchProductList(categories[0].id);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** ✅ Fetch product list by category */
  private fetchProductList(categoryId: number, offset = 0, limit = 20): void {
    this.isLoading.set(true);

    if (this.categoryCache.has(categoryId)) {
      this.productsList.set(this.categoryCache.get(categoryId)!);
      this.isLoading.set(false);
      return;
    }

    const params: IProductQueryParams = {
      category_id: categoryId,
      offset,
      limit,
    };

    this.productService.getAllProducts(params).pipe(take(1)).subscribe({
      next: (res) => {
        this.productsList.set(res.products);
        this.categoryCache.set(categoryId, res.products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** ✅ Handle category tab selection */
  selectCategory(index: number, categoryId: number): void {
    this.selectedCategory.set(index);
    this.categorySelection$.next(categoryId);
    this.selectedCategoryId = categoryId;
  }

  /** ✅ Handle wishlist toggling */
  addToWishlist(productId: number): void {
    if (!(this.authService.isAuthenticated())) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }
    const isWishlisted = this.wishlistFacade.isInWishlistSignal(productId)();

    if (isWishlisted) {
      this.wishlistFacade.remove(productId).subscribe();
      this.cdr.markForCheck();
    } else {
      this.wishlistFacade.add(productId).subscribe();''
      this.cdr.markForCheck();
    }

    if (this.selectedCategoryId) {
      this.fetchProductList(this.selectedCategoryId);
    }
  }

  /** ✅ Navigate to full listing */
  navigateToProductPage(): void {
    this.router.navigate(['/detail-view']);
  }

  /** ✅ Per-item signal binding */
  getWishlistSignal(productId: number) {
    return this.wishlistFacade.isInWishlistSignal(productId);
  }

  trackByProductId(index: number, product: IProduct): number {
    return product.id!;
  }

  scrollLeft(refName: 'topSellersScroll' | 'weekTopSellersScroll' | 'newArrivalsScroll' | 'scrollContainer') {
    const el = this[refName]?.nativeElement;
    if (el) {
      el.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight(refName: 'topSellersScroll' | 'weekTopSellersScroll' | 'newArrivalsScroll' | 'scrollContainer') {
    const el = this[refName]?.nativeElement;
    if (el) {
      el.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  scrollCategoriesLeft(): void {
    this.categoryScrollRef?.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollCategoriesRight(): void {
    this.categoryScrollRef?.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }
}

