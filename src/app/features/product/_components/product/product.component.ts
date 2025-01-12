import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
    name: 'Gaming Headphone',
    image: '../../../../../assets/images/logo.png',  // Add the path to your product image
    description: 'Table with air purifier, stained veneer/black',
    price: 239.00,
    ratingCount: 121,
    rating: 4
  };


  constructor(private router: Router) {}

  // Method to get the stars for the product rating
  getStars() {
    return new Array(this.product.rating).fill(0);
  }

  addToCart() {
    console.log('Added to Cart');
  }

  addToWishlist() {
    console.log('Added to Wishlist');
  }

  goToProductDetailsPage(name: string) {
    this.router.navigate([`/product/${name}`]);
  }
}
