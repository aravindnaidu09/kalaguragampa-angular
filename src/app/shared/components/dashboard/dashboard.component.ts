import { Component } from '@angular/core';
import { ProductComponent } from "../../../features/product/_components/product/product.component";
import { ProductListComponent } from "../../../features/product/_components/product-list/product-list.component";
import { HeroSectionComponent } from "../hero-section/hero-section.component";

@Component({
  selector: 'app-dashboard',
  imports: [ProductListComponent, HeroSectionComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
