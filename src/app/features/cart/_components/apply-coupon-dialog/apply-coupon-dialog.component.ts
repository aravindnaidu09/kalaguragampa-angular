import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CouponFacade } from '../../_state/coupon.facade';

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
  private couponFacade = inject(CouponFacade);

  form: FormGroup;
  availableCoupons: string[] = ['KGNEW100', 'FREESHIP', 'SAVE10', 'LOYALTY20'];
  errorMessage: string | null = null;

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
    this.errorMessage = null;

    if (this.form.invalid) return;

    const enteredCode = this.codeControl.value?.trim();

    // 🔁 Local validation
    if (!this.availableCoupons.includes(enteredCode)) {
      this.errorMessage = 'Invalid coupon code. Please select a valid one.';
      return;
    }

    // Or use API call here:
    // this.couponService.validateCode(enteredCode).subscribe(...)
    if (enteredCode) {
      this.couponFacade.applyCoupon(enteredCode);
    }

    this.dialogRef.close(enteredCode);
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
