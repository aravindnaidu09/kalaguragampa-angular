import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

export const messageInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.body?.message) {
        const statusCode = event.body?.statusCode;
        // Only show message if it's not a silent API
        if (statusCode && statusCode >= 200 && statusCode < 300) {
          toastService.showSuccess(event.body.message);
        }
      }
    })
  );
};
