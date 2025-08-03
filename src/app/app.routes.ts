import { Routes } from '@angular/router';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { ViewProductComponent } from './features/product/_components/view-product/view-product.component';
import { CheckoutDetailsComponent } from './features/checkout/_components/checkout-details/checkout-details.component';
import { CartDetailsComponent } from './features/cart/_components/cart-details/cart-details.component';
import { RefundPolicyComponent } from './shared/components/refund-policy/refund-policy.component';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { ShipmentPolicyComponent } from './shared/components/shipment-policy/shipment-policy.component';
import { TermsComponent } from './shared/components/terms/terms.component';
import { ProductsPageComponent } from './features/product/_components/products-page/products-page.component';
import { WishlistComponent } from './features/cart/_components/wishlist/wishlist.component';
import { UserSettingsComponent } from './features/settings/_components/user-settings/user-settings.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { AddReviewContainerComponent } from './features/product/_components/reviews/add-review-container/add-review-container.component';
import { ProfileComponent } from './features/settings/_components/profile/profile.component';
import { AddressManagementComponent } from './features/settings/_components/address-management/address-management.component';
import { NotificationPreferencesComponent } from './features/settings/_components/notification-preferences/notification-preferences.component';
import { OrderHistoryComponent } from './features/settings/_components/order-history/order-history.component';
import { TrackOrderComponent } from './features/orders/_components/track-order/track-order.component';
import { ChangePasswordComponent } from './features/auth/_components/change-password/change-password.component';
import { AboutUsComponent } from './shared/components/about-us/about-us.component';
import { ConfirmExitGuard } from './core/guards/confirm-exit.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'product/:slug/:id', component: ViewProductComponent },
  { path: 'checkout', component: CheckoutDetailsComponent },
  { path: 'cart', component: CartDetailsComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'refund-policy', component: RefundPolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'shipping-policy', component: ShipmentPolicyComponent },
  { path: 'terms-services', component: TermsComponent },
  { path: 'detail-view', component: ProductsPageComponent },
  { path: 'track-order/:delivery_id', component: TrackOrderComponent },
  { path: 'review-product/:product_id', component: AddReviewContainerComponent },
  {
    path: 'settings',
    component: UserSettingsComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent, data: { animation: 'profile' } },
      { path: 'address', component: AddressManagementComponent, data: { animation: 'address' } },
      { path: 'orders', component: OrderHistoryComponent, data: { animation: 'orders' } },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'notifications', component: NotificationPreferencesComponent, data: { animation: 'notifications' } }
    ]
  },
  { path: 'review/:id', component: AddReviewContainerComponent },


  // 🚨 Catch-all fallback route — should always be last
  { path: '**', component: PageNotFoundComponent },
];
