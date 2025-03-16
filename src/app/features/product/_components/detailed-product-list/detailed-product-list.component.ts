import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { IProduct } from '../../_models/product-model';
import { ProductService } from '../../_services/product.service';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';
import { IProductQueryParams } from '../../_models/product-query-model';
import { environment } from '../../../../../environments/environment.dev';

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
  products = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);
  viewMode = signal<'list' | 'grid'>('grid');

  // ✅ New signals for pagination metadata
  totalProducts = signal(0); // Total product count
  nextPage = signal<string | null>(null); // Next page URL
  previousPage = signal<string | null>(null); // Previous page URL

  constructor(private readonly productService: ProductService) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['queryParams']) {
      this.fetchProducts();
    }
  }

  /**
   * ✅ Fetch Products
   */
  fetchProducts(): void {
    this.isLoading.set(true);
    // const params: IProductQueryParams = {};
    this.productService.getAllProducts(this.queryParams).subscribe({
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

  /**
   * ✅ Toggle Wishlist
   */
  toggleWishlist(product: IProduct): void {
    console.log('Wishlist Toggled for:', product.name);
  }

  /**
   * ✅ Add to Cart
   */
  addToCart(product: IProduct): void {
    console.log('Added to Cart:', product.name);
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
