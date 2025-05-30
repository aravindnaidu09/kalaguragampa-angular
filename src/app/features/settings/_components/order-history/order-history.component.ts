import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../_services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IOrder } from '../../_model/order-model';
import { OrderCardComponent } from '../order-card/order-card.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { OrderFacade } from '../../_state/order.facade';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderCardComponent],
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ordersSignal = this.orderFacade.ordersSignal;
  loadingSignal = this.orderFacade.loadingSignal;

  currentPage = 1;
  pageSize = 5;

  statuses = ['all', 'paid', 'pending', 'delivered', 'cancelled'];
  selectedStatus = 'all';
  selectedTime: string = '3';

  ngOnInit(): void {
    this.orderFacade.loadOrders();

    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || 'all';
      this.selectedTime = params['time'] || '3';
      this.currentPage = +(params['page'] || 1);
    });
  }

  updateUrlQuery(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.selectedStatus !== 'all' ? this.selectedStatus : null,
        time: this.selectedTime !== '3' ? this.selectedTime : null,
        page: this.currentPage !== 1 ? this.currentPage : null
      },
      queryParamsHandling: 'merge',
    });
  }


  get filteredOrders(): IOrder[] {
    const now = new Date();
    const timeFilter = this.selectedTime;

    return (
      this.ordersSignal()
        ?.filter(order => {
          const created = new Date(order.created_at);

          const matchesStatus =
            this.selectedStatus === 'all' || order.status === this.selectedStatus;

          const matchesTime = (() => {
            if (!timeFilter) return true;
            if (+timeFilter <= 12) {
              const monthsAgo = new Date(now);
              monthsAgo.setMonth(now.getMonth() - +timeFilter);
              return created >= monthsAgo;
            } else {
              return created.getFullYear().toString() === timeFilter;
            }
          })();

          return matchesStatus && matchesTime;
        }) ?? []
    );
  }

  get paginatedOrders(): IOrder[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    const orders = this.filteredOrders;

    // Reset page if out of bounds due to filtering
    if (orders.length > 0 && start >= orders.length) {
      this.currentPage = 1;
      return orders.slice(0, this.pageSize);
    }

    return orders.slice(start, end);
  }

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

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
  }

  onTimeFilterChange(): void {
    this.currentPage = 1;
  }

  getTimeLabel(value: string): string {
    switch (value) {
      case '3': return 'Last 3 Months';
      case '6': return 'Last 6 Months';
      case '12': return 'Last 1 Year';
      default: return `Year: ${value}`;
    }
  }

  clearStatus(): void {
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.updateUrlQuery();
  }

  clearTime(): void {
    this.selectedTime = '3';
    this.currentPage = 1;
    this.updateUrlQuery();
  }

  resetFilters(): void {
    this.selectedStatus = 'all';
    this.selectedTime = '3';
    this.currentPage = 1;
    this.updateUrlQuery();
  }

}
