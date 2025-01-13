import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-billing',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './shipping-billing.component.html',
  styleUrl: './shipping-billing.component.scss'
})
export class ShippingBillingComponent {
  shippingForm = {
    fullName: '',
    email: '',
    confirmationEmail: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: ''
  };

  countries = ['USA', 'Canada', 'India', 'UK'];
}
