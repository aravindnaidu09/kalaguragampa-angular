import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-payment-success-dialog',
  imports: [
    CommonModule,
    DialogModule
  ],
  templateUrl: './payment-success-dialog.component.html',
  styleUrl: './payment-success-dialog.component.scss'
})
export class PaymentSuccessDialogComponent {
  isVisible: boolean = true;

  constructor(private dialogRef: DynamicDialogRef, public config: DynamicDialogConfig) { }

  closeDialog() {
    this.dialogRef.close();
  }
}
