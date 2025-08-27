import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Inject, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CouponFacade } from '../../_state/coupon.facade';
import { Coupon } from '../../_models/coupon.model';

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
  @Input() addressId?: number | null;
  @Input() countryCode: string = 'IND';

  private facade = inject(CouponFacade);
  private destroyRef = inject(DestroyRef);

  code = new FormControl('', [Validators.required, Validators.minLength(3)]);
  available$ = this.facade.available$;
  loading$ = this.facade.loading$;
  applying$ = this.facade.applying$;
  error$ = this.facade.error$;

  constructor(
    private ref: MatDialogRef<ApplyCouponDialogComponent, string | null>
  ) { }

  ngOnInit(): void {
    this.facade.loadAvailable(this.addressId ?? null, this.countryCode);
  }

  pick(c: Coupon) {
    this.code.setValue(c.code);
  }

  apply() {
    if (this.code.invalid) { this.code.markAsTouched(); return; }
    this.facade.applyCoupon(this.code.value!, this.countryCode);

    this.ref.close(this.code.value!.trim());
    // let the caller close dialog on success (or close here once applied$ emits)
  }

  close(): void {
    // this.ref.close(null);
    this.ref.close(null);
  }

  trackById = (_: number, c: Coupon) => c.id;

}
