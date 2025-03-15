import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/user/profile`;

  // ✅ Fetch User Profile
  getUserProfile(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // ✅ Update User Profile
  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, formData);
  }

}
