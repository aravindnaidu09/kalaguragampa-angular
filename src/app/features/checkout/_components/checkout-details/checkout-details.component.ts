import { Component } from '@angular/core';
import { ShippingBillingComponent } from "../shipping-billing/shipping-billing.component";
import { OrderSummaryComponent } from "../order-summary/order-summary.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentComponent } from "../payment/payment.component";
import { ShipmentPolicyComponent } from "../../../../shared/components/shipment-policy/shipment-policy.component";
import { StepperComponent } from "../stepper/stepper.component";

@Component({
  selector: 'app-checkout-details',
  imports: [
    CommonModule,
    FormsModule,
    OrderSummaryComponent,
    PaymentComponent,
    // ShipmentPolicyComponent,
    ShippingBillingComponent,
    StepperComponent
],
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.scss'
})
export class CheckoutDetailsComponent {
  steps = ['Address Details', 'Order Summary', 'Payment Options']; // Steps
  currentStep = 0; // Tracks the current step

  goToNextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
