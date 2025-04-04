import { Address } from '../_model/address-model';

export class LoadAddresses {
  static readonly type = '[Address] Load All';
}

export class AddAddress {
  static readonly type = '[Address] Add';
  constructor(public payload: Address) {}
}

export class UpdateAddress {
  static readonly type = '[Address] Update';
  constructor(public id: number, public payload: Address) {}
}

export class DeleteAddress {
  static readonly type = '[Address] Delete';
  constructor(public id: number) {}
}

export class SetDefaultAddress {
  static readonly type = '[Address] Set Default';
  constructor(public id: number) {}
}
