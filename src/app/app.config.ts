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


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withHashLocation()),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideStore([AuthState, OtpState, SearchState, WishlistState, CartState, AddressState, OrderState],
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
