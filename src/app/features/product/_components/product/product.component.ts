import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, OnChanges, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartWishlistService } from '../../../../core/services/cart-wishlist.service';
import { IProduct } from '../../_models/product-model';
import { HtmlParserPipe } from '../../../../core/utils/html-parser.pipe';
import { ProductService } from '../../_services/product.service';
import { WishlistStore } from '../../_services/wishliststore';

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
    private readonly productService: ProductService
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

  addToCart() {
    console.log('Added to Cart');
    // this.router.navigate(['/cart']);
    this.cartWishListService.updateCartCount(1);
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
  isInWishlist(productId: string): boolean {
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
}
