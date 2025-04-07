import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.onlineStatus.next(true));
    window.addEventListener('offline', () => this.onlineStatus.next(false));
  }

  isOnline(): Observable<boolean> {
    return this.onlineStatus.asObservable();
  }

  get currentStatus(): boolean {
    return this.onlineStatus.value;
  }

}
