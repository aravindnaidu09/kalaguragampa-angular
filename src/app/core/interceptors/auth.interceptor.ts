import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { AuthState, SetToken, ClearToken } from '../../features/auth/_state/auth.state';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../../features/auth/_services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  // ✅ Retrieve Access Token Synchronously
  const accessToken = store.selectSnapshot(AuthState.getAccessToken) ? store.selectSnapshot(AuthState.getAccessToken) : localStorage.getItem('accessToken')!;
  const refreshToken = store.selectSnapshot(AuthState.getRefreshToken) ? store.selectSnapshot(AuthState.getRefreshToken) : localStorage.getItem('refreshToken')!;

  let clonedRequest = req;

  // ✅ Attach Authorization Header if Token Exists
  if (accessToken) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('error-message: ', error)
      if (error.status === 401) {
        console.log('🔄 Access Token Expired. Attempting Refresh...');

        if (!refreshToken) {
          console.warn('❌ No Refresh Token Available! Redirecting to Login.');
          store.dispatch(new ClearToken());
          // router.navigate(['/login']);
          return throwError(() => new Error('Session expired. Please log in again.'));
        }

        // ✅ Call AuthService to Get a New Access Token
        return authService.refreshAccessToken().pipe(
          switchMap((newTokens) => {
            console.log('✅ New Tokens Received:', newTokens);

            // ✅ Update Tokens in NGXS Store
            store.dispatch(new SetToken(newTokens.access, newTokens.refresh));

            // ✅ Retry the Original Request with the New Token
            const updatedRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newTokens.access}` }
            });

            return next(updatedRequest);
          }),
          catchError(err => {
            console.error('❌ Refresh Token Expired. Logging Out.');
            store.dispatch(new ClearToken());
            // router.navigate(['/login']);
            return throwError(() => new Error('Session expired. Please log in again.'));
          })
        );
      }

      let errorMessage = 'An unexpected error occurred';
      if (error.status === 403) {
        errorMessage = 'Access Denied.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      toastService.showError(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
