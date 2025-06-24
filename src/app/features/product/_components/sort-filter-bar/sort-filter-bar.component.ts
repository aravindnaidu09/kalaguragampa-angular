import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  // ✅ Signals for UI State
  @Input() totalProducts = signal<number>(0);

  @Output() filterChanged = new EventEmitter<IProductQueryParams>();
  @Output() viewChanged = new EventEmitter<'list' | 'grid'>();
  @Output() clearFilters = new EventEmitter<void>();

  viewMode = signal<'list' | 'grid'>('grid');
  sortBy = signal<string>('best-match');
  activeFilters = signal<FilterOption[]>([]);

  // ✅ Sorting Options
  sortOptions: FilterOption[] = [
    // { label: 'Best sellers', value: 'best-sellers' },
    // { label: 'Newest', value: 'newest' },
    // { label: 'Best rated', value: 'best-rated' },
    // { label: 'Trending', value: 'trending' },
    { label: 'Price ↑', value: 'price_asc' },
    { label: 'Price ↓', value: 'price_desc' },
  ];

  ngOnInit(): void {
    // this.totalProducts.set(483); // Simulated API call
  }

  /**
   * ✅ Change View Mode
   */
  setViewMode(mode: 'list' | 'grid') {
    this.viewMode.set(mode);
    this.viewChanged.emit(mode);
  }

  /**
  * ✅ Set Sorting Option & Emit Filter
  */
  setSortBy(option: string) {
    if (this.sortBy() !== option) {
      this.sortBy.set(option);
      this.emitFilterChanges();
    }
  }

  /**
   * ✅ Add or Remove a Filter Option
   */
  toggleFilter(filter: FilterOption) {
    const filters = this.activeFilters();
    const exists = filters.some(f => f.value === filter.value);

    this.activeFilters.set(
      exists ? filters.filter(f => f.value !== filter.value) : [...filters, filter]
    );

    this.emitFilterChanges();
  }

  /**
   * ✅ Remove Single Filter
   */
  removeFilter(filter: FilterOption) {
    this.activeFilters.set(this.activeFilters().filter(f => f.value !== filter.value));
    this.emitFilterChanges();
  }

  /**
   * ✅ Clear All Filters
   */
  clearAllFilters() {
    if (this.activeFilters().length > 0) {
      this.activeFilters.set([]);
      this.sortBy.set('best-match'); // Reset Sort Option
      this.clearFilters.emit();
    }
  }

  /**
   * ✅ Emit Filter Changes to Parent
   */
  private emitFilterChanges() {
    const filters: IProductQueryParams = {
      sort_by: this.sortBy(),
    };

    // ✅ Apply Selected Filters
    if (this.activeFilters().length > 0) {
      filters.category = this.activeFilters().map(f => f.value).join(',');
    }

    this.filterChanged.emit(filters);
  }

  /**
   * ✅ TrackBy for Performance Optimization
   */
  trackByLabel(index: number, item: FilterOption): string {
    return item.value;
  }
}
