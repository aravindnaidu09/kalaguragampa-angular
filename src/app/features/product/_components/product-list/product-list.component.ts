import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ProductComponent } from "../product/product.component";
import { ICategory } from '../../_models/category-model';
import { ProductService } from '../../_services/product.service';
import { IProduct } from '../../_models/product-model';
import { take } from 'rxjs';

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

  getCategoryList(): void {
    this.productService.getCategories().pipe(take(1)).subscribe((categories: ICategory[]) => {
      this.categories = categories;
      this.getProductList();
    });
  }

  getProductList(category?: string): void {
    this.productService.getAllProducts(category).pipe(take(1)).subscribe((products: IProduct[]) => {
      this.productsList.set(products);
    });
  }

  selectCategory(index: number, categoryName: string) {
    this.selectedCategory = index;

    this.getProductList(categoryName);
  }
}
