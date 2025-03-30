import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedAddressCardComponent } from './selected-address-card.component';

describe('SelectedAddressCardComponent', () => {
  let component: SelectedAddressCardComponent;
  let fixture: ComponentFixture<SelectedAddressCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedAddressCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedAddressCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
