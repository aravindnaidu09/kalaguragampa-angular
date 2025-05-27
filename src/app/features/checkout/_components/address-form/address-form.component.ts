import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address, serializeAddress } from '../../../settings/_model/address-model';

@Component({
  selector: 'app-address-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit {
  @Input() formMode: 'add' | 'edit' = 'add';
  @Input() initialData: Partial<Address> = {};
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<boolean>(false);

  addressForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    const data = this.initialData ?? {};
    this.addressForm = this.fb.group({
      fullName: [data.fullName || '', Validators.required],
      street: [data.street || '', Validators.required],
      street2: [data.street2 || ''],
      pincode: [data.pincode || '', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      city: [data.city || '', Validators.required],
      state: [data.state || '', Validators.required],
      country: [data.country || '', Validators.required],
      phone: [data.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      isDefault: [data.isDefault || false]
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const address = this.addressForm.value;
    address.id = this.initialData.id ?? null; // Assign ID if editing
    // const apiPayload = serializeAddress(address);

    setTimeout(() => {
      this.save.emit(address);
      this.isSubmitting = false;

      if (this.formMode === 'add') {
        this.resetForm();
      }
    }, 800);
  }

  resetForm(): void {
    this.addressForm.reset({
      fullName: '',
      street: '',
      street2: '',
      pincode: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      isDefault: false
    });

  }

  onCancel(): void {
    this.cancel.emit(true);
  }

  get f() {
    return this.addressForm.controls;
  }
}
