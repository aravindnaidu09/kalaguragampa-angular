import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
// import { PaymentService } from '../../_services/payment.service';
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
  // private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  paymentMethods: PaymentMethod[] = [];
  paymentForm!: FormGroup;
  isAdding: boolean = false;

  ngOnInit(): void {
    this.initializeForm();
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

}
