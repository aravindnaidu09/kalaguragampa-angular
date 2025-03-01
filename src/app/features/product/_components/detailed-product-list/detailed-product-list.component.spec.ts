import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedProductListComponent } from './detailed-product-list.component';

describe('DetailedProductListComponent', () => {
  let component: DetailedProductListComponent;
  let fixture: ComponentFixture<DetailedProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailedProductListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailedProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
