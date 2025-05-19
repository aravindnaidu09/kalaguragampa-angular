import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { filter, take, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../features/auth/_services/auth.service';
import { AuthState, ClearToken, SetToken } from '../../features/auth/_state/auth.state';
import { ToastService } from '../services/toast.service';

// ⚡ Locking state to prevent multiple refresh token calls
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  const accessToken = store.selectSnapshot(AuthState.getAccessToken) ?? localStorage.getItem('accessToken')!;
  const refreshToken = store.selectSnapshot(AuthState.getRefreshToken) ?? localStorage.getItem('refreshToken')!;

  let clonedRequest = req;
  if (accessToken) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only intercept 401s (not for refresh token call itself)
      if (error.status === 401 && !req.url.includes('/auth/api/v1/token/refresh/')) {

        if (!refreshToken) {
          store.dispatch(new ClearToken());
          return throwError(() => new Error('Session expired. Please log in again.'));
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null); // reset

          return authService.refreshAccessToken().pipe(
            switchMap((newTokens) => {
              isRefreshing = false;
              store.dispatch(new SetToken(newTokens.access, newTokens.refresh));
              refreshTokenSubject.next(newTokens.access);

              const updatedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${newTokens.access}` }
              });
              return next(updatedRequest);
            }),
            catchError(err => {
              isRefreshing = false;
              store.dispatch(new ClearToken());
              refreshTokenSubject.next(null);
              return throwError(() => new Error('Session expired. Please log in again.'));
            })
          );

        } else {
          // Wait until the refresh is done
          return refreshTokenSubject.pipe(
            filter(token => !!token),
            take(1),
            switchMap((newAccessToken) => {
              const updatedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` }
              });
              return next(updatedRequest);
            })
          );
        }
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
