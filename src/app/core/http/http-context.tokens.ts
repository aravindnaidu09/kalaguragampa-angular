import { HttpContext, HttpContextToken } from '@angular/common/http';

/** When true, the global ErrorInterceptor won't toast/redirect. */
export const HANDLE_ERROR_LOCALLY = new HttpContextToken<boolean>(() => false);

/** Sugar for requests that want local handling. */
export const SILENT_HTTP = new HttpContext().set(HANDLE_ERROR_LOCALLY, true);
