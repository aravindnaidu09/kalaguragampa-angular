import { Component, inject } from '@angular/core';
import { ShippingBillingComponent } from "../shipping-billing/shipping-billing.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartDetailsComponent } from "../../../cart/_components/cart-details/cart-details.component";
import { PriceSummaryComponent } from "../../../cart/_components/price-summary/price-summary.component";
import { AddAddressDialogComponent } from '../add-address-dialog/add-address-dialog.component';
import { AddressFormComponent } from "../address-form/address-form.component";
import { AddressFacade } from '../../../settings/_state/address.facade';
import { Address, serializeAddress } from '../../../settings/_model/address-model';

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
  private addressFacade = inject(AddressFacade);

  currentStep = 0;
  formMode: 'add' | 'edit' = 'add';

  selectedAddressForEdit: Address = {};

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

  makePayment() {}
}
