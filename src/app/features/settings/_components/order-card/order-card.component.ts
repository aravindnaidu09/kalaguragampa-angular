import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IOrder } from '../../_model/order-model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  private router = inject(Router);
  private toast = inject(ToastService);

  @Input() item!: IOrder;

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

  goToTrack(orderId: number): void {
    this.router.navigate(['/track-order/', orderId]);
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

  reviewProduct(item: IOrder) {
    this.router.navigate(['/review-product', item.order_id]);
  }

  copyOrderId(orderId: number): void {
    navigator.clipboard.writeText(orderId.toString()).then(() => {
      this.toast.showSuccess('Order ID copied!');
    }).catch(() => {
      this.toast.showError('Failed to copy Order ID');
    });
  }

}
