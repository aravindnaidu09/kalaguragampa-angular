import { CommonModule } from '@angular/common';
import { Component, computed, Pipe, signal } from '@angular/core';
import { ProductFiltersComponent } from '../product-filters/product-filters.component';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';
import { DetailedProductListComponent } from '../detailed-product-list/detailed-product-list.component';
import { IProductQueryParams } from '../../_models/product-query-model';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';
import { SeoService } from '../../../../core/services/seo.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products-page',
  imports: [
    CommonModule,
    ProductFiltersComponent,
    SortFilterBarComponent,
    DetailedProductListComponent
  ],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent {
  // ✅ Signals for Sort & View State
  sortBy = signal<string>('latest');
  viewMode = signal<'list' | 'grid'>('grid');

  products = signal<IProduct[]>([]);

  // ✅ New signals for pagination metadata
  totalProducts = signal(0); // Total product count
  nextPage = signal<string | null>(null); // Next page URL
  previousPage = signal<string | null>(null); // Previous page URL

  // ✅ Reactive Signal for product filters
  filtersChanged = signal<IProductQueryParams>({});

  // ✅ Filters Signal
  filters = signal<IProductQueryParams>({});

  // ✅ Computed Signal: Combines Both Sources
  productParams = computed(() => ({
    ...this.filters(), // ✅ Includes Filters from Product Filters Component
    ...this.filtersChanged(), // ✅ Includes Filters from Sort & Filter Bar Component
    limit: this.itemsPerPage(),   // ✅ API-driven pagination
    offset: (this.currentPage() - 1) * this.itemsPerPage(), // ✅ API-driven pagination offset
    page: this.currentPage(),     // ✅ Frontend-driven pagination
  }));

  // ✅ Signal to show/hide skeleton loader
  isLoading = signal<boolean>(false);

  // ✅ Pagination State
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(50); // ✅ Adjust as needed

  // ✅ Compute Total Pages (Avoid using `Math` directly)
  totalPages = computed(() => {
    return this.totalProducts() ? Math.ceil(this.totalProducts() / this.itemsPerPage()) : 1;
  });

  constructor(private readonly productService: ProductService,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading.set(true);
    // this.fetchProducts();

    this.route.queryParams.subscribe(params => {
      this.filters.set(params);
      this.currentPage.set(Number(params['page']) || 1);
      this.handleSeoBasedOnFilters(params);
      this.fetchProducts();
    });
  }

  private handleSeoBasedOnFilters(params: Record<string, any>): void {
    const hasFilters = Object.keys(params).length > 0;

    if (hasFilters) {
      this.seoService.update(
        'Explore Herbal Products | Kalagura Gampa',
        'Filter and discover natural food and wellness products tailored to your needs.'
      );
      document.head.querySelector("meta[name='robots']")?.remove();
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, follow';
      document.head.appendChild(meta);

      this.seoService.setCanonical('https://kalaguragampa.com/products');
    } else {
      this.seoService.update(
        'Shop Herbal Products Online | Kalagura Gampa',
        'Explore our wide range of handmade herbal food and wellness products. Natural, affordable, and trusted by thousands.',
        'herbal products, natural wellness, ayurvedic oils, food powders, kalagura gampa'
      );
      document.head.querySelector("meta[name='robots']")?.remove();
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'index, follow';
      document.head.appendChild(meta);

      this.seoService.setCanonical('https://kalaguragampa.com/products');
    }
  }


  /**
   * ✅ Apply Sorting from SortFilterBar
   */
  applySort(sortOption: string): void {
    console.log('Sorting changed:', sortOption);
    this.sortBy.set(sortOption);
  }

  /**
   * ✅ Change View Mode (Grid/List)
   */
  changeViewMode(view: 'list' | 'grid'): void {
    console.log('View changed:', view);
    this.viewMode.set(view);
  }

  /** ✅ Receive filters from ProductFiltersComponent */
  updateFilters(params: IProductQueryParams) {
    this.isLoading.set(true);

    this.filtersChanged.set(params);
    this.currentPage.set(1);

    // Remove category_id if it's an empty string or null, otherwise keep it
    const merged = { ...this.filters(), ...(params ?? {}), page: 1 };
 
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: merged,
      queryParamsHandling: 'merge'
    });
    this.fetchProducts();
  }

  /**
 * ✅ Apply Filters from `app-sort-filter-bar`
 */
  applyFilters(params: IProductQueryParams) {
    this.filters.set({ ...this.filters(), ...params });
    this.currentPage.set(1);
    this.updateFilters(params);
    this.fetchProducts(); // Fetch products after filter change
  }

  /**
    * ✅ Handle Page Change
    */
  changePage(newPage: number) {
    if (newPage > 0 && newPage <= this.totalPages()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ...this.filters(), page: newPage },
        queryParamsHandling: 'merge'
      });
    }
    // if (newPage > 0 && newPage <= this.totalPages()) {
    //   this.currentPage.set(newPage);
    //   this.fetchProducts();
    // }
  }

  /** ✅ Reset filters */
  resetFilters() {
    this.filters.set({});
    this.filtersChanged.set({});
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    this.products.set([]); // Clear products before fetching new data

    this.fetchProducts();
  }

  /**
     * ✅ Fetch Products
     */
  fetchProducts(): void {
    this.isLoading.set(true);
    // const params: IProductQueryParams = {};
    this.productService.getAllProducts(this.productParams()).subscribe({
      next: (response: any) => {
        this.products.set(response.products); // ✅ Update products
        this.totalProducts.set(response.totalCount); // ✅ Set total product count
        this.nextPage.set(response.nextPage); // ✅ Set next page URL
        this.previousPage.set(response.previousPage);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error fetching products:', error);
        this.isLoading.set(false);
      }
    });
  }
}
