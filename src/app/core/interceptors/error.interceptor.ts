// core/interceptors/error.interceptor.ts
import {
  HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../services/toast.service';
import { HANDLE_ERROR_LOCALLY } from '../http/http-context.tokens';
import { AuthService } from '../../features/auth/_services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const toast = inject(ToastService);
  const router = inject(Router, { optional: true });
  const auth = inject(AuthService, { optional: true });

  const handledLocally = req.context.get(HANDLE_ERROR_LOCALLY) === true;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;

      // Structured log (keep it!)
      console.error('[HTTP ERROR]', {
        url: req.url, method: req.method, status,
        error: error?.error, fullError: error
      });

      // 401 (unless silenced) → session handling
      if (!handledLocally && status === 401) {
        // auth?.logout?.();
        // router?.navigate(['/login']);
        return throwError(() => error);
      }

      // Global toast only if NOT handled locally
      if (!handledLocally) {
        toast.showError(extractMessage(error));
      }

      // Always rethrow so caller can react if it wants
      return throwError(() => error);
    })
  );
};

// Small helper for consistent messages
function extractMessage(err: HttpErrorResponse): string {
  const e = err?.error;
  if (err.status === 0) return 'Network error. Please check your connection.';
  return (
    (typeof e === 'string' && e) ||
    e?.message ||
    e?.detail ||
    e?.title ||
    err.message ||
    'Something went wrong'
  );
}
