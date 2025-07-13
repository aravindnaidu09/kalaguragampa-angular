import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';
import { IProductQueryParams } from '../../_models/product-query-model';
import { debounceTime, Subject } from 'rxjs';

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
export class ProductFiltersComponent implements OnInit,OnChanges {
  /** ✅ Output EventEmitter to send filters to parent */
  @Output() filtersChanged = new EventEmitter<IProductQueryParams>();
  @Input() selectedCat: number | null = null;
isScreenBetween996And400: boolean = false;

  // ✅ Categories List
  categories: ICategory[] = [];

  // ✅ Signals for Filters (Reactive)
  selectedCategory = signal<number | null>(null);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  selectedRating = signal<number | null>(null);
  sortBy = signal<string>('latest');

  productParams: IProductQueryParams = {};

  /** ✅ Debounce subjects to prevent excessive API calls */
  private priceChange$ = new Subject<void>();
  private categoryChange$ = new Subject<number | null>();

  constructor(private readonly productService: ProductService) {
    /** ✅ Debounce filtering for price & category changes */
    this.priceChange$.pipe(debounceTime(500)).subscribe(() => {
      this.emitFilterChanges();
    });

    this.categoryChange$.pipe(debounceTime(300)).subscribe((categoryId) => {
      this.productParams = { ...this.productParams, category_id: categoryId! };
      this.emitFilterChanges();
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
      this.checkScreenWidth();
    window.addEventListener('resize', () => {
      this.checkScreenWidth();
    });
  }
  ngOnChanges() {
    this.selectedCategory.set(this.selectedCat);
    if (this.selectedCat) {
      this.productParams.category_id = this.selectedCat;
    } else {
      delete this.productParams.category_id;
    }
  }
 @HostListener('window:resize', [])
  onResize() {
    this.checkScreenWidth();
  }

  private checkScreenWidth() {
    const width = window.innerWidth;
    this.isScreenBetween996And400 = width <= 1024 && width >= 350;
  }
  /** ✅ Fetch available categories from API */
  fetchCategories() {
    this.productService.getCategories().subscribe({
      next: (categories: ICategory[]) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  /** ✅ Toggle Category Selection (Single Select) */
  toggleCategory(categoryId: number) {
    if (this.selectedCategory() === categoryId) {
      this.selectedCategory.set(null); // Deselect if already selected
      this.categoryChange$.next(null);
   
    } else {
      this.selectedCategory.set(categoryId);
      this.categoryChange$.next(categoryId);
    }
       this.closeOverlay();
  }

  /** ✅ Handle Price Input Changes */
  onPriceChange(type: 'min' | 'max', value: string) {
    const numericValue = value ? parseInt(value, 10) : null;

    if (type === 'min') {
      if (numericValue !== null && numericValue >= 0) {
        this.minPrice.set(numericValue);
        this.productParams.price_min = numericValue;
      } else {
        this.minPrice.set(null);
        delete this.productParams.price_min;
      }
    } else {
      if (numericValue !== null && numericValue >= 0) {
        this.maxPrice.set(numericValue);
        this.productParams.price_max = numericValue;
      } else {
        this.maxPrice.set(null);
        delete this.productParams.price_max;
      }
      
    }

    this.priceChange$.next();
  }

  /** ✅ Set Rating Filter */
  setRating(rating: number) {
    if (this.selectedRating() === rating) {
      this.selectedRating.set(null); // Toggle off if already selected
      delete this.productParams.rating;
    } else {
      this.selectedRating.set(rating);
      this.productParams.rating = rating;
    }
    this.emitFilterChanges();
  }

  /** ✅ Emit updated filter parameters */
  private emitFilterChanges() {
    const filters: IProductQueryParams = { ...this.productParams };

    // ✅ Ensure no unnecessary empty filters are emitted
    if (!filters.category_id) delete filters.category_id;
    if (!filters.price_min) delete filters.price_min;
    if (!filters.price_max) delete filters.price_max;
    if (!filters.rating) delete filters.rating;

    console.log('Filters Emitted:', filters);
    this.filtersChanged.emit(filters);
       
  }

  /** ✅ Reset All Filters */
  resetFilters() {
    this.selectedCategory.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.selectedRating.set(null);
    this.sortBy.set('latest');

    this.productParams = {};
    this.emitFilterChanges();
  }

  openPanel: string | null = null;

openFilter(panel: string) {
  this.openPanel = panel;
}

closeOverlay() {
  this.openPanel = null;
}

applyFilters() {
  this.resetFilters();
  this.closeOverlay();
  // trigger filter logic if needed
}
}
