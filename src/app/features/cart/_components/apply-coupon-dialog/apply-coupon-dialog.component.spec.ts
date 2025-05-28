import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyCouponDialogComponent } from './apply-coupon-dialog.component';

describe('ApplyCouponDialogComponent', () => {
  let component: ApplyCouponDialogComponent;
  let fixture: ComponentFixture<ApplyCouponDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyCouponDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyCouponDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
