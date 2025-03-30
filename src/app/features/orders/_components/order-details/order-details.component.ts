import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { OrderState } from '../../_state/orders.state';
import { LoadOrders } from '../../_state/orders.action';
import { Order } from '../../../settings/_model/order-model';
import { CommonModule } from '@angular/common';
import { OrderCardComponent } from '../order-card/order-card.component';

@Component({
  selector: 'app-order-details',
  imports: [
    CommonModule,
    OrderCardComponent
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
  @Select(OrderState.getOrders) orders$!: Observable<Order[]>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new LoadOrders());
  }
}
