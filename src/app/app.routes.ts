import { Routes } from '@angular/router';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { ProductComponent } from './features/product/_components/product/product.component';
import { ViewProductComponent } from './features/product/_components/view-product/view-product.component';
import { CheckoutDetailsComponent } from './features/checkout/_components/checkout-details/checkout-details.component';
import { PaymentComponent } from './features/checkout/_components/payment/payment.component';
import { CartDetailsComponent } from './features/cart/_components/cart-details/cart-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'product/:productname', component: ViewProductComponent },
  { path: 'checkout', component: CheckoutDetailsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'cart', component: CartDetailsComponent }
];
