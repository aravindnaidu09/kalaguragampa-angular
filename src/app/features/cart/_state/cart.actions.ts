export class LoadCart {
  static readonly type = '[Cart] Load Cart';
}

export class ClearCart {
  static readonly type = '[Cart] Clear Cart';
}

export class AddToCart {
  static readonly type = '[Cart] Add To Cart';
  constructor(public productId: number, public quantity: number = 1) {}
}

export class UpdateCartItem {
  static readonly type = '[Cart] Update Cart Item';
  constructor(public id: string, public item: any) {}
}

export class RemoveCartItem {
  static readonly type = '[Cart] Remove Cart Item';
  constructor(public id: string) {}
}
