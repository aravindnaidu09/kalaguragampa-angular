import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Address } from '../_model/address-model';
import { AddressService } from '../_services/address.service';
import { AddAddress, DeleteAddress, LoadAddresses, SetDefaultAddress, UpdateAddress } from './address.actions';
import { tap } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface AddressStateModel {
  addresses: Address[];
  loading: boolean;
}

@State<AddressStateModel>({
  name: 'address',
  defaults: {
    addresses: [],
    loading: false
  }
})
@Injectable()
export class AddressState {
  constructor(private addressService: AddressService) {}

  @Selector()
  static addresses(state: AddressStateModel) {
    return state.addresses;
  }

  @Selector()
  static isLoading(state: AddressStateModel) {
    return state.loading;
  }

  @Action(LoadAddresses)
  loadUserAddresses(ctx: StateContext<AddressStateModel>) {
    ctx.patchState({ loading: true });
    return this.addressService.getUserAddresses().pipe(
      tap((data: Address[]) => {
        ctx.patchState({ addresses: data, loading: false });
      })
    );
  }

  @Action(AddAddress)
  addAddress(ctx: StateContext<AddressStateModel>, action: AddAddress) {
    return this.addressService.addAddress(action.payload).pipe(
      tap((res: ApiResponse<Address>) => {
        const state = ctx.getState();
        ctx.patchState({
          addresses: [res.data, ...state.addresses]
        });
      })
    );
  }

  @Action(UpdateAddress)
  updateAddress(ctx: StateContext<AddressStateModel>, action: UpdateAddress) {
    console.log('Update Address Action:', action);
    return this.addressService.updateAddress(action.id, action.payload).pipe(
      tap((res: ApiResponse<Address>) => {
        const state = ctx.getState();
        const updatedList = state.addresses.map(a =>
          a.id === action.id ? res.data : a
        );
        ctx.patchState({ addresses: updatedList });
      })
    );
  }

  @Action(DeleteAddress)
  deleteAddress(ctx: StateContext<AddressStateModel>, action: DeleteAddress) {
    return this.addressService.deleteAddress(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({
          addresses: state.addresses.filter(a => a.id !== action.id)
        });
      })
    );
  }

  @Action(SetDefaultAddress)
  setDefaultAddress(ctx: StateContext<AddressStateModel>, action: SetDefaultAddress) {
    return this.addressService.setDefaultAddress(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        const updated = state.addresses.map(a => ({
          ...a,
          isDefault: a.id === action.id
        }));
        ctx.patchState({ addresses: updated });
      })
    );
  }
}
