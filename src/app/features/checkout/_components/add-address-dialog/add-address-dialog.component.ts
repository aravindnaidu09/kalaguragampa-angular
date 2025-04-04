import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address, serializeAddress } from '../../../settings/_model/address-model';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-add-address-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-address-dialog.component.html',
  styleUrl: './add-address-dialog.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(16px)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class AddAddressDialogComponent {
  @Input() formMode: 'add' | 'edit' = 'add';
  @Input() initialData: Partial<Address> = {};
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<boolean>(false);

  addressForm!: FormGroup;
  isSubmitting = false;

  @ViewChild('nameInput') nameInputRef!: ElementRef;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      fullName: [this.initialData.fullName || '', Validators.required],
      street: [this.initialData.street || '', Validators.required],
      street2: [this.initialData.street2 || ''],
      pincode: [this.initialData.pincode || '', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      city: [this.initialData.city || '', Validators.required],
      state: [this.initialData.state || '', Validators.required],
      country: [this.initialData.country || '', Validators.required],
      phone: [this.initialData.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      isDefault: [this.initialData.isDefault || false]
    });
  }

  ngAfterViewInit(): void {
    // Auto-focus the first field after view init
    // setTimeout(() => this.nameInputRef?.nativeElement?.focus(), 0);
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const address = this.addressForm.value;
    const apiPayload = serializeAddress(address);

    setTimeout(() => {
      this.save.emit(apiPayload);
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
