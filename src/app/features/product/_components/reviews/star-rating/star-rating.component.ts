import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Output() ratingChange = new EventEmitter<number>();

  stars = new Array(5).fill(0);

  selectRating(value: number) {
    this.rating = value;
    this.ratingChange.emit(value);
  }

  getLabel(rating: number): string {
    return ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1];
  }
}
