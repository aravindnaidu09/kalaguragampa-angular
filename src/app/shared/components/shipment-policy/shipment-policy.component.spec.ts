import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentPolicyComponent } from './shipment-policy.component';

describe('ShipmentPolicyComponent', () => {
  let component: ShipmentPolicyComponent;
  let fixture: ComponentFixture<ShipmentPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
