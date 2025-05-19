import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, Signal } from '@angular/core';
import { CartFacade } from '../../_state/cart.facade';
import { Router } from '@angular/router';

@Component({
  selector: 'app-price-summary',
  imports: [
    CommonModule
  ],
  templateUrl: './price-summary.component.html',
  styleUrl: './price-summary.component.scss'
})
export class PriceSummaryComponent {

  private cartFacade = inject(CartFacade);
  readonly cartSignal: Signal<any> = this.cartFacade.cartSignal;
  readonly shippingFeeSignal = inject(CartFacade).shippingFeeSignal;
  readonly courierNameSignal = inject(CartFacade).courierNameSignal;
  readonly estimatedDeliveryDaysSignal = inject(CartFacade).estimatedDeliveryDaysSignal;

  readonly finalAmountSignal = computed(() => {
    const base = this.cartSignal()?.totalAmount ?? 0;
    const shipping = this.shippingFeeSignal() ?? 0;
    return base + shipping;
  });

  private router = inject(Router);

  @Input() showPlaceOrderButton: boolean = true; // Flag to show/hide the button

  get cart() {
    return this.cartSignal();
  }

  get isShippingFree(): boolean {
    return this.cart?.shippingAmount === '0';
  }

  goToCheckoutPage(): void {
    // Optional: use this method if button is needed conditionally
    this.router.navigate(['/checkout']);
  }

  estimatedDeliveryEndRange(): number {
    const days = parseInt(this.estimatedDeliveryDaysSignal() || '0', 10);
    return days ? days + 2 : 0;
  }
}
