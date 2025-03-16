import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';
import { IProductQueryParams } from '../../_models/product-query-model';

@Component({
  selector: 'app-product-filters',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  providers: [ProductService]
})
export class ProductFiltersComponent implements OnInit {
  /** ✅ Output EventEmitter to send filters to parent */
  @Output() filtersChanged = new EventEmitter<IProductQueryParams>();

  // ✅ Categories (Multi-level structure)
  categories: ICategory[] = [];

  // ✅ Signals for Filters (Reactive)
  selectedCategory = signal<number | null>(null);
  minPrice = signal<number>(0);
  maxPrice = signal<number>(1000);
  selectedRating = signal<number | null>(null);
  sortBy = signal<string>('latest');

  productParams: IProductQueryParams = {};

  constructor(private readonly productService: ProductService) {

  }

  ngOnInit(): void {
    this.fetchCategories();
  }

  // Method to get categories
  fetchCategories() {
    this.productService.getCategories().subscribe((categories: ICategory[]) => {
      this.categories = categories;
    })
  }

  // ✅ Toggle category selection
  toggleCategory(categoryId: number) {
    this.selectedCategory.set(categoryId);
    this.productParams.category_id = categoryId;
    this.emitFilterChanges();
  }

  // ✅ Set Rating Filter
  setRating(rating: number) {
    this.selectedRating.set(rating);
  }

  /** ✅ Emit updated filter parameters */
  private emitFilterChanges() {
    this.filtersChanged.emit({ ...this.productParams });
  }

  // ✅ Reset Filters
  resetFilters() {
    this.selectedCategory.set(null);
    this.minPrice.set(0);
    this.maxPrice.set(1000);
    this.selectedRating.set(null);
    this.sortBy.set('latest');
    this.productParams = {};
    this.emitFilterChanges();
  }
}
