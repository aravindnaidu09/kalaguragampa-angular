import { Component, signal } from '@angular/core';
import { IProduct } from '../../../product/_models/product-model';
import { CartService } from '../../_services/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../product/_services/product.service';
import { FormsModule } from '@angular/forms';
import { IWishlist } from '../../../product/_models/wishlist-model';

@Component({
  selector: 'app-wishlist',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  // ✅ Tabs
  activeTab = signal<'favorites' | 'collections' | 'feed'>('favorites');

  // ✅ Products in Wishlist
  wishlistItems = signal<IWishlist[]>([]);
  gridView = signal<boolean>(true); // ✅ Toggle for Grid/List View

  // ✅ Sorting
  sortOptions = ['Date', 'Price', 'Popularity'];
  selectedSort = signal<string>('Date');
  ascendingOrder = signal<boolean>(true);

  constructor(
    private readonly wishlistService: ProductService,
    private readonly cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadWishlist();
  }

  // ✅ Load Wishlist Items
  loadWishlist(): void {
    this.wishlistService.getWishlist().subscribe((products: IWishlist[]) => {
      this.wishlistItems.set(products);
      console.log(products);
    });
  }

  // ✅ Add All Items to Cart
  addAllToCart(): void {
    // this.wishlistItems().forEach(product => this.cartService.addToCart(product));
  }

  // ✅ Toggle View
  toggleView(): void {
    this.gridView.set(!this.gridView());
  }

  // ✅ Remove from Wishlist
  removeFromWishlist(productId: any): void {
    this.wishlistService.removeFromWishlist(productId);
    this.loadWishlist();
  }

  // ✅ Add to Cart
  addToCart(product: IWishlist): void {
    // this.cartService.addToCart(product);
  }

  // ✅ Change Sorting Order
  changeSorting(sortType: string): void {
    this.selectedSort.set(sortType);
    this.ascendingOrder.set(!this.ascendingOrder());
  }
}
