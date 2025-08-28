import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { ShiprocketTrackApi } from '../_models/tracking.model';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor(private http: HttpClient) {}

  /** GET /delivery/api/v1/delivery/track/{deliveryId}/ */
  trackDelivery(deliveryId: number): Observable<ShiprocketTrackApi> {
    const url = `${environment.apiBaseUrl}/delivery/api/v1/delivery/track/${deliveryId}/`;
    return this.http.get<ShiprocketTrackApi>(url).pipe(
      // No transform here; we normalize in state to keep a single source of truth
      map((r) => r)
    );
  }
}
