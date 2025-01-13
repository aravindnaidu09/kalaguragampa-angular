import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-details',
  imports: [
    CommonModule
  ],
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.scss'
})
export class CartDetailsComponent {
  cartItems = [
    {
      id: 1,
      name: 'Cardigan',
      color: 'Green',
      quantity: 1,
      price: 2500,
      imageUrl: 'assets/cardigan.jpg',
    },
    {
      id: 2,
      name: 'Cahier Leather Shoulder Bag',
      color: 'Grey',
      quantity: 1,
      price: 2500,
      imageUrl: 'assets/bag.jpg',
    },
    {
      id: 3,
      name: 'Nordgreen Watches',
      color: 'Brown',
      quantity: 1,
      price: 2500,
      imageUrl: 'assets/watch.jpg',
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
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
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
