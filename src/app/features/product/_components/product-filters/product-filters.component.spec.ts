import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFiltersComponent } from './product-filters.component';
import { ProductService } from '../../_services/product.service';
import { ICategory } from '../../_models/category-model';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('ProductFiltersComponent', () => {
  let component: ProductFiltersComponent;
  let fixture: ComponentFixture<ProductFiltersComponent>;
  let productService: jasmine.SpyObj<ProductService>;

  /** ✅ Mock Data for Categories */
  const mockCategories: ICategory[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home Appliances' }
  ];

  beforeEach(async () => {
    /** ✅ Mock ProductService */
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getCategories']);

    await TestBed.configureTestingModule({
      imports: [ProductFiltersComponent, HttpClientTestingModule], // ✅ Standalone imports
      providers: [{ provide: ProductService, useValue: productServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFiltersComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  /** ✅ Test: Component Creation */
  it('should create the ProductFiltersComponent', () => {
    expect(component).toBeTruthy();
  });

  /** ✅ Test: Fetch Categories Successfully */
  it('should fetch categories on init', () => {
    productService.getCategories.and.returnValue(of(mockCategories));

    component.ngOnInit();
    fixture.detectChanges();

    expect(productService.getCategories).toHaveBeenCalledTimes(1);
    expect(component.categories).toEqual(mockCategories);
  });

  /** ❌ Test: Handle API Error Gracefully */
  it('should handle error if category API fails', () => {
    productService.getCategories.and.returnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();
    fixture.detectChanges();

    expect(productService.getCategories).toHaveBeenCalledTimes(1);
    expect(component.categories).toEqual([]);
  });

  /** ✅ Test: Select a Category (Single Select) */
  it('should select only one category at a time', () => {
    component.toggleCategory(1);
    expect(component.selectedCategories()).toEqual([1]);

    component.toggleCategory(2); // Selecting a new category should replace the old one
    expect(component.selectedCategories()).toEqual([2]);
  });

  /** ✅ Test: Set Rating */
  it('should set rating when clicked', () => {
    component.setRating(4);
    expect(component.selectedRating()).toBe(4);

    component.setRating(5);
    expect(component.selectedRating()).toBe(5);
  });

  /** ✅ Test: Reset Filters */
  it('should reset all filters', () => {
    component.selectedCategories.set([1]);
    component.minPrice.set(200);
    component.maxPrice.set(800);
    component.selectedRating.set(4);
    component.sortBy.set('oldest');

    component.resetFilters();

    expect(component.selectedCategories()).toEqual([]);
    expect(component.minPrice()).toBe(0);
    expect(component.maxPrice()).toBe(1000);
    expect(component.selectedRating()).toBeNull();
    expect(component.sortBy()).toBe('latest');
  });

  /** ✅ Test: UI - Selecting a Category */
  it('should update UI when a category is selected', () => {
    productService.getCategories.and.returnValue(of(mockCategories));
    component.ngOnInit();
    fixture.detectChanges();

    const categoryRadios = fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    categoryRadios[0].nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedCategories()).toContain(mockCategories[0].id);
  });

  /** ✅ Test: UI - Clicking Reset Button */
  it('should reset filters when reset button is clicked', () => {
    component.selectedCategories.set([1]);
    fixture.detectChanges();

    const resetButton = fixture.debugElement.query(By.css('.reset-btn'));
    resetButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.selectedCategories()).toEqual([]);
  });
});
