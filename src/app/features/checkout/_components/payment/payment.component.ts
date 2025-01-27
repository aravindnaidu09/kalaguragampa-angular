import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  providers: []

})
export class PaymentComponent {
  paymentForm: FormGroup;

  constructor(private fb: FormBuilder) {
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

  }
}
