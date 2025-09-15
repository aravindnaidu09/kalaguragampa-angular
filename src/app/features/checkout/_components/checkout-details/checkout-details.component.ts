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
import { CurrencyService } from '../../../../core/services/currency.service';
import { AddressLike, buildCreateOrderPayload, countryToCurrency, deriveShippingContext, enhanceRazorpayDisplay } from '../../../../core/utils/geo-currency.helper';
import { CouponFacade } from '../../../cart/_state/coupon.facade';

// ✅ Use your helpers (path mirrors your existing import style)

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
  private currencyService = inject(CurrencyService);
  private couponFacade = inject(CouponFacade);

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

  /* =========================
     PAYMENT FLOW (uses helpers)
     ========================= */

  makePayment() {
    if (this.isProcessingPayment) return;

    const addressId = this.addressFacade.selectedAddressId();
    if (!addressId) {
      this.toastService.showWarning('Please select a delivery address');
      return;
    }

    this.isProcessingPayment = true;

    // cart total in INR (major units as per your app rule)
    const cartTotalInInr = Number(this.cartFacade.cartSignal()?.totalAmount || 0);
    // shopper’s UI currency (AUD/USD/…/INR)
    const uiCurrency = this.currencyService.getCurrency()().toUpperCase();

    // Addresses source (signal) — optional chain to avoid breaking if facade differs
    const addressesRaw: Address[] | undefined = this.addressFacade.addresses();
    const addressesLike: AddressLike[] | undefined = addressesRaw?.map(a => this.toAddressLike(a));

    const selectedAddressIdStr = String(addressId);

    // ✅ Use your helper to derive authoritative shipping context
    const { addressCountry, currencyCountry, mismatch } =
      deriveShippingContext(addressesLike, selectedAddressIdStr, uiCurrency);

    const proceed = () => {
      // ✅ Build BE payload via helper (country from address, charge INR)
      const payload = buildCreateOrderPayload(
        cartTotalInInr,
        selectedAddressIdStr,
        addressCountry
      );

      const couponCode = this.couponFacade.getAppliedCode();
      const apiPayload: {
        total_amount: number;
        country_code: string;
        address_id: number;
        courier_company_id: string;
        coupon_code?: string | null;
      } = {
        total_amount: payload.total_amount,
        country_code: payload.country_code,
        address_id: Number(payload.address_id),        // 👈 fix the type here
        courier_company_id: payload.courier_company_id,
        ...(couponCode ? { coupon_code: couponCode } : {})
      };

      this.paymentService.createOrder(apiPayload).subscribe({
        next: (response) => {
          // pass cart total + selected UI currency so we can compute display fields
          this.launchRazorpay(response.data, cartTotalInInr, uiCurrency);
          this.isProcessingPayment = false;
        },
        error: (err) => {
          this.toastService.showError(err);
          this.isProcessingPayment = false;
        }
      });
    };

    // Guard mismatch with a professional prompt
    if (mismatch) {
      const addressCurrency = countryToCurrency(addressCountry);
      this.dialogService.confirm({
        title: 'Currency & address don’t match',
        message: `Your shipping address is in ${addressCountry}, but prices are shown in ${uiCurrency}.
For accurate totals, switch to ${addressCurrency} or change your shipping address.`,
        confirmText: `Use ${addressCurrency}`,
        cancelText: 'Change address'
      }).subscribe((confirmed: boolean) => {
        if (confirmed) {
          // Auto-heal: align UI currency with address country and continue
          this.currencyService.setCurrency(addressCurrency);
          proceed();
        } else {
          // Let user change address; keep state consistent
          this.isProcessingPayment = false;
          this.goToStep(0);
        }
      });
      return; // wait for user choice
    }

    // No mismatch
    proceed();
  }

  // note: kept same signature; just enhanced using your helper
  private launchRazorpay(order: any, cartTotalInInr: number, uiCurrency: string): void {
    let razorpayOrder: RazorpayOrder = {
      id: order.payment_order_id,
      // ⚠️ If backend already returns subunits, remove "* 100"
      amount: Number(order.amount) * 100,
      currency: order.currency // 'INR'
    };

    // ✅ Add display currency using your helper (visual only)
    razorpayOrder = enhanceRazorpayDisplay(
      razorpayOrder as any,
      cartTotalInInr,
      uiCurrency,
      (inr, to) => this.currencyService.convertInr(inr, to)
    ) as any;

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

  private toAddressLike(a: Address): AddressLike {
    return {
      id: a.id != null ? String(a.id) : undefined,   // number -> string
      country_code: a.country ?? null,               // country -> country_code
      is_default: !!a.isDefault                      // isDefault -> is_default
    };
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
