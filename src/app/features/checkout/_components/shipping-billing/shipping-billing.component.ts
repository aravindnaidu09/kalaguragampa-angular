import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Address } from '../../../settings/_model/address-model';
import { DialogComponent } from "../../../../shared/components/dialog/dialog.component";
import { AddAddressDialogComponent } from "../add-address-dialog/add-address-dialog.component";
import { AddressFacade } from '../../../settings/_state/address.facade';
import { filter, map, Observable } from 'rxjs';

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
    this.addressFacade.loadAddresses().subscribe();
  }

  openAddressDialog(mode: 'edit' | 'add',addressItem?: Address) {
    console.log('openAddressDialog', mode, addressItem);
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
    this.addressFacade.setDefault(id).subscribe();
  }

  setAsDefault(id: number) {
    this.selectAddress(id);
  }

  emitContinue() {
    if (this.selectedAddressId != null) {
      this.continue.emit();
    }
  }
}
