import { Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
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
  @Select(AddressState.addresses) addresses$!: Observable<Address[]>;
  @Select(AddressState.isLoading) loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  loadAddresses() {
    return this.store.dispatch(new LoadAddresses());
  }

  createAddress(payload: Address) {
    return this.store.dispatch(new AddAddress(payload));
  }

  updateAddress(id: number, payload: Address) {
    return this.store.dispatch(new UpdateAddress(id, payload));
  }

  deleteAddress(id: number) {
    return this.store.dispatch(new DeleteAddress(id));
  }

  setDefault(id: number) {
    return this.store.dispatch(new SetDefaultAddress(id));
  }
}
