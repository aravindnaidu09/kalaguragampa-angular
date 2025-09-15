import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ReviewFormData, ReviewProductInfo } from '../../../_models/add-review.model';
import { environment } from '../../../../../../environments/environment.dev';

type ReviewForm = {
  rating: FormControl<number>;
  description: FormControl<string>;
  title: FormControl<string>;
};

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRatingComponent],
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.scss'],
})
export class AddReviewComponent implements OnChanges {
  @Input() loading = false;
  @Input() submitted = false;
  @Input() error: string | null = null;
  @Input() product: ReviewProductInfo | null = null;

  @Output() submitReviewEmit = new EventEmitter<ReviewFormData>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    rating: this.fb.nonNullable.control(0, { validators: [Validators.min(1)] }),
    description: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(10)] }),
    title: this.fb.nonNullable.control('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    // Reset when parent tells us submission succeeded
    if (changes['submitted']?.currentValue === true) {
      this.form.reset({ rating: 0, description: '', title: '' }, { emitEvent: false });
    }
  }

  /** Type-safe accessor: ensures `[formControl]` always receives a FormControl, not AbstractControl|null */
  ctrl(name: 'rating'): FormControl<number>;
  ctrl(name: 'description'): FormControl<string>;
  ctrl(name: 'title'): FormControl<string>;
  ctrl(name: keyof ReviewForm) {
    return this.form.controls[name];
  }

  submitReview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value as ReviewFormData;
    this.submitReviewEmit.emit(value);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  getImagePath(imagePath?: string): string {
    if (!imagePath || !imagePath.trim()) {
      return `${environment.apiBaseUrl}/media/KG_LOGO.png`;
    }
    // normalize slashes
    return `${environment.apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
}
