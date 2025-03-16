import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { IProductQueryParams } from '../../_models/product-query-model';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-filter-bar',
  imports: [
    CommonModule
  ],
  templateUrl: './sort-filter-bar.component.html',
  styleUrl: './sort-filter-bar.component.scss'
})
export class SortFilterBarComponent {
  @Output() filterChanged = new EventEmitter<IProductQueryParams>();
  @Output() viewChanged = new EventEmitter<'list' | 'grid'>();
  @Output() clearFilters = new EventEmitter<void>();

  // ✅ Signals for UI State
  totalProducts = signal<number>(0);
  viewMode = signal<'list' | 'grid'>('grid');
  sortBy = signal<string>('best-match');
  activeFilters = signal<FilterOption[]>([]);

  // ✅ Sorting Options
  sortOptions: FilterOption[] = [
    { label: 'Best sellers', value: 'best-sellers' },
    { label: 'Newest', value: 'newest' },
    { label: 'Best rated', value: 'best-rated' },
    { label: 'Trending', value: 'trending' },
    { label: 'Price ↑', value: 'price-asc' },
    { label: 'Price ↓', value: 'price-desc' },
  ];

  ngOnInit(): void {
    this.totalProducts.set(483); // Simulated API call
  }

  /**
   * ✅ Change View Mode
   */
  setViewMode(mode: 'list' | 'grid') {
    this.viewMode.set(mode);
    this.viewChanged.emit(mode);
  }

  /**
   * ✅ Set Sorting Option
   */
  setSortBy(option: string) {
    this.sortBy.set(option);
    // this.filterChanged.emit(option);
  }

  /**
   * ✅ Remove Single Filter
   */
  removeFilter(filter: FilterOption) {
    this.activeFilters.set(this.activeFilters().filter(f => f.value !== filter.value));
  }

  /**
   * ✅ Clear All Filters
   */
  clearAllFilters() {
    this.activeFilters.set([]);
    this.clearFilters.emit();
  }

  /**
   * ✅ TrackBy for Performance
   */
  trackByLabel(index: number, item: FilterOption): string {
    return item.value;
  }
}
