import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { PaymentSuccessDialogComponent } from '../payment-success-dialog/payment-success-dialog.component';

@Component({
  selector: 'app-payment',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  providers: [DialogService]

})
export class PaymentComponent {
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder, private dialogService: DialogService) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['creditCard', Validators.required],
      cardNumber: ['', Validators.required],
      cardName: ['', Validators.required],
      expirationDate: ['', Validators.required],
      cvv: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.paymentForm.value);
  }

  showPaymentSuccessRFailure() {
    this.dialogService.open(PaymentSuccessDialogComponent, {
      data: {
        email: 'rhaenyra@gmail.com',
        transactionDate: 'Thursday, November 17, 2022 (GMT+7)',
        paymentMethod: 'Mastercard ending with 2564',
        shippingMethod: 'Express delivery (1-3 business days)',
        productImage: 'assets/product-image.jpg',
        productName: 'Cahier Leather Shoulder Bag',
        productColor: 'Grey',
        productPrice: 2500,
        subtotal: 2500,
        discountCode: '20% OFF',
        discount: 500,
        shipmentCost: 22.5,
        grandTotal: 2022.5,
      },
      header: 'Order Confirmation',
      width: '50vw',
      height: '70vh'
    });
  }
}
