import { Component, Input } from '@angular/core';
import { Order } from '../../../settings/_model/order-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-card',
  imports: [
    CommonModule
  ],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  @Input() order!: Order;
}
