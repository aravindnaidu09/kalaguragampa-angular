import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { IProduct } from '../../_models/product-model';
import { ProductService } from '../../_services/product.service';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';
import { IProductQueryParams } from '../../_models/product-query-model';
import { environment } from '../../../../../environments/environment.dev';
import { Router } from '@angular/router';

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

  constructor(private readonly productService: ProductService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    // this.fetchProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['queryParams']) {
      // this.fetchProducts();
    }
  }

  navigateToProductPage(item: IProduct) {
    this.router.navigate([`/product/${item.name}/${item.id}`]);
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
