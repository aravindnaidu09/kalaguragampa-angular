import { IWishlist } from '../../product/_models/wishlist-model';

export namespace WishlistActions {
  export class Fetch {
    static readonly type = '[Wishlist] Fetch';
  }

  export class Add {
    static readonly type = '[Wishlist] Add';
    constructor(public productId: number) {}
  }

  export class Update {
    static readonly type = '[Wishlist] Update';
    constructor(public payload: IWishlist) {}
  }

  export class Remove {
    static readonly type = '[Wishlist] Remove';
    constructor(public productId: number) {}
  }

  export class Clear {
    static readonly type = '[Wishlist] Clear';
  }
}
