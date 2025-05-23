import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortFilterBarComponent } from './sort-filter-bar.component';

describe('SortFilterBarComponent', () => {
  let component: SortFilterBarComponent;
  let fixture: ComponentFixture<SortFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
