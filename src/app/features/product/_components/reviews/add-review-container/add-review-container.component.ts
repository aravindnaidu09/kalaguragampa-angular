// add-review-container.component.ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, filter } from 'rxjs';
import { ReviewFacade } from '../../..//_state/review.facade';
import { ReviewFormData } from '../../../_models/add-review.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { AddReviewComponent } from '../add-review/add-review.component';

@Component({
  selector: 'app-add-review-container',
  standalone: true,
  imports: [CommonModule, AddReviewComponent],
  templateUrl: './add-review-container.component.html',
  styleUrls: ['./add-review-container.component.scss']
})
export class AddReviewContainerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private facade = inject(ReviewFacade);
  private toast = inject(ToastService);

  loading$ = this.facade.loading$;
  submitted$ = this.facade.submitted$;
  error$ = this.facade.error$;
  product$ = this.facade.product$;

  private productId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(pm => pm.get('id')),
        filter(Boolean),
        takeUntilDestroyed()
      )
      .subscribe(idStr => {
        const id = Number(idStr);
        if (!Number.isFinite(id)) {
          this.toast.showError('Invalid product id.');
          return;
        }
        this.productId = id;
      });

    this.submitted$
      .pipe(filter(v => v === true), takeUntilDestroyed())
      .subscribe(() => this.toast.showSuccess('Thank you! Your review has been submitted.'));
  }

  handleSubmit = (data: ReviewFormData) => {
    if (this.productId == null) {
      this.toast.showError('Missing product id.');
      return;
    }
    this.facade.submitReview(this.productId, data);
  };

  ngOnDestroy(): void {}
}
