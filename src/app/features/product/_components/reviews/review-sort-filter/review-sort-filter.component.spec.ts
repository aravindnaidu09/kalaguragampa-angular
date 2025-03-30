import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSortFilterComponent } from './review-sort-filter.component';

describe('ReviewSortFilterComponent', () => {
  let component: ReviewSortFilterComponent;
  let fixture: ComponentFixture<ReviewSortFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewSortFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewSortFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
