import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { AuthState, ClearToken } from '../../features/auth/_state/auth.state';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const store = inject(Store);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return store.select(AuthState.getToken).pipe(
    switchMap((token) => {
      let clonedRequest = req;

      // Attach Authorization Header if Token Exists
      if (token) {
        clonedRequest = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }

      return next(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'An unexpected error occurred';

          if (error.status === 401) {
            errorMessage = 'Session expired. Please log in again.';
            store.dispatch(new ClearToken()); // Clear Token
            router.navigate(['/login']);
          } else if (error.status === 403) {
            errorMessage = 'Access Denied.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          toastService.showError(errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
    })
  );
};
