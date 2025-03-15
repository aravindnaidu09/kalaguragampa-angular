import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { Address, deserializeAddress, serializeAddress } from '../_model/address-model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}`;

  // ✅ Fetch User Addresses & Convert API Format to Frontend Format
  getUserAddresses(): Observable<Address[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((response) => response.map(deserializeAddress)) // Convert API response
    );
  }

  // ✅ Add New Address (Convert Frontend Model to API Format)
  addAddress(address: Address): Observable<any> {
    return this.http.post(this.baseUrl, serializeAddress(address));
  }

  // ✅ Update Address (Convert Frontend Model to API Format)
  updateAddress(id: number, address: Address): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, serializeAddress(address));
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  setDefaultAddress(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-default/${id}`, {});
  }

}
