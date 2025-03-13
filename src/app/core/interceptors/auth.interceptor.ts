import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { AuthState, ClearToken } from '../../features/auth/_state/auth.state';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const store = inject(Store);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // ✅ Retrieve Token Synchronously
  const token = store.selectSnapshot(AuthState.getAccessToken);
  console.log('Retrieved Token from Store:', token);

  let clonedRequest = req;

  // ✅ Attach Authorization Header if Token Exists
  if (token) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    console.log('Request with Token:', clonedRequest);
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 401) {
        errorMessage = error.error.message || 'Session expired. Please log in again.';

        // ✅ Prevent infinite loop by checking if already on login page
        if (router.url !== '/login') {
          store.dispatch(new ClearToken());
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        errorMessage = 'Access Denied.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      toastService.showError(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
