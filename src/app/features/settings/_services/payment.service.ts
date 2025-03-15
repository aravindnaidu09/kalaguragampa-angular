import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}`;

  getUserPayments(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  addPayment(payment: any): Observable<any> {
    return this.http.post(this.baseUrl, payment);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  setDefaultPayment(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-default/${id}`, {});
  }

}
