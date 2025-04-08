import { Component, inject, Input } from '@angular/core';
import { Order, OrderItem } from '../../_model/order-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-card',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  private router = inject(Router);

  @Input() item!: OrderItem;

  getStatusClass(isRated?: boolean): string {
    return isRated ? 'green' : 'orange';
  }

  reviewProduct(item: OrderItem): void {
    // You can route to review page or open a modal
    console.log('Reviewing product:', item);
    this.router.navigate(['/review', item.productId]);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Delivered': return 'delivered';
      case 'Pending': return 'pending';
      case 'Cancelled': return 'cancelled';
      default: return '';
    }
  }

}
