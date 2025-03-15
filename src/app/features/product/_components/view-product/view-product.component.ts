import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductComponent } from "../product/product.component";

@Component({
  selector: 'app-view-product',
  imports: [
    CommonModule,
    // ProductComponent
],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.scss'
})
export class ViewProductComponent {
  product = {};

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
