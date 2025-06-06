import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { AUTH_API_URLS } from '../../../core/constants/auth-api-urls';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient) { }

  sendOtp(identifier: string, otpType: 'email' | 'mobile', countryCode?: string, otpFor?: string): Observable<any> {
    let payload: any = { otp_type: otpType, otp_for: otpFor };

    if (otpType === 'mobile') {
      payload.mobile = identifier;
      if (countryCode) payload.country_code = countryCode; // Only add country_code if provided
    } else {
      payload.email = identifier;
    }

    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.sendOtp}`, payload);
  }

  verifyOtp(identifier: string, otp: string, otpType: 'email' | 'mobile', countryCode?: string, otpFor?: string): Observable<any> {
    let payload: any = { otp_type: otpType, otp, otp_for: otpFor };

    if (otpType === 'mobile') {
      payload.mobile = identifier;
      if (countryCode) payload.country_code = countryCode; // Add only if provided
    } else {
      payload.email = identifier;
    }

    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.verifyOtp}`, payload);
  }


  resendOtp(identifier: string, otpType: 'email' | 'mobile', countryCode?: string): Observable<any> {
    let payload: any = { otp_mode: otpType };

    if (otpType === 'mobile') {
      payload.mobile = identifier;
      // if (countryCode) payload.country_code = countryCode; // Only add country_code if provided
    } else {
      payload.email = identifier;
    }

    return this.httpClient.post(`${this.baseUrl}${AUTH_API_URLS.auth.resendOtp}`, payload);
  }


}
