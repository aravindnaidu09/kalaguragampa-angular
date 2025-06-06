import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, map, Observable, take } from 'rxjs';
import { Address, deserializeAddress, serializeAddress } from '../_model/address-model';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { ADDRESS_API_URLS } from '../../../core/constants/address-urls';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private http = inject(HttpClient);
  private baseUrl = `${APP_SETTINGS.apiBaseUrl}`;

  // ✅ Fetch User Addresses (List)
  getUserAddresses(): Observable<Address[]> {
    return this.http.get<any>(`${this.baseUrl}${ADDRESS_API_URLS.address.getAll}`).pipe(
      map((response: any) => {
        const data = response.data;
        return Array.isArray(data)
          ? data.map(deserializeAddress)
          : data && typeof data === 'object'
          ? [deserializeAddress(data)]
          : [];
      })
    );
  }

  // ✅ Add New Address (Deserialize single object)
  addAddress(address: Address): Observable<Address> {
  return this.http.post<any>(`${this.baseUrl}${ADDRESS_API_URLS.address.create}`, address, { observe: 'response' }).pipe(
    take(1), // ✅ emits once
    filter((res: any) => res.statusCode === 200 || res.statusCode === 201),
    map(res => deserializeAddress(res.body?.data))
  );
}


  // ✅ Update Address (Deserialize single object)
  updateAddress(id: number, address: Address): Observable<Address> {
    return this.http.put<any>(`${this.baseUrl}${ADDRESS_API_URLS.address.update(id)}`, address).pipe(
      map((response) => deserializeAddress(response.data))
    );
  }

  // ✅ Delete
  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${ADDRESS_API_URLS.address.delete(id)}`);
  }

  // ✅ Set Default Address
  setDefaultAddress(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-default/${id}`, {});
  }
}
