import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-sort-filter',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './review-sort-filter.component.html',
  styleUrl: './review-sort-filter.component.scss'
})
export class ReviewSortFilterComponent {
  @Input() selected: string = 'Most Recent';
  @Output() sortChanged = new EventEmitter<any>();

  sortOptions = ['Most Recent', 'Highest Rated', 'Lowest Rated'];

  onSelect(option: string) {
    this.sortChanged.emit(option);
  }
}
