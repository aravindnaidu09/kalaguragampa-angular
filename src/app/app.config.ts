import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngxs/store';
import { AuthState } from './features/auth/_state/auth.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideStore([AuthState],
      // withNgxsReduxDevtoolsPlugin(),
      // withNgxsFormPlugin(),
      // withNgxsLoggerPlugin(),
      // withNgxsStoragePlugin({
      //   keys: '*'
      // })
    ),
  ]
};
