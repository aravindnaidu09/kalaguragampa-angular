import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}`;

  // ✅ Fetch Notification Preferences
  getNotificationSettings(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // ✅ Update Notification Preferences
  updateNotificationSettings(settings: any): Observable<any> {
    return this.http.post(this.baseUrl, settings);
  }

}
