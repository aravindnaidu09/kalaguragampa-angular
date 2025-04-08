import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReviewContainerComponent } from './add-review-container.component';

describe('AddReviewContainerComponent', () => {
  let component: AddReviewContainerComponent;
  let fixture: ComponentFixture<AddReviewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReviewContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReviewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
