import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IOrder, IOrderProduct } from '../../_model/order-model';
import { ToastService } from '../../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  animations: [
    trigger('fadeExpand', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class OrderCardComponent {
  private router = inject(Router);
  private toast = inject(ToastService);

  @Input() item!: IOrder;

  collapsedOrders = new Set<number>(); // store collapsed order IDs


  // Map backend status to color class
  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      case 'pending':
      case 'confirmed':
      case 'shipped':
      default: return 'pending';
    }
  }

  getFormattedDate(date: string | null): string {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goToInvoice(orderId: number): void {
    this.router.navigate(['/order', orderId, 'invoice']);
  }

  goToTrack(id: number): void {
    this.router.navigate(['/track-order/', id]);
  }

  formatDate(date?: string | null): string {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  statusDotClass(status: string | undefined): string {
    switch (status) {
      case 'Delivered': return 'green';
      case 'Pending': return 'orange';
      case 'Cancelled': return 'red';
      default: return 'orange';
    }
  }

  reviewProduct(item: IOrderProduct) {
    this.router.navigate(['/review-product', item.id]);
  }

  copyOrderId(orderId: number): void {
    navigator.clipboard.writeText(orderId.toString()).then(() => {
      this.toast.showSuccess('Order ID copied!');
    }).catch(() => {
      this.toast.showError('Failed to copy Order ID');
    });
  }

  toggleCollapse(orderId: number): void {
    if (this.collapsedOrders.has(orderId)) {
      this.collapsedOrders.delete(orderId);
    } else {
      this.collapsedOrders.add(orderId);
    }
  }

  isCollapsed(orderId: number): boolean {
    return this.collapsedOrders.has(orderId);
  }

}
