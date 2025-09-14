import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
import { MatDialog, MatDialogState } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

import { ShippingBillingComponent } from "../shipping-billing/shipping-billing.component";
import { CartDetailsComponent } from "../../../cart/_components/cart-details/cart-details.component";
import { PriceSummaryComponent } from "../../../cart/_components/price-summary/price-summary.component";
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
import { ProfileFacade } from '../../../settings/_state/profile.facade';
import { CheckoutFlowService } from '../../../../core/services/checkout-flow.service';
import { OrderSuccessDialogComponent } from '../../../../shared/components/order-success-dialog/order-success-dialog.component';
import { ConfirmExit } from '../../../../core/guards/confirm-exit.guard';
import { SessionExpiredComponent } from '../session-expired/session-expired.component';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-checkout-details',
  standalone: true,
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
export class CheckoutDetailsComponent implements OnInit, OnDestroy {
  private addressFacade = inject(AddressFacade);
  private deliveryService = inject(DeliveryService);
  private paymentService = inject(PaymentService);
  private cartFacade = inject(CartFacade);
  private razorpayService = inject(RazorpayService);
  private toastService = inject(ToastService);
  private authFacade = inject(ProfileFacade);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private dialogService = inject(ConfirmDialogService);

  currentStep = 0;
  formMode: 'add' | 'edit' = 'add';
  selectedAddressForEdit: Address = {};
  deliveryOptions: DeliveryOption[] = [];
  selectedDeliveryOption?: DeliveryOption;
  isProcessingPayment = false;
  isScreenBetween996And400 = false;

  countdownMinutes = 10;
  remainingTime = signal(this.countdownMinutes * 60);
  private timerInterval: any;

  ngOnInit(): void {
    const cart = this.cartFacade.cartSignal();
    const isCartEmptyOrInvalid = !cart || !cart.totalAmount || cart.items?.length === 0;

    if (isCartEmptyOrInvalid) {
      this.toastService.showWarning('Your cart is empty or expired. Redirecting to cart page...');
      this.router.navigate(['/cart']);
      return;
    }
    this.checkScreenWidth();
    this.startCheckoutTimer();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenWidth();
  }

  private checkScreenWidth() {
    const width = window.innerWidth;
    this.isScreenBetween996And400 = width <= 1024 && width >= 350;
  }

  goToNextStep(): void {
    this.currentStep = this.currentStep === 0 ? 2 : this.currentStep + 1;
  }

  goToPreviousStep(): void {
    this.currentStep = this.currentStep === 2 ? 0 : this.currentStep - 1;
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  goToAddAddressStep(event: any): void {
    this.formMode = event.mode;
    if (this.formMode === 'edit') {
      this.selectedAddressForEdit = event.selectedAddress;
    }
    this.currentStep = 1;
  }

  handleAddressSave(rawPayload: any) {
    const payload = serializeAddress(rawPayload);
    this.formMode === 'edit' ? this.updateAddress(payload) : this.addAddress(payload);
  }

  updateAddress(payload: any) {
    this.addressFacade.updateAddress(payload.id, payload).subscribe(success => {
      if (success) this.goToStep(0);
    });
  }

  addAddress(payload: any) {
    this.addressFacade.createAddress(payload).subscribe(success => {
      if (success) this.goToStep(0);
    });
  }

  selectDeliveryOption(option: DeliveryOption) {
    this.selectedDeliveryOption = option;
  }

  makePayment() {
    const addressId = this.addressFacade.selectedAddressId();
    if (!addressId) {
      this.toastService.showWarning('Please select a delivery address');
      return;
    }

    this.isProcessingPayment = true;

    const payload = {
      total_amount: Number(this.cartFacade.cartSignal()?.totalAmount || 0),
      address_id: addressId,
      courier_company_id: '0',
      country_code: 'IND'
    };

    this.paymentService.createOrder(payload).subscribe({
      next: (response) => {
        this.launchRazorpay(response.data);
        this.isProcessingPayment = false;
      },
      error: (err) => {
        this.toastService.showError(err);
        this.isProcessingPayment = false;
      }
    });
  }

  private launchRazorpay(order: any): void {
    const razorpayOrder: RazorpayOrder = {
      id: order.payment_order_id,
      amount: Number(order.amount) * 100,
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

  private verifyPaymentCallback(orderPk: string, response: any): void {
    this.isProcessingPayment = true;

    const payload = {
      payment_id: response.razorpay_payment_id,
      payment_signature: response.razorpay_signature
    };

    this.paymentService.verifyPayment(orderPk, payload).subscribe({
      next: () => {
        const orderId = orderPk;
        const orderDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        this.isProcessingPayment = false;

        const dialogRef = this.dialog.open(OrderSuccessDialogComponent, {
          data: { orderId, date: orderDate },
          disableClose: true,
          width: '500px'
        });

        dialogRef.afterClosed().subscribe((result) => {
          this.router.navigate([result === 'orders' ? '/settings/orders' : '/']);
        });
      },
      error: () => {
        this.toastService.showError('Payment verification failed.');
        this.isProcessingPayment = false;
      }
    });
  }

  startCheckoutTimer(): void {
    this.timerInterval = setInterval(() => {
      this.remainingTime.update(v => v - 1);

      if (this.remainingTime() <= 0) {
        clearInterval(this.timerInterval);

        // 💥 This return kills all logic
        if (localStorage.getItem('checkoutSessionExpiredShown') === 'true') return;

        localStorage.setItem('checkoutSessionExpiredShown', 'true');

        this.dialogService.confirm({
          title: 'Session Expired',
          message: 'Your checkout session has expired. Would you like to go back to home or retry checkout?',
          confirmText: 'Go To Cart',
          cancelText: 'Retry'
        }).subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.router.navigate(['/cart']);
          } else {
            // 💡 Reset logic on retry
            this.remainingTime.set(this.countdownMinutes * 60);
            localStorage.removeItem('checkoutSessionExpiredShown');
            this.startCheckoutTimer();
          }
        });
      }

    }, 1000);
  }

  formatRemainingTime(): string {
    const minutes = Math.floor(this.remainingTime() / 60);
    const seconds = this.remainingTime() % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
