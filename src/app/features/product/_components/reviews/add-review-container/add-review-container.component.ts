import { Component, inject } from '@angular/core';
import { AddReviewComponent } from "../add-review/add-review.component";
import { ActivatedRoute } from '@angular/router';
import { ReviewFacade } from '../../../_state/review.facade';
import { ReviewFormData } from '../../../_models/add-review.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-review-container',
  imports: [
    CommonModule,
    AddReviewComponent
  ],
  templateUrl: './add-review-container.component.html',
  styleUrl: './add-review-container.component.scss'
})
export class AddReviewContainerComponent {
  private route = inject(ActivatedRoute);
  public facade = inject(ReviewFacade);

  ngOnInit() {
    const productId = this.route.snapshot.params['id'];
    if (productId) {
      this.facade.loadProductById(productId);
    }
  }

  handleSubmit(id: number, data: ReviewFormData) {
    this.facade.submitReview(id, data);
  }
}
