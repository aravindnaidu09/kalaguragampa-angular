import { Component } from '@angular/core';
import { ProductComponent } from "../../../features/product/_components/product/product.component";
import { ProductListComponent } from "../../../features/product/_components/product-list/product-list.component";

@Component({
  selector: 'app-dashboard',
  imports: [ProductComponent, ProductListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
