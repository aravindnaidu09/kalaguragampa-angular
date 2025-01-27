import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-success-dialog',
  imports: [
    CommonModule,
  ],
  templateUrl: './payment-success-dialog.component.html',
  styleUrl: './payment-success-dialog.component.scss'
})
export class PaymentSuccessDialogComponent {
  isVisible: boolean = true;

  constructor() { }

  closeDialog() {
  }
}
