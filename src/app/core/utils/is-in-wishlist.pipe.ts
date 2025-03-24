import { Pipe, PipeTransform } from '@angular/core';
import { WishlistFacade } from '../../features/cart/_state/wishlist.facade';

@Pipe({ name: 'isInWishlist', standalone: true, pure: false })
export class IsInWishlistPipe implements PipeTransform {
  constructor(private readonly wishlistFacade: WishlistFacade) {}

  transform(productId: number): boolean {
    return this.wishlistFacade.isInWishlist(productId);
  }
}
