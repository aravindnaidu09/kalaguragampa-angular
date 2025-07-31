import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../_services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ordersSignal = this.orderFacade.ordersSignal;
  loadingSignal = this.orderFacade.loadingSignal;
  totalCountSignal = this.orderFacade.totalCountSignal;

  currentPage = 1;
  pageSize = 10;

  statuses = ['all', 'pending', 'delivered', 'cancelled'];
  selectedStatus = 'all';
  selectedTime: string = '3';

  paginatedOrders = computed(() => {
    const orders = this.ordersSignal();
    const start = (this.currentPage - 1) * this.pageSize;
    return orders.slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || 'all';
      this.selectedTime = params['time'] || '3';
      this.currentPage = +(params['page'] || 1);
      this.loadOrders();
    });
  }

  private buildFilters() {
    const offset = (this.currentPage - 1) * this.pageSize;
    return {
      limit: this.pageSize,
      offset,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      range: ['3', '6', '12'].includes(this.selectedTime) ? `${this.selectedTime}m` : undefined,
      year: !['3', '6', '12'].includes(this.selectedTime) ? this.selectedTime : undefined
    };
  }

  private loadOrders(): void {
    this.orderFacade.loadOrdersWithFilters(this.buildFilters());
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

  nextPage(): void {
    this.currentPage++;
    this.updateUrlQuery();
    this.loadOrders();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateUrlQuery();
      this.loadOrders();
    }
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  onTimeFilterChange(): void {
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  clearStatus(): void {
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  clearTime(): void {
    this.selectedTime = '3';
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  resetFilters(): void {
    this.selectedStatus = 'all';
    this.selectedTime = '3';
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  getTimeLabel(value: string): string {
    switch (value) {
      case '3': return 'Last 3 Months';
      case '6': return 'Last 6 Months';
      case '12': return 'Last 1 Year';
      default: return `Year: ${value}`;
    }
  }
}
