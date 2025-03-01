import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';

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
  // ✅ Categories (Multi-level structure)
  categories: ICategory[] = [];

  // ✅ Signals for Filters (Reactive)
  selectedCategories = signal<number[]>([]);
  minPrice = signal<number>(0);
  maxPrice = signal<number>(1000);
  selectedRating = signal<number | null>(null);
  sortBy = signal<string>('latest');

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
    const updatedSelection = this.selectedCategories().includes(categoryId)
      ? this.selectedCategories().filter(id => id !== categoryId)
      : [...this.selectedCategories(), categoryId];

    this.selectedCategories.set(updatedSelection);
  }

  // ✅ Set Rating Filter
  setRating(rating: number) {
    this.selectedRating.set(rating);
  }

  // ✅ Reset Filters
  resetFilters() {
    this.selectedCategories.set([]);
    this.minPrice.set(0);
    this.maxPrice.set(1000);
    this.selectedRating.set(null);
    this.sortBy.set('latest');
  }
}
