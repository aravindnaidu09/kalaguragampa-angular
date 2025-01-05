import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-shipment-policy',
  imports: [
    CommonModule
  ],
  templateUrl: './shipment-policy.component.html',
  styleUrl: './shipment-policy.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-out', style({ opacity: 1 })),
      ])
    ])
  ]
})
export class ShipmentPolicyComponent {
  policySections = [
    { title: 'Shipping Policy (Products)', content: 'For domestic buyers, orders are shipped through registered domestic courier companies... ' },
    { title: 'International Courier Partner', content: 'For International Courier Partner: DHL Express... ' },
    { title: 'Delivery Time', content: 'Australia has a delivery time of 15 days... ' },
    { title: 'Product Catalogue', content: 'The product catalogue has all the possible shippable products in general... ' },
    { title: 'Payments', content: 'Kalagura Gampa uses Razorpay and other online payment systems for fast, easy, and efficient secure payments... ' },
    { title: 'Communications Policy', content: 'Delivery of our services will be confirmed on your mail ID as specified during registration... ' },
    { title: 'Disclaimer', content: 'The product will be delivered to all urban areas in India... ' },
    { title: 'Service on Holidays', content: 'Kalagura Gampa doesn’t provide services on all religious festivals and national holidays... ' }
  ];
}
