import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { AUTH_API_URLS } from '../../../core/constants/auth-api-urls';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  constructor(private readonly httpClient: HttpClient) { }

  sendOtp(mobile: string, otp_type: string, country_code: string): Observable<any> {
    const url = `${APP_SETTINGS.apiBaseUrl}${AUTH_API_URLS.auth.sendOtp}`;
    const payload = { mobile, otp_type, country_code };
    return this.httpClient.post(url, payload);
  }


}
