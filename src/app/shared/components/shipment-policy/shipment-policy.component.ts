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
  email: string = 'info@kalaguragampa.com';
}
