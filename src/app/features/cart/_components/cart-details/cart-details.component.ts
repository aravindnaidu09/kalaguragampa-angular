import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-details',
  imports: [
    CommonModule
  ],
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss'],
})
export class CartDetailsComponent {
  cartItems = [
    {
      id: 1,
      name: 'Henna Powder',
      description: 'Mehandi Powder | 500 Grams',
      quantity: 1,
      price: 330,
      imageUrl: '../../../../../assets/images/Henna-2_2nd.jpg',
    },
  ];

  subtotal = this.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  discount = 0;
  grandTotal = this.subtotal - this.discount;

  constructor(private readonly router: Router) {}

  updateQuantity(item: any, operation: string) {
    if (operation === 'increment') {
      item.quantity += 1;
    } else if (operation === 'decrement' && item.quantity > 1) {
      item.quantity -= 1;
    }
    this.calculateTotal();
  }

  removeItem(itemId: number) {
    this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
    this.calculateTotal();
  }

  calculateTotal() {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.grandTotal = this.subtotal - this.discount;
  }

  goToCheckoutPage() {
    this.router.navigate(['/checkout']);
  }
}
