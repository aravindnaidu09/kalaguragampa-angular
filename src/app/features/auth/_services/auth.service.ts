import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { AUTH_API_URLS } from '../../../core/constants/auth-api-urls';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthState, ClearToken, SetToken } from '../_state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient,
    private readonly store: Store
  ) { }

  login(isOtpLogin: boolean, username: string, credential: string): Observable<any> {
    const url = `${this.baseUrl}${AUTH_API_URLS.auth.login}`;
    const payload = isOtpLogin ? { username, otp: credential } : { username, password: credential };
    return this.httpClient
      .post<{ statusCode: number; message: string; data: { access: string; refresh: string } }>(url, payload)
      .pipe(map(response => response.data));
  }

  refreshAccessToken(): Observable<{ access: string; refresh: string }> {
    let refreshToken = this.store.selectSnapshot(AuthState.getRefreshToken);
    if (!refreshToken) {
      // return throwError(() => new Error('No refresh token available.'));
      refreshToken = localStorage.getItem('refreshToken')!;
    }

    return this.httpClient.post<{ access: string; refresh: string }>(
      `${this.baseUrl}/${AUTH_API_URLS.auth.tokenRefresh}`, { refresh: refreshToken }
    ).pipe(
      map(response => {
        this.store.dispatch(new SetToken(response.access, response.refresh));
        return response;
      }),
      catchError(error => {
        this.store.dispatch(new ClearToken());
        return throwError(() => new Error('Refresh token expired, please log in again.'));
      })
    );
  }

  register(userData: any): Observable<any> {
    const payload = {
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,  // Converting camelCase to snake_case
      last_name: userData.lastName,
      mobile: userData.mobileNumber,
      country_code: '91', // Assuming a default country code for India
      password: userData.password,
      confirm_password: userData.confirmPassword,
    };

    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.user.register}`, payload);
  }

  changePassword(data: { oldPassword: string; newPassword: string }): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.user.changePassword}`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.user.passwordReset}`, { email });
  }

  /** ✅ Check if the user is authenticated */
  isAuthenticated(): boolean {
    const token = this.store.selectSnapshot(AuthState.getAccessToken) || this.getAccessToken();
    return token !== null && token !== undefined && token.trim() !== '';
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(): Observable<any> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.store.dispatch(new ClearToken());
    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.logout}`, {});
  }
}
