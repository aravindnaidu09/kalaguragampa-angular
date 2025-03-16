import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, OnChanges, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartWishlistService } from '../../../../core/services/cart-wishlist.service';
import { IProduct } from '../../_models/product-model';
import { HtmlParserPipe } from '../../../../core/utils/html-parser.pipe';
import { ProductService } from '../../_services/product.service';
import { WishlistStore } from '../../_services/wishliststore';
import { environment } from '../../../../../environments/environment.dev';
import { CartService } from '../../../cart/_services/cart.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    HtmlParserPipe
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnChanges {
  @Input() productsList: IProduct[] = [];
  displayedProducts = signal<IProduct[]>([]);

  @ViewChild('productList', { static: false }) productList!: ElementRef;

  private wishlistStore = inject(WishlistStore);

  /** ✅ Scroll Debounce (Prevents excessive calls) */
  private scrollDebounce$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly cartWishListService: CartWishlistService,
    private readonly productService: ProductService,
    private readonly cartService: CartService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productsList']?.currentValue) {
      this.displayedProducts.set(this.productsList);
    }
  }

  // ✅ Scroll Left (With Debounce)
  scrollLeft(): void {
    this.scrollDebounce$.next();
    this.productList?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  // ✅ Scroll Right (With Debounce)
  scrollRight(): void {
    this.scrollDebounce$.next();
    this.productList?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  /** ✅ Add to Cart (Debounced Requests) */
  addToCart(productId: number) {
    this.cartWishListService.updateCartCount(1);
    this.cartService.addToCart(productId).subscribe({
      next: (result) => console.log('Cart Updated: ', result),
      error: (err) => console.error('Cart Error:', err)
    });
  }

  /** ✅ Add to Wishlist */
  addToWishlist(product: IProduct) {
    console.log('Added to Wishlist');
    this.cartWishListService.updateWishlistCount(1);
    this.toggleWishlist(product);

    this.productService.addToWishlist(product.id!).subscribe({
      next: (data) => console.log('Wishlist Updated:', data),
      error: (err) => console.error('Wishlist Error:', err)
    });
  }

  /** ✅ Navigate to Product Details */
  goToProductDetailsPage(name: string, id: number) {
    this.router.navigate([`/product/${name}/${id}`]);
  }

  /** ✅ Check if product is in wishlist */
  isInWishlist(productId: number): boolean {
    return this.wishlistStore.wishlist().some(w => w.id === productId);
  }

  /** ✅ Toggle Wishlist */
  toggleWishlist(product: IProduct): void {
    if (this.isInWishlist(product.id!)) {
      this.wishlistStore.removeFromWishlist(product.id);
      console.log(`Removed from Wishlist: ${product.name}`);
    } else {
      this.wishlistStore.addToWishlist(product);
    }
  }

  /** ✅ Lazy Loading Image Handler */
  getImagePath(imagePath?: string): string {
    return imagePath && imagePath.trim() ? `${environment.apiBaseUrl}${imagePath}` : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  /** ✅ Handle Image Error */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }
}
