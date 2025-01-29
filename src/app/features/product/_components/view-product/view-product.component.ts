import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductComponent } from "../product/product.component";

@Component({
  selector: 'app-view-product',
  imports: [
    CommonModule,
    ProductComponent
],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.scss'
})
export class ViewProductComponent {
  product = {
    name: 'Airpods Max',
    image: '../../../../../assets/images/sign-in-page.png',  // Replace with actual product image
    description: 'A perfect balance of exhilarating high-fidelity audio and the effortless magic of AirPods.',
    price: 549.00,
    monthlyPayment: '99.99',
    stock: 12,
    colors: ['#FF3B30', '#FF9500', '#4CD964', '#5AC8FA', '#6A4CFF'],
  };

  quantity: number = 0;
  items = Array.from({ length: 4 });

  constructor(private readonly router: Router) {}

  addToCart() {
    console.log('Product added to cart');
    this.router.navigate(['/cart']);
  }

  goToCheckoutPage() {
    this.router.navigate(['/checkout']);
  }
}
