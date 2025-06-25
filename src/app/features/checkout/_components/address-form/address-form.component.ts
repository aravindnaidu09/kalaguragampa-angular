import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, SimpleChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address, serializeAddress } from '../../../settings/_model/address-model';
import { GooglePlacesDirective } from '../../../../shared/directives/google-places.directive';

@Component({
  selector: 'app-address-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GooglePlacesDirective
  ],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit, OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      const data = changes['initialData'].currentValue;

      this.addressForm?.patchValue({
        fullName: data.fullName || '',
        street: data.street || '',
        street2: data.street2 || '',
        pincode: data.pincode || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        phone: data.phone || '',
        isDefault: data.isDefault || false
      });
    }
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

    this.save.emit(address);
    this.isSubmitting = false;

    if (this.formMode === 'add') {
      this.resetForm();
    }
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

  onPlaceSelected(place: google.maps.places.PlaceResult): void {
    if (!place.geometry || !place.address_components) return;

    const streetNumber = this.getComponent(place, 'street_number');
    const route = this.getComponent(place, 'route');
    const locality = this.getComponent(place, 'locality') || this.getComponent(place, 'sublocality_level_1');
    const administrativeArea = this.getComponent(place, 'administrative_area_level_1');
    const postalCode = this.getComponent(place, 'postal_code');
    const country = this.getComponent(place, 'country');

    const street = [streetNumber, route].filter(Boolean).join(' ').trim();

    this.addressForm.patchValue({
      street: street,               // Address Line 1: no pincode here
      street2: '',                  // optional second line
      pincode: postalCode,          // Properly extracted pincode
      city: locality,
      state: administrativeArea,
      country: country
    });

  }


  private getComponent(place: google.maps.places.PlaceResult, type: string): string {
    const comp = place.address_components?.find(c => c.types.includes(type));
    return comp?.long_name || '';
  }

}
