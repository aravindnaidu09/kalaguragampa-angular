import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkBannerComponent } from './network-banner.component';

describe('NetworkBannerComponent', () => {
  let component: NetworkBannerComponent;
  let fixture: ComponentFixture<NetworkBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
