import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../_services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IOrder } from '../../_model/order-model';
import { OrderCardComponent } from '../order-card/order-card.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngxs/store';
import { OrderState } from '../../_state/order.state';
import { OrderFacade } from '../../_state/order.facade';

@Component({
  selector: 'app-order-history',
  imports: [
    CommonModule,
    FormsModule,
    OrderCardComponent
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
  providers: [OrderService, ToastService],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OrderHistoryComponent {
  private orderFacade = inject(OrderFacade);
  private toastService = inject(ToastService);

  ordersSignal = this.orderFacade.ordersSignal;
  loadingSignal = this.orderFacade.loadingSignal;

  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.orderFacade.loadOrders();
  }

  get paginatedOrders(): IOrder[] {
    const orders = this.ordersSignal();
    const start = (this.currentPage - 1) * this.pageSize;
    return orders.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    const total = this.ordersSignal().length;
    if ((this.currentPage * this.pageSize) < total) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
