import { Component } from '@angular/core';

@Component({
  selector: 'app-view-product',
  imports: [],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.scss'
})
export class ViewProductComponent {
  product = {
    name: 'Airpods Max',
    image: 'path/to/product-image.jpg',  // Replace with actual product image
    description: 'A perfect balance of exhilarating high-fidelity audio and the effortless magic of AirPods.',
    price: 549.00,
    monthlyPayment: '99.99',
    stock: 12,
    colors: ['#FF3B30', '#FF9500', '#4CD964', '#5AC8FA', '#6A4CFF'],
  };

  addToCart() {
    console.log('Product added to cart');
  }
}
