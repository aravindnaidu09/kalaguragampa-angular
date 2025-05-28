import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-apply-coupon-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './apply-coupon-dialog.component.html',
  styleUrl: './apply-coupon-dialog.component.scss'
})
export class ApplyCouponDialogComponent {
  form: FormGroup;
  availableCoupons: string[] = ['KGNEW100', 'FREESHIP', 'SAVE10', 'LOYALTY20'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApplyCouponDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required]
    });
  }

  applyCoupon() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.code);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  selectCoupon(coupon: string) {
    this.form.patchValue({ code: coupon });
  }

  get codeControl(): FormControl {
    return this.form.get('code') as FormControl;
  }

}
