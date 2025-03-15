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

@Component({
  selector: 'app-product',
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
  isLoading = signal<boolean>(true);

  @ViewChild('productList', { static: false }) productList!: ElementRef;

  private wishlistStore = inject(WishlistStore);

  constructor(private router: Router,
    private readonly cartWishListService: CartWishlistService,
    private readonly productService: ProductService,
    private readonly cartService: CartService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productsList']) {
      this.isLoading.set(true); // Start loading
      setTimeout(() => {
        this.displayedProducts.set(this.productsList);
        this.isLoading.set(false); // End loading after delay
      }, 2000); // Simulating API delay
    }
  }

  // Method to get the stars for the product rating
  getStars() {
    // return new Array(this.product.rating).fill(0);
  }

  // ✅ Scroll left
  scrollLeft(): void {
    if (this.productList) {
      this.productList.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  // ✅ Scroll right
  scrollRight(): void {
    if (this.productsList) {
      this.productList.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  addToCart(productId: number) {
    // this.router.navigate(['/cart']);
    this.cartWishListService.updateCartCount(1);
    this.cartService.addToCart(productId).subscribe((result: any) => {
      console.log('cart-response: ', result);
    }, (error: any) => {

    })
  }

  addToWishlist(product: IProduct) {
    console.log('Added to Wishlist');
    this.cartWishListService.updateWishlistCount(1);

    this.productService.addToWishlist(product.id).subscribe((data: any) => {
      console.log('wishlist-data: ', data);
      this.toggleWishlist(product);
    }, error => {
      console.log('wishlist-error: ', error);
    })

  }

  goToProductDetailsPage(name: string) {
    this.router.navigate([`/product/${name}`]);
  }

  // ✅ Check if product is in wishlist
  isInWishlist(productId: number): boolean {
    return this.wishlistStore.wishlist().some(w => w.id === productId);
  }

  // ✅ Toggle Wishlist (Add/Remove)
  toggleWishlist(product: IProduct): void {
    if (this.isInWishlist(product.id)) {
      this.wishlistStore.removeFromWishlist(product.id);
      console.log(`Removed from Wishlist: ${product.name}`);
    } else {
      this.wishlistStore.addToWishlist(product);
    }
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
