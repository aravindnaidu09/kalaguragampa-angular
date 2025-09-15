import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IOrder, IOrderProduct } from '../../_model/order-model';
import { ToastService } from '../../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { ReviewProductInfo } from '../../../product/_models/add-review.model';
import { ReviewFacade } from '../../../product/_state/review.facade';
import { environment } from '../../../../../environments/environment.dev';
import { OrderService } from '../../_services/order.service';
import { OrderFacade } from '../../_state/order.facade';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

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
  private reviewFacade = inject(ReviewFacade);
  private orderService = inject(OrderService);
  private orderFacade = inject(OrderFacade);
  private confirmService = inject(ConfirmDialogService);

  @Input() item!: IOrder;

  collapsedOrders = new Set<number>(); // store collapsed order IDs

  invoiceLoading: { [orderId: number]: boolean } = {};
  cancelLoading = false;

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
    // this.router.navigate(['/order', orderId, 'invoice']);

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
    const id = Number(item.id);                   // make sure it's a number
    if (!Number.isFinite(id)) { return; }         // optional guard

    const reviewProductInfo: ReviewProductInfo = {
      id,
      name: item.name ?? '',
      image: item.images?.[0] ?? ''               // safe optional chaining
    };

    this.reviewFacade.setProduct(reviewProductInfo);
    this.router.navigate(['/review-product', id]); // route should be /review-product/:id
  }


  copyOrderId(orderId: string): void {
    navigator.clipboard.writeText(orderId).then(() => {
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

  getImagePath(imagePath?: string): string {
    return imagePath?.trim()
      ? `${environment.apiBaseUrl}${imagePath}`
      : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }


  onCancelOrder(id: number) {
    this.confirmService.confirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Yes, Cancel',
      cancelText: 'No'
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.cancelLoading = true;
        this.orderFacade.cancelOrder(id).subscribe({
          next: () => {
            this.cancelLoading = false;

            // ✅ Optimistically update local signal
            const current = this.item;
            if (current) {
              const updated = { ...current, status: 'Cancelled' };
              this.orderFacade.updateTrackingSignal(updated); // 👈 implement this below
            }
          },
          error: () => {
            this.cancelLoading = false;
          }
        });
      }
    });
  }

  downloadInvoice(orderId: number) {
    this.invoiceLoading[orderId] = true;

    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_Order_${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.toast.showSuccess('Invoice downloaded successfully!')
      },
      complete: () => {
        this.invoiceLoading[orderId] = false;
      },
      error: () => {
        this.invoiceLoading[orderId] = false;
      }
    });
  }


}
