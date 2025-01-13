import { Component } from '@angular/core';
import { ShippingBillingComponent } from "../shipping-billing/shipping-billing.component";
import { OrderSummaryComponent } from "../order-summary/order-summary.component";

@Component({
  selector: 'app-checkout-details',
  imports: [ShippingBillingComponent, OrderSummaryComponent],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.scss'
})
export class CheckoutDetailsComponent {

}
