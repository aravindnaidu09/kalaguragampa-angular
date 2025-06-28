import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { Address, serializeAddress } from '../../_model/address-model';
import { AddressFacade } from '../../_state/address.facade';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { AddressFormComponent } from "../../../checkout/_components/address-form/address-form.component";
import { AddressService } from '../../_services/address.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-address-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AddressFormComponent],
  templateUrl: './address-management.component.html',
  styleUrl: './address-management.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AddressManagementComponent {
  private fb = inject(FormBuilder);
  private addressFacade = inject(AddressFacade);
  private confirmDialogService = inject(ConfirmDialogService);
  private addressService = inject(AddressService);
  private toastService = inject(ToastService);

  addressForm!: FormGroup;
  isEditing = false;
  selectedAddressId: number | null = null;

  readonly addressesSignal = this.addressFacade.addresses;

  accordionOpen = false;
  // isEditing = false;
  editingData: Partial<Address | null> = {};

  loadingAddresses = this.addressFacade.loading;

  ngOnInit(): void {
    this.initializeForm();
    this.addressFacade.loadAddresses();
  }

  private initializeForm(): void {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      street: ['', Validators.required],
      street2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      country: ['India', Validators.required],
      isDefault: [false]
    });
  }

  toggleAccordion(): void {
    this.accordionOpen = !this.accordionOpen;

    if (!this.accordionOpen) this.resetForm(false);
  }

  handleAddressSave(rawPayload: Address): void {
    const payload = serializeAddress(rawPayload);


    if (this.isEditing && payload.id) {
      this.addressFacade.updateAddress(payload.id, payload).subscribe(success => {
        if (success) {
          this.toastService.showSuccess('Address updated successfully.');
          this.resetForm(true);
        }
      });
    } else {
      this.addressFacade.createAddress(payload).subscribe({
        next: (success) => {
          if (success) {
            this.toastService.showSuccess('Address added successfully.');
            this.resetForm(true);
          }
        },
        error: (error) => {
          console.error('Add Address Failed:', error);
          this.toastService.showError(error || 'Failed to add address. Please try again.');
        }
      });
    }
  }


  editAddress(address: Address): void {
    this.editingData = {};

    setTimeout(() => {
      console.log('checking-edit-address: ', address);
      this.isEditing = true;
      this.selectedAddressId = address.id!;
      this.addressForm.patchValue(this.mapAddressToForm(address));
      this.editingData = address;
      this.accordionOpen = true;
    }, 300);

  }

  private mapAddressToForm(address: Address): any {
    return {
      name: address.fullName,
      addressLine1: address.street,
      addressLine2: address.street2,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      mobile: address.phone
    };
  }

  deleteAddress(addressId: number): void {
    this.confirmDialogService.confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this address?',
      confirmText: 'Remove'
    }).subscribe(result => {
      if (result) {
        this.addressFacade.deleteAddress(addressId).subscribe(() => {
          this.toastService.showSuccess('Address removed successfully.');
        });
      }
    });
  }

  setDefaultAddress(addressId: number, address: Address): void {
    const rawPayload = { ...address, isDefault: true };
    const payload = serializeAddress(rawPayload);
    this.addressFacade.updateAddress(addressId, payload).subscribe(success => {
      if (success) {
        this.toastService.showSuccess('Address updated successfully.');
      }
    });
  }

  resetForm(isCancel: boolean): void {
    this.accordionOpen = false;
    this.isEditing = false;
    this.selectedAddressId = null;
    this.editingData = null;
    this.addressForm.reset({ country: 'India', isDefault: false });
    if (!isCancel) {
      this.addressFacade.loadAddresses();
    }
  }
}
