import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartWishlistService } from '../../../../core/services/cart-wishlist.service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  product = {
    name: 'Henna Powder',
    image: '../../../../../assets/images/Henna-2_2nd.jpg',
    description: 'Mehandi Powder | 500 Grams',
    price: 330.00,
    ratingCount: 10,
    rating: 4
  };


  constructor(private router: Router,
    private readonly cartWishListService: CartWishlistService
  ) {}

  // Method to get the stars for the product rating
  getStars() {
    return new Array(this.product.rating).fill(0);
  }

  addToCart() {
    console.log('Added to Cart');
    // this.router.navigate(['/cart']);
    this.cartWishListService.updateCartCount(1);
  }

  addToWishlist() {
    console.log('Added to Wishlist');
    this.cartWishListService.updateWishlistCount(1);
  }

  goToProductDetailsPage(name: string) {
    this.router.navigate([`/product/${name}`]);
  }
}
