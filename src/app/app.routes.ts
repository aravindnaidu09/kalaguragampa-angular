import { Routes } from '@angular/router';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { ProductComponent } from './features/product/_components/product/product.component';
import { ViewProductComponent } from './features/product/_components/view-product/view-product.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'product/:productname', component: ViewProductComponent }
];
