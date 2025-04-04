import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Address } from '../../../settings/_model/address-model';
import { DialogComponent } from "../../../../shared/components/dialog/dialog.component";
import { AddAddressDialogComponent } from "../add-address-dialog/add-address-dialog.component";
import { AddressFacade } from '../../../settings/_state/address.facade';

@Component({
  selector: 'app-shipping-billing',
  imports: [
    CommonModule,
    FormsModule,
    DialogComponent,
    AddAddressDialogComponent
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
export class ShippingBillingComponent {
  private confirmDialogService = inject(ConfirmDialogService);
  private addressFacade = inject(AddressFacade);

  addressList: Address[] = [
    {
      id: 1,
      fullName: 'Aravind',
      phone: '9032787557',
      street: 'Bindu arcade opposite building, road no - 2, laxmi nagar colony, kalapuram basti, miyapur, Miyapur',
      city: 'Hyderabad',
      state: 'TELANGANA',
      pincode: '500049',
      country: 'India',
      isDefault: true
    },
    {
      id: 2,
      fullName: 'Naidu Aravind',
      phone: '9032787557',
      street: 'Plot no: 245, 2-41/11/5/2, Prashanth nagar colony, Kondapur',
      city: 'Hyderabad',
      state: 'TELANGANA',
      pincode: '500084',
      country: 'India',
      isDefault: false
    }
  ];

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


  openAddressDialog(mode: 'edit' | 'add') {
    this.mode = mode;
    if (mode === 'edit') {
      const defaultAddr = this.addressList.find(a => a.isDefault);
      if (defaultAddr) {
        this.selectedAddress = defaultAddr;
      } else {
        console.warn('No default address found to edit');
        return;
      }
    }
    this.isAddressDialogVisible = true;
  }

  confirmDelete() {

    this.confirmDialogService.confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this address?',
      confirmText: 'Remove'
    }).subscribe(result => {
      if (result) {
        console.log('Confirmed delete');
        // TODO: Delete logic
      }
    });
  }

  get selectedAddressId(): number | undefined {
    return this.addressList.find(a => a.isDefault)?.id;
  }

  selectAddress(id: number): void {
    const index = this.addressList.findIndex(a => a.id === id);
    if (index === -1) return;

    // Set all to false first
    this.addressList.forEach(addr => (addr.isDefault = false));
    // Set selected as default
    this.addressList[index].isDefault = true;

    // Move selected to top
    const [selected] = this.addressList.splice(index, 1);
    this.addressList.unshift(selected);
  }

  setAsDefault(id: number) {
    this.selectAddress(id);
    // TODO: Persist to backend later
  }


  saveAddress(event: any) {
    if (this.mode === 'add') {
      console.log('inside-address-component');
      this.addressFacade.createAddress(event);
    } else {
      this.addressFacade.updateAddress(event.id!, event);
    }
  }

  closeDialog(event: any) {
    this.isAddressDialogVisible = !event;
  }
}
