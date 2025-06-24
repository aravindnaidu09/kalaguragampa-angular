import { computed, inject, Injectable } from '@angular/core';
import { Store, Actions, ofActionCompleted } from '@ngxs/store';
import { catchError, filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { AddressState } from './address.state';
import {
  LoadAddresses,
  AddAddress,
  UpdateAddress,
  DeleteAddress,
  SetDefaultAddress
} from './address.actions';
import { Address } from '../_model/address-model';

@Injectable({ providedIn: 'root' })
export class AddressFacade {
  private store = inject(Store);

  readonly addresses = this.store.selectSignal(AddressState.addresses);
  readonly loading = this.store.selectSignal(AddressState.isLoading);

  // ✅ Derived signal: currently selected (default) address ID
  readonly selectedAddressId = computed(() =>
    this.addresses().find(a => a.isDefault)?.id
  );

  constructor(private actions$: Actions) { }

  loadAddresses() {
    return this.store.dispatch(new LoadAddresses());
  }

  createAddress(payload: Address): Observable<boolean> {
    this.store.dispatch(new AddAddress(payload)); // just dispatch

    return this.actions$.pipe(
      ofActionCompleted(AddAddress),
      filter(result => result.result.successful),
      tap(() => this.loadAddresses()),
      take(1),
      map(() => true),
      catchError(() => of(false))
    );
  }

  updateAddress(id: number, payload: Address): Observable<any> {
    this.store.dispatch(new UpdateAddress(id, payload));

    return this.actions$.pipe(
      ofActionCompleted(UpdateAddress),
      filter((result: any) => result.result.successful),
      tap(() => this.loadAddresses()),
      take(1),
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteAddress(id: number) {
    this.store.dispatch(new DeleteAddress(id));

    return this.actions$.pipe(
      ofActionCompleted(DeleteAddress),
      filter((result: any) => result.result?.statusCode === 200),
      take(1),
      map(() => true),
      catchError(() => of(false))
    );
  }

  setDefault(id: number) {
    return this.store.dispatch(new SetDefaultAddress(id));
  }
}
