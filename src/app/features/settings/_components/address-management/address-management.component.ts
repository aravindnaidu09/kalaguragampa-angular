import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { Address } from '../../_model/address-model';
import { AddressService } from '../../_services/address.service';

@Component({
  selector: 'app-address-management',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './address-management.component.html',
  styleUrl: './address-management.component.scss'
})
export class AddressManagementComponent {
  private addressService = inject(AddressService);
  private fb = inject(FormBuilder);

  addresses: Address[] = [];
  addressForm!: FormGroup;
  isEditing: boolean = false;
  selectedAddressId: number | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.fetchAddresses();
  }

  // ✅ Initialize Address Form
  private initializeForm(): void {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      country: ['', Validators.required]
    });
  }

  // ✅ Fetch Addresses from Backend
  private fetchAddresses(): void {
    this.addressService.getUserAddresses().subscribe({
      next: (data) => (this.addresses = data),
      // error: () => this.toastService.showError('Failed to load addresses')
    });
  }

  // ✅ Save New Address
  saveAddress(): void {
    if (this.addressForm.invalid) {
      // this.toastService.showError('Please fill all required fields');
      return;
    }

    const addressData = this.addressForm.value;

    if (this.isEditing && this.selectedAddressId !== null) {
      // Update Address
      this.addressService.updateAddress(this.selectedAddressId, addressData).subscribe({
        next: () => {
          // this.toastService.showSuccess('Address updated successfully');
          this.fetchAddresses();
          this.resetForm();
        },
        // error: () => this.toastService.showError('Failed to update address')
      });
    } else {
      // Add New Address
      this.addressService.addAddress(addressData).subscribe({
        next: () => {
          // this.toastService.showSuccess('Address added successfully');
          this.fetchAddresses();
          this.resetForm();
        },
        // error: () => this.toastService.showError('Failed to add address')
      });
    }
  }

  // ✅ Edit an Existing Address
  editAddress(address: Address): void {
    this.isEditing = true;
    this.selectedAddressId = address?.id!;
    this.addressForm.patchValue(address);
  }

  // ✅ Delete an Address
  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          // this.toastService.showSuccess('Address deleted');
          this.fetchAddresses();
        },
        // error: () => this.toastService.showError('Failed to delete address')
      });
    }
  }

  // ✅ Set Default Address
  setDefaultAddress(addressId: number): void {
    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        // this.toastService.showSuccess('Default address updated');
        this.fetchAddresses();
      },
      // error: () => this.toastService.showError('Failed to update default address')
    });
  }

  // ✅ Reset Form After Submit
  resetForm(): void {
    this.isEditing = false;
    this.selectedAddressId = null;
    this.addressForm.reset();
  }
}
