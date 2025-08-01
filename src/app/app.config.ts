import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

import { AuthState } from './features/auth/_state/auth.state';
import { OtpState } from './features/auth/_state/otp.state';
import { SearchState } from './features/product/_state/search.state';
import { WishlistState } from './features/cart/_state/wishlist.state';
import { CartState } from './features/cart/_state/cart.state';
import { AddressState } from './features/settings/_state/address.state';
import { OrderState } from './features/settings/_state/order.state';

import { provideServiceWorker } from '@angular/service-worker';
import { ProfileState } from './features/settings/_state/profile.state';
import { TrackState } from './features/orders/_state/track.state';
import { ReviewState } from './features/product/_state/review.state';
import { BreadcrumbState } from './core/state/breadcrumb.state';
import { CouponState } from './features/cart/_state/coupon.state';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { messageInterceptor } from './core/interceptors/message.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, messageInterceptor])),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideStore([AuthState, OtpState, SearchState, WishlistState, CartState, AddressState, OrderState, ProfileState, TrackState, ReviewState, BreadcrumbState, CouponState],
      withNgxsReduxDevtoolsPlugin(),
      // withNgxsFormPlugin(),
      withNgxsLoggerPlugin(),
      withNgxsStoragePlugin({
        keys: [
          'auth.accessToken', // ✅ Store only accessToken
          'auth.refreshToken' // ✅ Store only refreshToken,

        ]
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};
