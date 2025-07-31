import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      const errorMessage =
        error?.error?.message || error?.message || 'Something went wrong';

      // Log or capture all non-2xx errors
      console.error('[HTTP ERROR]', {
        url: req.url,
        method: req.method,
        status,
        error: error?.error,
        fullError: error
      });

      // Show toast only if not already handled
      if (status !== 401) {
        toastService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
