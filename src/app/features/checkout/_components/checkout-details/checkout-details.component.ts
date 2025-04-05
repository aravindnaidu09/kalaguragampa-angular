import { Component } from '@angular/core';
import { ShippingBillingComponent } from "../shipping-billing/shipping-billing.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartDetailsComponent } from "../../../cart/_components/cart-details/cart-details.component";
import { PriceSummaryComponent } from "../../../cart/_components/price-summary/price-summary.component";
import { AddAddressDialogComponent } from '../add-address-dialog/add-address-dialog.component';
import { AddressFormComponent } from "../address-form/address-form.component";

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
export class CheckoutDetailsComponent {
  currentStep = 0;
  formMode: 'add' | 'edit' = 'add';

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
    this.currentStep = 1;
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }
}
