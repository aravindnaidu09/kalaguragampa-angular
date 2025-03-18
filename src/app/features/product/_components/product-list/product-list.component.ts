import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { ProductComponent } from "../product/product.component";
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';
import { debounceTime, Subject, take } from 'rxjs';
import { Router } from '@angular/router';
import { IProductQueryParams } from '../../_models/product-query-model';
import { CartWishlistService } from '../../../cart/_services/cart-wishlist.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  /** ✅ Caching Categories for Preloading */
  private categoryCache = new Map<number, IProduct[]>();

  /** ✅ Category & Product Data */
  categories = signal<ICategory[]>([]);
  productsList = signal<IProduct[]>([]);

  /** ✅ Pagination Metadata */
  totalProducts = signal(0);
  nextPage = signal<string | null>(null);
  previousPage = signal<string | null>(null);

  /** ✅ UI State */
  selectedCategory = signal<number | null>(null);
  isLoading = signal<boolean>(true);

  /** ✅ Debounce for category selection */
  private categorySelection$ = new Subject<number>();

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly cartWishlistService: CartWishlistService
  ) {
    /** ✅ Apply Debounce on Category Selection */
    this.categorySelection$.pipe(debounceTime(300)).subscribe(categoryId => {
      this.isLoading.set(true);
      this.fetchProductList(categoryId);
    });
  }

  ngOnInit(): void {
    this.preloadCategories(); // 🚀 Preloading Categories on App Load
  }

  /** ✅ Preload Categories (Faster Category Switching) */
  private preloadCategories(): void {
    this.productService.getCategories()
      .pipe(take(1))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.isLoading.set(false);

          // ✅ Preload Products for the First Category (Better UX)
          if (categories.length > 0) {
            this.selectedCategory.set(categories[0].id);
            this.fetchProductList(categories[0].id);
          }
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
          this.isLoading.set(false);
        }
      });
  }

  /** ✅ Fetch Product List (Handles Pagination) */
  private fetchProductList(categoryId?: number, offset: number = 0, limit: number = 20): void {
    this.isLoading.set(true);

    // ✅ Check Cache Before Making API Call
    if (this.categoryCache.has(categoryId!)) {
      console.log('🚀 Fetching Products from Cache');
      this.productsList.set(this.categoryCache.get(categoryId!)!);
      this.isLoading.set(false);
      return;
    }

    const params: IProductQueryParams = {
      category_id: categoryId || undefined,
      limit,
      offset
    };

    this.productService.getAllProducts(params)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.productsList.set(response.products);
          this.totalProducts.set(response.totalCount);
          this.nextPage.set(response.nextPage);
          this.previousPage.set(response.previousPage);
          this.isLoading.set(false);

          // ✅ Store Products in Cache for Faster Switching
          this.categoryCache.set(categoryId!, response.products);
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          this.isLoading.set(false);
        }
      });
  }

  /** ✅ Handle Category Selection (Debounced) */
  selectCategory(index: number, categoryId: number): void {
    this.isLoading.set(true);
    this.selectedCategory.set(index);
    this.categorySelection$.next(categoryId);
  }

  /** ✅ Navigate to Product Details */
  navigateToProductPage(): void {
    this.router.navigate(['/detail-view']);
  }

  updatedWishlistCount(event: boolean) {
    this.cartWishlistService.fetchWishlistCount();
    this.cartWishlistService.updateCartCount(1);
  }
}
