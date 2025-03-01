import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { IProduct } from '../../_models/product-model';
import { ProductService } from '../../_services/product.service';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';

@Component({
  selector: 'app-detailed-product-list',
  imports: [
    CommonModule,
  ],
  templateUrl: './detailed-product-list.component.html',
  styleUrl: './detailed-product-list.component.scss'
})
export class DetailedProductListComponent {
  // ✅ Signals for State Management
  products = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);
  viewMode = signal<'list' | 'grid'>('grid');

  constructor(private readonly productService: ProductService) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  /**
   * ✅ Fetch Products
   */
  fetchProducts(): void {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products.set(response);
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
  trackById(index: number, product: IProduct): string {
    return product.id;
  }
}
