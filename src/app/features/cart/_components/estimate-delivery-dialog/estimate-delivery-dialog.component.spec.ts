import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateDeliveryDialogComponent } from './estimate-delivery-dialog.component';

describe('EstimateDeliveryDialogComponent', () => {
  let component: EstimateDeliveryDialogComponent;
  let fixture: ComponentFixture<EstimateDeliveryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimateDeliveryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimateDeliveryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
