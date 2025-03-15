import { Routes } from '@angular/router';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { ProductComponent } from './features/product/_components/product/product.component';
import { ViewProductComponent } from './features/product/_components/view-product/view-product.component';
import { CheckoutDetailsComponent } from './features/checkout/_components/checkout-details/checkout-details.component';
import { PaymentComponent } from './features/checkout/_components/payment/payment.component';
import { CartDetailsComponent } from './features/cart/_components/cart-details/cart-details.component';
import { RefundPolicyComponent } from './shared/components/refund-policy/refund-policy.component';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { ShipmentPolicyComponent } from './shared/components/shipment-policy/shipment-policy.component';
import { TermsComponent } from './shared/components/terms/terms.component';
import { ProductsPageComponent } from './features/product/_components/products-page/products-page.component';
import { WishlistComponent } from './features/cart/_components/wishlist/wishlist.component';
import { UserSettingsComponent } from './features/settings/_components/user-settings/user-settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'product/:productname', component: ViewProductComponent },
  { path: 'checkout', component: CheckoutDetailsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'cart', component: CartDetailsComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'refund-policy', component: RefundPolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'shipping-policy', component: ShipmentPolicyComponent },
  { path: 'terms-services', component: TermsComponent },
  { path: 'detail-view', component: ProductsPageComponent },
  { path: 'settings', component: UserSettingsComponent }
];
