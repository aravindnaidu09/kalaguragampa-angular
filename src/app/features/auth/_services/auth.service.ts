import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { AUTH_API_URLS } from '../../../core/constants/auth-api-urls';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient) { }

  login(isOtpLogin: boolean, username: string, credential: string): Observable<any> {
    const url = `${this.baseUrl}${AUTH_API_URLS.auth.login}`;
    const payload = isOtpLogin ? { username, otp: credential } : { username, password: credential };
    return this.httpClient.post(url, payload);
  }

  logout(): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.logout}`, {});
  }

  sendOtp(identifier: string, otpType: 'email' | 'mobile', countryCode?: string): Observable<any> {
    let payload: any = { otp_type: otpType };

    if (otpType === 'mobile') {
      payload.mobile = identifier;
      if (countryCode) payload.country_code = countryCode; // Only add country_code if provided
    } else {
      payload.email = identifier;
    }

    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.sendOtp}`, payload);
  }

  verifyOtp(identifier: string, otp: string, otpType: 'email' | 'mobile', countryCode?: string): Observable<any> {
    let payload: any = { otp_type: otpType, otp };

    if (otpType === 'mobile') {
      payload.mobile = identifier;
      if (countryCode) payload.country_code = countryCode; // Add only if provided
    } else {
      payload.email = identifier;
    }

    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.verifyOtp}`, payload);
  }


  refreshToken(token: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.tokenRefresh}`, { token });
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

  resetPassword(email: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.user.passwordReset}`, { email });
  }

}
