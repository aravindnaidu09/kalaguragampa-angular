import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ProductComponent } from "../product/product.component";
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';

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

  selectedCategory: number = 0;


  constructor(private readonly productService: ProductService) { }

  ngOnInit(): void {
    this.getCategoryList();
  }

  getCategoryList() {
    this.productService.getCategories().subscribe((categories: ICategory[]) => {
      this.categories = categories;
      this.getProductList();
    });
  }

  getProductList(category?: string) {
    this.productService.getAllProducts(category).subscribe({
      next: (products) => {
        console.log('data: ', products);
        this.productsList.set(products);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  selectCategory(index: number, categoryName: string) {
    this.selectedCategory = index;

    this.getProductList(categoryName);
  }
}
