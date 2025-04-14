import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../_services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IOrder, Order } from '../../_model/order-model';
import { OrderCardComponent } from '../order-card/order-card.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngxs/store';
import { OrderState } from '../../_state/order.state';

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
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private store = inject(Store); // Assuming you have a store service for state management

  loading = this.store.selectSnapshot(OrderState.loading);


  orders: IOrder[] = [];
  filteredOrders = this.orders;
  // paginatedOrders = this.orders;

  // filteredOrders: Order[] = [];
  selectedStatus: string = 'all';
  selectedDateRange: string = 'past3months';
  currentPage: number = 1;
  pageSize: number = 5;

  ngOnInit(): void {
    this.fetchOrders();
  }

  // ✅ Fetch Orders from Backend
  private fetchOrders(): void {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        console.log('Fetched Orders:', data);
        this.orders = data;
        this.filterOrders();
      },
      error: () => this.toastService.showError('Failed to load orders')
    });
  }

  // ✅ Filter Orders by Status
  setStatus(status: string): void {
    this.selectedStatus = status;
    this.filterOrders();
  }

  // ✅ Filter Orders by Date Range
  // filterByDate(): void {
  //   const now = new Date();
  //   this.filteredOrders = this.orders.filter(order => {
  //     const orderDate = new Date(order.delivery_date);
  //     const differenceInDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

  //     if (this.selectedDateRange === 'past3months') {
  //       return differenceInDays <= 90;
  //     } else if (this.selectedDateRange === 'past6months') {
  //       return differenceInDays <= 180;
  //     } else if (this.selectedDateRange === 'pastYear') {
  //       return differenceInDays <= 365;
  //     }
  //     return true;
  //   });

  //   this.currentPage = 1; // Reset pagination after filtering
  // }

  // ✅ Filter Orders by Status & Date Combined
  filterOrders(): void {
    // this.filterByDate(); // Apply date filtering first

    if (this.selectedStatus !== 'all') {
      this.filteredOrders = this.filteredOrders.filter(order => order.status === this.selectedStatus);
    }

    this.currentPage = 1; // Reset pagination
  }

  // ✅ Pagination Logic
  // get paginatedOrders(): Order[] {
  //   const start = (this.currentPage - 1) * this.pageSize;
  //   return this.filteredOrders.slice(start, start + this.pageSize);
  // }

  nextPage(): void {
    if ((this.currentPage * this.pageSize) < this.filteredOrders.length) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ✅ Order Actions
  buyAgain(order: Order): void {
    this.toastService.showSuccess('Added to cart!');
  }

  trackOrder(order: Order): void {
    this.toastService.showInfo('Tracking order...');
  }

  viewOrderDetails(order: Order): void {
    this.toastService.showInfo('Opening order details...');
  }

  viewInvoice(order: Order): void {
    this.toastService.showInfo('Downloading invoice...');
  }
}
