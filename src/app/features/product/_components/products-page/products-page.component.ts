import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ProductFiltersComponent } from '../product-filters/product-filters.component';
import { SortFilterBarComponent } from '../sort-filter-bar/sort-filter-bar.component';
import { DetailedProductListComponent } from '../detailed-product-list/detailed-product-list.component';

@Component({
  selector: 'app-products-page',
  imports: [
    CommonModule,
    ProductFiltersComponent,
    SortFilterBarComponent,
    DetailedProductListComponent
  ],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent {
  // ✅ Signals for Sort & View State
  sortBy = signal<string>('latest');
  viewMode = signal<'list' | 'grid'>('grid');

  constructor() { }

  ngOnInit(): void { }

  /**
   * ✅ Apply Sorting from SortFilterBar
   */
  applySort(sortOption: string): void {
    console.log('Sorting changed:', sortOption);
    this.sortBy.set(sortOption);
  }

  /**
   * ✅ Change View Mode (Grid/List)
   */
  changeViewMode(view: 'list' | 'grid'): void {
    console.log('View changed:', view);
    this.viewMode.set(view);
  }

  /**
   * ✅ Reset Filters
   */
  resetFilters(): void {
    console.log('Filters reset');
  }
}
