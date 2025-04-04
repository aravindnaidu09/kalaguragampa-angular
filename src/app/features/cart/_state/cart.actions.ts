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

export class UpdateCartItems {
  static readonly type = '[Cart] Update Multiple Items';
  constructor(public items: { id: number; quantity: number }[]) {}
}

export class RemoveCartItem {
  static readonly type = '[Cart] Remove Cart Item';
  constructor(public id: number) {}
}
