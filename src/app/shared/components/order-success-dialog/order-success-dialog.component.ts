import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-order-success-dialog',
  imports: [],
  templateUrl: './order-success-dialog.component.html',
  styleUrl: './order-success-dialog.component.scss'
})
export class OrderSuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: string; date: string }
  ) {}

  goToOrders(): void {
    this.dialogRef.close('orders');
  }

  continueShopping(): void {
    this.dialogRef.close('shop');
  }
}
