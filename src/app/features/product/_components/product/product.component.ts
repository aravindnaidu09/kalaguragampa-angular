import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CartWishlistService } from '../../../../core/services/cart-wishlist.service';
import { IProduct } from '../../_models/product-model';
import { HtmlParserPipe } from '../../../../core/utils/html-parser.pipe';
import { ProductService } from '../../_services/product.service';

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

  constructor(private router: Router,
    private readonly cartWishListService: CartWishlistService,
    private readonly productService: ProductService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productsList']) {
      this.displayedProducts.set(this.productsList);
    }
  }

  // Method to get the stars for the product rating
  getStars() {
    // return new Array(this.product.rating).fill(0);
  }

  scrollLeft() {
    document.querySelector('.product-list-container')?.scrollBy({ left: -250, behavior: 'smooth' });
  }

  scrollRight() {
    document.querySelector('.product-list-container')?.scrollBy({ left: 250, behavior: 'smooth' });
  }

  addToCart() {
    console.log('Added to Cart');
    // this.router.navigate(['/cart']);
    this.cartWishListService.updateCartCount(1);
  }

  addToWishlist(id: string) {
    console.log('Added to Wishlist');
    this.cartWishListService.updateWishlistCount(1);

    this.productService.addToWishlist(id).subscribe((data: any) => {
      console.log('wishlist-data: ', data);
    }, error => {
      console.log('wishlist-error: ', error);
    })

  }

  goToProductDetailsPage(name: string) {
    this.router.navigate([`/product/${name}`]);
  }
}
