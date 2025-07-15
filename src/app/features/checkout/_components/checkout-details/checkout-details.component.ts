import { Component, HostListener, inject, OnInit } from '@angular/core';
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
import { OrderSuccessDialogComponent } from '../../../../shared/components/order-success-dialog/order-success-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

  isProcessingPayment = false;

  constructor(private dialog: MatDialog) {}
isScreenBetween996And400: boolean = false;

  ngOnInit(): void {
    this.checkScreenWidth();
    // this.fetchDeliveryOptions();
  }
@HostListener('window:resize', [])
  onResize() {
    this.checkScreenWidth();
  }

  private checkScreenWidth() {
    const width = window.innerWidth;
    console.log('Window width:', width);
    
    this.isScreenBetween996And400 = width <= 1024 && width >= 350;
  }

  // fetchDeliveryOptions(): void {
  //   this.deliveryService.getDeliveryOptions().subscribe({
  //     next: (options) => this.deliveryOptions = options,
  //     error: () => console.error('Failed to fetch delivery options')
  //   });
  // }

  selectDeliveryOption(option: DeliveryOption) {
    this.selectedDeliveryOption = option;
  }

  setStep(step: number): void {
    this.currentStep = step;
  }

  goToNextStep(): void {
    if (this.currentStep === 0) {
      this.currentStep = 2; // Skip Step 1 (address add/edit), go to Order Summary
    } else {
      this.currentStep++;
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 0; // Go back to address list
    } else {
      this.currentStep--;
    }
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
    // if (!this.selectedDeliveryOption) {
    //   this.toastService.showWarning('Please select a delivery option');
    //   return;
    // }

    const addressId = this.addressFacade.selectedAddressId();
    if (!addressId) {
      this.toastService.showWarning('Please select a delivery address');
      return;
    }

    this.isProcessingPayment = true; // 🔁 Start loader

    const totalAmount = Number(this.cartFacade.cartSignal()?.totalAmount || 0);
    const countryCode = 'IND';

    const shippingFee = this.cartFacade.shippingFeeSignal() || 0;

    const payload = {
      total_amount: totalAmount,
      address_id: addressId,
      courier_company_id: '0',
      country_code: countryCode
    };

    this.paymentService.createOrder(payload).subscribe({
      next: (response) => {
        this.launchRazorpay(response.data);
        this.isProcessingPayment = false; // ✅ Stop loader once Razorpay is shown
      },
      error: () => {
        this.toastService.showError('Failed to create order');
        this.isProcessingPayment = false;
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
      contact: this.authFacade.userSignal()?.mobile!
    };

    this.razorpayService.openCheckout(razorpayOrder, userInfo, (response) => {
      this.verifyPaymentCallback(order.id, response);
    });
  }

  /** Step 3: Verify payment with server */
  private verifyPaymentCallback(orderPk: string, response: any): void {
    this.isProcessingPayment = true; // 🔁 Start loader
    const payload = {
      payment_id: response.razorpay_payment_id,
      payment_signature: response.razorpay_signature
    };

    this.paymentService.verifyPayment(orderPk, payload).subscribe({
      next: () => {
        const orderId = orderPk;
        const orderDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        this.isProcessingPayment = false; // ✅ Stop loader

        const dialogRef = this.dialog.open(OrderSuccessDialogComponent, {
          data: {
            orderId,
            date: orderDate
          },
          disableClose: true,
          width: '500px'
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'orders') {
            this.router.navigate(['/settings/orders']);
          } else {
            this.router.navigate(['/']);
          }
        });
        // this.toastService.showSuccess('Payment verified successfully!');
        // this.router.navigate(['/']);
      },
      error: () => {
        this.toastService.showError('Payment verification failed.');
        this.isProcessingPayment = false; // ✅ Stop loader
      }
    });
  }
}
