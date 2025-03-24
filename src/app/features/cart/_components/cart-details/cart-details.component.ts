import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartResponseItem, Item } from '../../_models/cart-item-model';
import { CartFacade } from '../../_state/cart.facade';
import { environment } from '../../../../../environments/environment.dev';

@Component({
  selector: 'app-cart-details',
  imports: [
    CommonModule
  ],
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss'],
})
export class CartDetailsComponent implements OnInit {
  private cartFacade = inject(CartFacade);

  cartItems: CartResponseItem[] = [];
  cartItemsSignal = computed<Item[]>(() => {
    const cart = this.cartFacade.cartSignal();
    return cart?.items ?? [];
  });
  readonly cartSignal = this.cartFacade.cartSignal;
  readonly estimatedSavingsSignal = computed(() => {
    const discount = Number(this.cartSignal()?.discountAmount ?? 0);
    return discount;
  });


  subtotal = 0
  discount = 0;
  grandTotal = 0;

  constructor(private readonly router: Router) { }

  ngOnInit() {
    this.fetchCartList();
  }

  fetchCartList() {
    this.cartFacade.loadCart();

  }

  removeItem(itemId: string) {
    this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
  }

  goToCheckoutPage() {
    this.router.navigate(['/checkout']);
  }

  updateQuantity(item: any, incrementDecrement: string) { }

  goToProductPage(name: string, id: number) {
    this.router.navigate([`/product/${name}/${id}`]);
  }

  /** ✅ Lazy Loading Image Handler */
  getImagePath(imagePath?: string): string {
    return imagePath && imagePath.trim() ? `${environment.apiBaseUrl}${imagePath}` : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  /** ✅ Handle Image Error */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }
}
