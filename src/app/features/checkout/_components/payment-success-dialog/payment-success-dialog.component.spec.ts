import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessDialogComponent } from './payment-success-dialog.component';

describe('PaymentSuccessDialogComponent', () => {
  let component: PaymentSuccessDialogComponent;
  let fixture: ComponentFixture<PaymentSuccessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccessDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
