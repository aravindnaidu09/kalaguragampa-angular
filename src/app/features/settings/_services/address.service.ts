import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { Address, deserializeAddress, serializeAddress } from '../_model/address-model';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { ADDRESS_API_URLS } from '../../../core/constants/address-urls';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private http = inject(HttpClient);
  private baseUrl = `${APP_SETTINGS.apiBaseUrl}`;

  // ✅ Fetch User Addresses & Convert API Format to Frontend Format
  getUserAddresses(): Observable<Address[]> {
    return this.http.get<any[]>(`${this.baseUrl}${ADDRESS_API_URLS.address.getAll}`).pipe(
      map((response: any) => Array.isArray(response.data) ? response.data.map(deserializeAddress) : [])
    );
  }

  // ✅ Add New Address (Convert Frontend Model to API Format)
  addAddress(address: Address): Observable<any> {
    return this.http.post(`${this.baseUrl}${ADDRESS_API_URLS.address.create}`, address);
  }

  // ✅ Update Address (Convert Frontend Model to API Format)
  updateAddress(id: number, address: Address): Observable<any> {
    return this.http.put(`${this.baseUrl}${ADDRESS_API_URLS.address.update(id)}`, address);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${ADDRESS_API_URLS.address.delete(id)}`);
  }

  setDefaultAddress(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-default/${id}`, {});
  }

}
