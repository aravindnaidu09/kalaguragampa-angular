import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { ICategory } from '../../_models/category-model';
import { IProduct } from '../../_models/product-model';
import { ProductService } from '../../_services/product.service';
import { Router } from '@angular/router';
import { debounceTime, finalize, Subject, take } from 'rxjs';
import { IProductQueryParams } from '../../_models/product-query-model';
import { WishlistFacade } from '../../../cart/_state/wishlist.facade';
import { ProductComponent } from '../product/product.component';
import { IWishlist } from '../../_models/wishlist-model';
import { SkeletonLoaderComponent } from "../../../../shared/components/skeleton-loader/skeleton-loader.component";
import { AuthService } from '../../../auth/_services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Store } from '@ngxs/store';
import { AddToCart } from '../../../cart/_state/cart.actions';

type ScrollRef = 'scrollContainer' | 'topSellersScroll' | 'weekTopSellersScroll' | 'newArrivalsScroll';

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

  wishlistUpdatingIds = new Set<number>();
  wishlistUpdatingMap = signal<Map<number, boolean>>(new Map());

  /** productId -> boolean (true while API in-flight) */
  readonly cartUpdatingMap = signal<Map<number, boolean>>(new Map());

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('categoryScrollRef', { static: false }) categoryScrollRef!: ElementRef;
  @ViewChild('topSellersScroll') topSellersScroll!: ElementRef;
  @ViewChild('weekTopSellersScroll') weekTopSellersScroll!: ElementRef;
  @ViewChild('newArrivalsScroll') newArrivalsScroll!: ElementRef;

  @ViewChild('productCard') productCardComponent!: ProductComponent;

  @HostListener('document:keydown.arrowRight')
  onArrowRight() {
    this.scrollCategoriesRight();
  }

  @HostListener('document:keydown.arrowLeft')
  onArrowLeft() {
    this.scrollCategoriesLeft();
  }


  constructor(
    private readonly productService: ProductService,
    private readonly wishlistFacade: WishlistFacade,
    private readonly store: Store,
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


    this.getTopSellers();
    this.getWeekTopSellers();
    this.getNewArrivals();
  }

  /** ✅ Fetch Top Sellers */
  private getTopSellers(): void {
    this.isTopSellersLoading.set(true);

    this.productService
      .getRankedProducts('top_sellers', 10)
      .pipe(take(1))
      .subscribe({
        next: (res) => this.topSellers.set(res),
        error: () => this.toastService.showError('Failed to load top sellers.'),
        complete: () => this.isTopSellersLoading.set(false),
      });
  }

  /** ✅ Fetch Weekly Top Sellers */
  private getWeekTopSellers(): void {
    this.isWeekTopSellersLoading.set(true);

    this.productService
      .getRankedProducts('weekly_top_sellers', 10)
      .pipe(take(1))
      .subscribe({
        next: (res) => this.weekTopSellers.set(res),
        error: () => this.toastService.showError('Failed to load weekly top sellers.'),
        complete: () => this.isWeekTopSellersLoading.set(false),
      });
  }

  /** ✅ Fetch New Arrivals */
  private getNewArrivals(): void {
    this.isNewArrivalsLoading.set(true);

    this.productService
      .getRankedProducts('new_arrivals', 10)
      .pipe(take(1))
      .subscribe({
        next: (res) => this.newArrivals.set(res),
        error: () => this.toastService.showError('Failed to load new arrivals.'),
        complete: () => this.isNewArrivalsLoading.set(false),
      });
  }


  /** ✅ Preload top categories */
  private preloadCategories(): void {
    this.productService.getCategories().pipe(take(1)).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);

        if (categories.length > 0) {
          this.selectedCategory.set(0);
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
    if (!this.authService.isAuthenticated()) {
      this.toastService.showWarning('Please log in to add items!');
      return;
    }

    const isWishlisted = this.wishlistFacade.isInWishlistSignal(productId)();
    const map = new Map(this.wishlistUpdatingMap());

    map.set(productId, true);
    this.wishlistUpdatingMap.set(map);

    const operation$ = isWishlisted
      ? this.wishlistFacade.remove(productId)
      : this.wishlistFacade.add(productId);

    operation$.subscribe({
      next: () => {
        map.set(productId, false);
        this.wishlistUpdatingMap.set(new Map(map));
      },
      error: () => {
        map.set(productId, false);
        this.toastService.showError('Failed to update wishlist');
        this.wishlistUpdatingMap.set(new Map(map));
      }
    });
  }

  isUpdatingWishlist(productId: number): boolean {
    return this.wishlistUpdatingMap().get(productId) === true;
  }

  /** 🔁 Your method, now with per-item loader + guards */
  addProductToCart(event: IProduct) {
    const id = Number(event?.id);
    if (!id || this.isCartUpdating(id)) return;

    const qty = Math.max(1, Number((event as any)?.minQty ?? 1));

    // flip ON (use a new Map to trigger change detection)
    const map = new Map(this.cartUpdatingMap());
    map.set(id, true);
    this.cartUpdatingMap.set(map);

    this.store
      .dispatch(new AddToCart(id, qty))
      .pipe(
        finalize(() => {
          // flip OFF regardless of success/failure
          map.set(id, false);
          this.cartUpdatingMap.set(new Map(map));
        })
      )
      .subscribe({
        next: () => {
          // this.toast?.showSuccess('Added to cart');
          // if your cart badge needs refresh separately, do it here
        },
        error: () => {
          this.toastService?.showError('Failed to add to cart');
        }
      });
  }

  isCartUpdating(id: number): boolean {
    return !!this.cartUpdatingMap().get(id);
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

  scrollLeft(refName: ScrollRef) {
    const el = this[refName]?.nativeElement as HTMLElement;
    if (el) {
      const scrollAmount = el.offsetWidth * 0.8;
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollRight(refName: ScrollRef) {
    const el = this[refName]?.nativeElement as HTMLElement;
    if (el) {
      const scrollAmount = el.offsetWidth * 0.8;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }


  scrollCategoriesLeft(): void {
    this.categoryScrollRef?.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollCategoriesRight(): void {
    this.categoryScrollRef?.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }
}

