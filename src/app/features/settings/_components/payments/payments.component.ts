import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentService } from '../../_services/payment.service';
import { PaymentMethod } from '../../_model/payment-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  paymentMethods: PaymentMethod[] = [];
  paymentForm!: FormGroup;
  isAdding: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
    this.fetchPaymentMethods();
  }

  // ✅ Initialize Payment Form
  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]], // MM/YY
      cardHolder: ['', [Validators.required]],
      isDefault: [false]
    });
  }

  // ✅ Fetch Saved Payment Methods
  private fetchPaymentMethods(): void {
    this.paymentService.getUserPayments().subscribe({
      next: (data) => (this.paymentMethods = data),
      error: () => this.toastService.showError('Failed to load payment methods')
    });
  }

  // ✅ Add New Payment Method
  addPaymentMethod(): void {
    if (this.paymentForm.invalid) {
      this.toastService.showError('Please fill all required fields');
      return;
    }

    this.paymentService.addPayment(this.paymentForm.value).subscribe({
      next: () => {
        this.toastService.showSuccess('Payment method added successfully');
        this.fetchPaymentMethods();
        this.isAdding = false;
      },
      error: () => this.toastService.showError('Failed to add payment method')
    });
  }

  // ✅ Delete Payment Method
  deletePayment(id: number): void {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.paymentService.deletePayment(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Payment method deleted');
          this.fetchPaymentMethods();
        },
        error: () => this.toastService.showError('Failed to delete payment method')
      });
    }
  }

  // ✅ Set Default Payment Method
  setDefaultPayment(id: number): void {
    this.paymentService.setDefaultPayment(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Default payment method set');
        this.fetchPaymentMethods();
      },
      error: () => this.toastService.showError('Failed to set default payment method')
    });
  }
}
