import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import { map, Observable } from 'rxjs';
import { ProfileModel } from '../_model/profile.model';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private http = inject(HttpClient);
  private baseUrl = `${APP_SETTINGS.apiBaseUrl}/auth/api/v1/user-info/`;

  // ✅ Fetch User Profile
  getUserProfile(): Observable<ProfileModel> {
    return this.http.get<{data: ProfileModel}>(this.baseUrl)
    .pipe(
      map(response => response.data)
    );;
  }

  // ✅ Update User Profile
  updateUserProfile(data: Partial<ProfileModel>): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

}
