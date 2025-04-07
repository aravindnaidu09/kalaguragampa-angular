import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { Address, serializeAddress } from '../../_model/address-model';
import { AddressFacade } from '../../_state/address.facade';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { AddressFormComponent } from "../../../checkout/_components/address-form/address-form.component";

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


  addressForm!: FormGroup;
  isEditing = false;
  selectedAddressId: number | null = null;

  readonly addressesSignal = this.addressFacade.addresses;
  readonly defaultAddressId = computed(() =>
    this.addressesSignal()?.find(a => a.isDefault)?.id
  );

  accordionOpen = false;
  // isEditing = false;
  editingData: Partial<Address> = {};

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

    if (!this.accordionOpen) this.resetForm();
  }

  handleAddressSave(rawPayload: Address): void {
    const payload = serializeAddress(rawPayload);

    if (this.isEditing && payload.id) {
      this.addressFacade.updateAddress(payload.id, payload).subscribe(() => {
        this.resetForm();
      });
    } else {
      this.addressFacade.createAddress(payload).subscribe(success => {
        if (success) this.resetForm();
      });
    }
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;
    const payload = this.addressForm.value;

    if (this.isEditing && this.selectedAddressId !== null) {
      this.addressFacade.updateAddress(this.selectedAddressId, payload).subscribe(() => {
        this.resetForm();
      });
    } else {
      this.addressFacade.createAddress(payload).subscribe(success => {
        if (success) this.resetForm();
      });
    }
  }

  editAddress(address: Address): void {
    this.isEditing = true;
    this.selectedAddressId = address.id!;
    this.addressForm.patchValue(address);

    this.editingData = address;
    this.accordionOpen = true;
  }

  deleteAddress(addressId: number): void {

    this.confirmDialogService.confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this address?',
      confirmText: 'Remove'
    }).subscribe(result => {
      if (result) {
        console.log('Confirmed delete');
        this.addressFacade.deleteAddress(addressId).subscribe();
      }
    });
  }

  setDefaultAddress(addressId: number): void {
    this.addressFacade.setDefault(addressId).subscribe();
  }

  resetForm(): void {
    this.isEditing = false;
    this.selectedAddressId = null;
    this.editingData = {};
    this.accordionOpen = false;
    this.addressForm.reset({ country: 'India', isDefault: false });
  }

  openAddressForm(): void {
    this.resetForm();
    this.isEditing = false;
  }
}
