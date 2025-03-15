import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}`;

  getSecuritySettings(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, data);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  update2FA(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/update-2fa`, data);
  }
}
