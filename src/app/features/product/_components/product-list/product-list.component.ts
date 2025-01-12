import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductComponent } from "../product/product.component";

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    ProductComponent
],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  categories = [
    { name: 'All' },
    { name: 'Herbs & Extracts' },
    { name: 'Pickles & Powders' },
    { name: 'Nuts, Dry Fruits & Seeds' },
    { name: 'Sweeteners & Salts' },
    { name: 'Indian Snacks & Fryums' },
    { name: 'Essential Oils' },
    { name: 'Indian Dals & Pulses' },
    { name: 'Indian Spices & Masalas' },
    { name: 'Garden Tools & Fertilizers' },
    { name: 'Indian Honey & Syrups' },
    { name: 'Farooky Products' },
    { name: 'Millets & Flakes' },
    { name: 'Kottakal' },
    { name: 'Home & Kitchen' },
    { name: 'Cold Pressed Oils' },
    { name: 'UnCategorized' },
    { name: 'Seeds & Plants' },
    { name: 'Personal & Hair Care' },
    { name: 'Indian Grocery' },
    { name: 'Indian Rice & Flours' },
    { name: 'Bull Driven Ghani Oils' },
  ];

  selectedCategory: number = 0;

  selectCategory(index: number) {
    this.selectedCategory = index;
  }
}
