import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Address, serializeAddress } from '../../../settings/_model/address-model';
import { DialogComponent } from "../../../../shared/components/dialog/dialog.component";
import { AddAddressDialogComponent } from "../add-address-dialog/add-address-dialog.component";
import { AddressFacade } from '../../../settings/_state/address.facade';
import { filter, map, Observable } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';
import { CartFacade } from '../../../cart/_state/cart.facade';

@Component({
  selector: 'app-shipping-billing',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './shipping-billing.component.html',
  styleUrl: './shipping-billing.component.scss',
  animations: [
    trigger('moveToTop', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ShippingBillingComponent implements OnInit {
  private confirmDialogService = inject(ConfirmDialogService);
  private addressFacade = inject(AddressFacade);
  private toastService = inject(ToastService);
  private cartFacade = inject(CartFacade);

  @Input() hideRemoveOption: boolean = false;
  @Output() addNewAddressClicked = new EventEmitter<any>();

  addresses = this.addressFacade.addresses;
  loading = this.addressFacade.loading;
  selectedAddressId = this.addressFacade.selectedAddressId;

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
  isAddressDialogVisible: boolean = false;
  mode: 'edit' | 'add' = 'add';
  selectedAddress: Address = {};

  @Input() showContinueButton = false;

  @Output() continue = new EventEmitter<void>();

  ngOnInit() {
    this.addressFacade.loadAddresses().subscribe(() => {
      const defaultAddr = this.addressFacade.addresses().find(a => a.isDefault);
      if (defaultAddr?.id) {
        this.onEstimateShipping(defaultAddr.id);
      }
    });
  }

  openAddressDialog(mode: 'edit' | 'add', addressItem?: Address) {
    const emitPayload = { mode: mode, isClicked: true, selectedAddress: addressItem };
    this.addNewAddressClicked.emit(emitPayload);
    return;
  }

  confirmDelete(id: number): void {
    this.confirmDialogService.confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this address?',
      confirmText: 'Remove'
    }).subscribe(result => {
      if (result) {
        console.log('Confirmed delete');
        this.addressFacade.deleteAddress(id).subscribe();
        // TODO: Delete logic
      }
    });
  }

  selectAddress(id: number): void {
    const userSelectedAddress = this.addresses().find(address => address.id === id)!;
    userSelectedAddress.isDefault = true;
    const apiPayload = serializeAddress(userSelectedAddress);

    this.addressFacade.updateAddress(id, apiPayload).subscribe();
    this.onEstimateShipping(id)
  }

  setAsDefault(id: number) {
    this.selectAddress(id);
  }

  emitContinue() {
    const addressList = this.addresses();
    const selectedId = this.selectedAddressId();

    if (!addressList || addressList.length === 0) {
      this.toastService.showError('Please add a delivery address before continuing.');
      return;
    }

    if (!selectedId) {
      this.toastService.showError('Please select a delivery address before continuing.');
      return;
    }
    if (this.selectedAddressId != null) {
      this.continue.emit();
    }
  }

  onEstimateShipping(addressId: string | number): void {
    if (!addressId) {
      this.toastService.showError('Please select an address');
      return;
    }

    this.cartFacade.loadShippingEstimate({ address_id: addressId.toString() });
  }

  // private getShippingEstimatePayload():
  //   | { address_id: string }
  //   | { pincode: string; city: string; state: string; country: string }
  //   | null {

  //   if (this.defaultAddress.id) {
  //     return { address_id: this.defaultAddress.id.toString() };
  //   }

  //   if (this.pincode && this.city && this.state && this.country) {
  //     return {
  //       pincode: this.pincode,
  //       city: this.city,
  //       state: this.state,
  //       country: this.country
  //     };
  //   }

  //   return null;
  // }
}
