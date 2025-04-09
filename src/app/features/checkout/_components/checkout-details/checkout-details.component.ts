import { Component, inject, OnInit } from '@angular/core';
import { ShippingBillingComponent } from "../shipping-billing/shipping-billing.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartDetailsComponent } from "../../../cart/_components/cart-details/cart-details.component";
import { PriceSummaryComponent } from "../../../cart/_components/price-summary/price-summary.component";
import { AddAddressDialogComponent } from '../add-address-dialog/add-address-dialog.component';
import { AddressFormComponent } from "../address-form/address-form.component";
import { AddressFacade } from '../../../settings/_state/address.facade';
import { Address, serializeAddress } from '../../../settings/_model/address-model';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { DeliveryOption } from '../../../../core/models/delivery.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { CartFacade } from '../../../cart/_state/cart.facade';
import { RazorpayService } from '../../../../core/services/razorpay.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RazorpayOrder } from '../../../../core/models/razorpay.model';
import { AuthService } from '../../../auth/_services/auth.service';
import { ProfileFacade } from '../../../settings/_state/profile.facade';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-details',
  imports: [
    CommonModule,
    FormsModule,
    ShippingBillingComponent,
    CartDetailsComponent,
    PriceSummaryComponent,
    AddressFormComponent
  ],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.scss'
})
export class CheckoutDetailsComponent implements OnInit {
  private addressFacade = inject(AddressFacade);
  private deliveryService = inject(DeliveryService);
  private paymentService = inject(PaymentService);
  private cartFacade = inject(CartFacade);
  private razorpayService = inject(RazorpayService);
  private toastService = inject(ToastService);
  private authFacade = inject(ProfileFacade);
  private router = inject(Router);



  currentStep = 0;
  formMode: 'add' | 'edit' = 'add';

  selectedAddressForEdit: Address = {};

  deliveryOptions: DeliveryOption[] = [];
  selectedDeliveryOption?: DeliveryOption;

  ngOnInit(): void {
    this.fetchDeliveryOptions();
  }

  fetchDeliveryOptions(): void {
    this.deliveryService.getDeliveryOptions().subscribe({
      next: (options) => this.deliveryOptions = options,
      error: () => console.error('Failed to fetch delivery options')
    });
  }

  selectDeliveryOption(option: DeliveryOption) {
    this.selectedDeliveryOption = option;
  }

  setStep(step: number): void {
    this.currentStep = step;
  }

  goToNextStep(): void {
    this.currentStep++;
  }

  goToPreviousStep(): void {
    this.currentStep--;
  }

  goToAddAddressStep(event: any): void {
    console.log('checking-event', event);
    this.formMode = event.mode;
    if (this.formMode === 'edit') {
      this.selectedAddressForEdit = event.selectedAddress;
    }
    this.currentStep = 1;
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  handleAddressSave(rawPayload: any) {
    const payload = serializeAddress(rawPayload);
    if (this.formMode === 'edit') {
      this.updateAddress(payload);
    } else if (this.formMode === 'add') {
      this.addAddress(payload);
    }
  }

  updateAddress(payload: any) {
    console.log('payload', payload);
    this.addressFacade.updateAddress(payload.id, payload).subscribe(success => {
      if (success) {
        this.goToStep(0); // move back to delivery list
      }
    });
    return;
  }

  addAddress(payload: any) {
    this.addressFacade.createAddress(payload).subscribe(success => {
      if (success) {
        this.goToStep(0); // move back to delivery list
      }
    });
  }

  makePayment() {
    if (!this.selectedDeliveryOption) {
      console.error('Delivery option not selected');
      // return;
    }

    const addressId = this.addressFacade.selectedAddressId(); // signal based getter
    if (!addressId) {
      console.error('No address selected');
      return;
    }

    const totalAmount = Number(this.cartFacade.cartSignal()?.totalAmount || 0); // fallback
    // const courierCompanyId = this.selectedDeliveryOption.courier_company_id;
    const countryCode = 'IND'; // optional: derive from selected address

    const payload = {
      total_amount: totalAmount,
      address_id: addressId,
      courier_company_id: '0',
      country_code: countryCode
    };

    this.paymentService.createOrder(payload).subscribe({
      next: (response) => {
        console.log('Order Created:', response);
        this.launchRazorpay(response.data)
        // TODO: Call Razorpay.init(response.data) or open Razorpay checkout here
      },
      error: () => {
        console.error('Failed to create order');
      }
    });
  }

  /** Step 2: Open Razorpay Checkout */
  private launchRazorpay(order: any): void {
    const razorpayOrder: RazorpayOrder = {
      id: order.payment_order_id,
      amount: Number(order.amount) * 100, // Razorpay expects paisa
      currency: order.currency
    };

    const userInfo = {
      name: this.authFacade.userSignal()?.full_name!,
      email: this.authFacade.userSignal()?.email!,
      contact: this.authFacade.userSignal()?.phone!
    };

    this.razorpayService.openCheckout(razorpayOrder, userInfo, (response) => {
      this.verifyPaymentCallback(order.id, response);
    });
  }

  /** Step 3: Verify payment with server */
  private verifyPaymentCallback(orderPk: string, response: any): void {
    const payload = {
      payment_id: response.razorpay_payment_id,
      payment_signature: response.razorpay_signature
    };

    this.paymentService.verifyPayment(orderPk, payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Payment verified successfully!');
        this.router.navigate(['/']);
      },
      error: () => {
        this.toastService.showError('Payment verification failed.');
      }
    });
  }
}
