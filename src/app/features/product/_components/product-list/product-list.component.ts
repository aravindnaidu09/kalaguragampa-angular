import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ProductComponent } from "../product/product.component";
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { IProductQueryParams } from '../../_models/product-query-model';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    ProductComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  categories: ICategory[] = [];
  productsList = signal<IProduct[]>([]);

  // ✅ New signals for pagination metadata
  totalProducts = signal(0); // Total product count
  nextPage = signal<string | null>(null); // Next page URL
  previousPage = signal<string | null>(null); // Previous page URL

  selectedCategory: number = 0;


  constructor(private readonly productService: ProductService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.getCategoryList();
  }

  getCategoryList(): void {
    this.productService.getCategories().pipe(take(1)).subscribe((categories: ICategory[]) => {
      this.categories = categories;
      this.getProductList();
    });
  }

  getProductList(category?: number, offset: number = 0, limit: number = 50): void {
    const params: IProductQueryParams = {
      category_id: category
    }
    this.productService.getAllProducts(params)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.productsList.set(response.products.slice(0, 15)); // ✅ Update products
          this.totalProducts.set(response.totalCount); // ✅ Set total product count
          this.nextPage.set(response.nextPage); // ✅ Set next page URL
          this.previousPage.set(response.previousPage); // ✅ Set previous page URL
        },
        error: (error) => {
          console.error('Error fetching product list:', error);
        }
      });
  }


  selectCategory(index: number, categoryId: number) {
    this.selectedCategory = index;

    this.getProductList(categoryId);
  }

  navigateToProductPage() {
    this.router.navigate(['/detail-view']);
  }
}
