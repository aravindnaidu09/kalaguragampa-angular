import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  imports: [],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {
  orderDetails = {
    productName: 'Cahier Leather...',
    color: 'Grey',
    quantity: 1,
    price: 2500,
    subtotal: 2500,
    discount: 0,
    shipmentCost: 22.50,
    grandTotal: 2522.50
  };

  constructor(private readonly router: Router) {}

  goToPaymentPage() {
    this.router.navigate(['/payment']);
  }
}
