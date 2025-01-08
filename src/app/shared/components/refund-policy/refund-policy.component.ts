import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-refund-policy',
  imports: [
    CommonModule
  ],
  templateUrl: './refund-policy.component.html',
  styleUrl: './refund-policy.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-out', style({ opacity: 1 })),
      ])
    ])
  ]
})
export class RefundPolicyComponent {
  policySections = [
    { title: 'Cancellation Policy', content: 'Kalaguragampa believes in helping its customers the comfort of choosing the products for shipment... ' },
    { title: 'Cancellation Requests', content: 'Cancellations will be considered only if the request is made within 12 hours of placing an order... ' },
    { title: 'Same Day Delivery', content: 'There is no cancellation of orders placed under the Same Day Delivery category... ' },
    { title: 'Occasion Offers', content: 'No cancellations are entertained for those products that Kalaguragampa has obtained on special occasions... ' },
    { title: 'Damaged Products', content: 'In case of receipt of damaged or defective consumer durable items and nondurable items... ' },
    { title: 'Customer Complaints', content: 'In case you feel that the product received is not as shown on the site... ' },
    { title: 'Refund Policy', content: 'Orders delivered & accepted by the customer cannot be refunded... ' },
    { title: 'Payment Gateway', content: 'Kalaguragampa is responsible only after the payment is received / captured... ' }
  ];
}
