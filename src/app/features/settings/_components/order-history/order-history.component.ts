import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../_services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { OrderCardComponent } from '../order-card/order-card.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { OrderFacade } from '../../_state/order.facade';
import { ActivatedRoute, Router } from '@angular/router';

type OrderStatusOption = {
  /** canonical key we use in FE and (usually) send to BE */
  key: string;
  /** label to show in chip */
  label: string;
  /** dot color in chip */
  color: string;
  /** other backend values that should be treated like this status */
  aliases?: string[];
};

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

  /** signals from facade */
  ordersSignal = this.orderFacade.ordersSignal;
  loadingSignal = this.orderFacade.loadingSignal;
  totalCountSignal = this.orderFacade.totalCountSignal;

  /** paging */
  currentPage = 1;
  pageSize = 10;

  /** filters */
  selectedStatus: string = 'all';    // show all by default
  selectedTime: string = '3';        // last 3 months
  statusCounts: Record<string, number> = {};

  /** single source of truth for statuses (includes aliases) */
  statusOptions: OrderStatusOption[] = [
    { key: 'all', label: 'All', color: '#6b7280' },
    { key: 'pending', label: 'Pending', color: '#0ea5e9' },
    // { key: 'processing', label: 'Processing', color: '#0ea5e9', aliases: ['pending'] },
    // { key: 'picked_up', label: 'Picked Up', color: '#8b5cf6' },
    { key: 'in_transit', label: 'In Transit', color: '#f59e0b' },
    // { key: 'out_for_delivery', label: 'Out for Delivery', color: '#16a34a' },
    { key: 'delivered', label: 'Delivered', color: '#22c55e' },
    // { key: 'failed', label: 'Failed', color: '#ef4444', aliases: ['undelivered', 'failed'] },
    { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    // { key: 'return_pending', label: 'Return Pending', color: '#f97316' },
    { key: 'returned', label: 'Returned', color: '#a855f7' },
  ];

  /** convenience lookups */
  private allKeys = new Set(this.statusOptions.map(o => o.key));
  private aliasToKey = (() => {
    const map = new Map<string, string>();
    for (const o of this.statusOptions) {
      for (const a of o.aliases ?? []) map.set(a, o.key);
    }
    return map;
  })();

  /** client-side page slice */
  paginatedOrders = computed(() => {
    const orders = this.ordersSignal();
    const start = (this.currentPage - 1) * this.pageSize;
    return orders.slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // normalize incoming query values
      this.selectedStatus = this.normalizeStatusParam(params['status']) ?? 'all';
      this.selectedTime = params['time'] ?? '3';
      this.currentPage = +(params['page'] ?? 1);

      this.loadOrders();
    });
  }

  /** Convert unknown/legacy statuses to our canonical keys (e.g., pending → processing, undelivered → failed) */
  private normalizeStatusParam(raw?: string): string | undefined {
    if (!raw) return undefined;
    // already a canonical key?
    if (this.allKeys.has(raw)) return raw;
    // alias → canonical key
    const mapped = this.aliasToKey.get(raw);
    if (mapped) return mapped;
    // unknown → default to 'all'
    return 'all';
  }

  private buildFilters() {
    const offset = (this.currentPage - 1) * this.pageSize;

    // If you need to send multiple statuses for an option (e.g., 'failed' → ['failed','undelivered']),
    // you can extend your API to accept `status_in`. For now we keep it simple with single `status`.
    const status = this.selectedStatus !== 'all' ? this.selectedStatus : undefined;

    // month range vs fixed year
    const isMonths = ['3', '6', '12'].includes(this.selectedTime);
    const range = isMonths ? `${this.selectedTime}m` : undefined;
    const year = !isMonths ? this.selectedTime : undefined;

    return { limit: this.pageSize, offset, status, range, year };
  }

  private loadOrders(): void {
    this.orderFacade.loadOrdersWithFilters(this.buildFilters());
  }

  /** reflect filters in query string (clean URLs: omit defaults) */
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

  /** paging */
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

  /** status/time changes */
  selectStatus(statusKey: string): void {
    this.selectedStatus = this.normalizeStatusParam(statusKey) ?? 'all';
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  onTimeFilterChange(): void {
    this.currentPage = 1;
    this.updateUrlQuery();
    this.loadOrders();
  }

  /** quick reset helpers */
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

  /** OPTIONAL: if you want counts on chips, call this with your current orders */
  recomputeCounts(orders: Array<{ status: string }>) {
    const counts: Record<string, number> = {};
    for (const opt of this.statusOptions) counts[opt.key] = 0;

    for (const o of orders) {
      const normalized = this.normalizeStatusParam(o.status) ?? 'all';
      if (counts[normalized] !== undefined) counts[normalized]++;
    }
    counts['all'] = orders.length;
    this.statusCounts = counts;
  }

  statusLabelMap: Record<string, string> = this.statusOptions
    .reduce((acc, o) => { acc[o.key] = o.label; return acc; }, {} as Record<string, string>);

  private toTitleCase(s: string): string {
    return s.replace(/_/g, ' ')
      .split(' ')
      .map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)
      .join(' ');
  }

  getStatusLabel(key: string): string {
    return this.statusLabelMap[key] ?? this.toTitleCase(key);
  }
}
