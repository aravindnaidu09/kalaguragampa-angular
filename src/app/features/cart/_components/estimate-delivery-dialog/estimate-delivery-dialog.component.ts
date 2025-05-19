import { Component, computed, inject } from '@angular/core';
import { Validators, FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AddressService } from '../../../settings/_services/address.service';
import { CommonModule } from '@angular/common';
import { Address } from '../../../settings/_model/address-model';
import { AddressFacade } from '../../../settings/_state/address.facade';

@Component({
  selector: 'app-estimate-delivery-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './estimate-delivery-dialog.component.html',
  styleUrl: './estimate-delivery-dialog.component.scss'
})
export class EstimateDeliveryDialogComponent {
  private addressFacade = inject(AddressFacade);

  form!: FormGroup;

  countries = ['India', 'USA', 'UK', 'Australia', 'Canada', 'Singapore', 'Europe'];
  // addresses: Address[] = [];
  tabIndex: number = 0;
  // selectedAddressId: number | null = null;

  readonly addresses = this.addressFacade.addresses;
  readonly selectedAddressId = computed(() =>
    this.addresses().find(a => a.isDefault)?.id?.toString() ?? null
  );

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EstimateDeliveryDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      pincode: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required]
    });

    console.log('addresses', this.addresses());
  }

  onEstimate() {
    if (this.tabIndex === 0 && this.selectedAddressId) {
      this.dialogRef.close({ address_id: this.selectedAddressId });
    } else if (this.tabIndex === 1 && this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }


  onCancel() {
    this.dialogRef.close();
  }
}
