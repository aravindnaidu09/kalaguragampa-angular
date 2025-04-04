import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartResponseItem, Item } from '../../_models/cart-item-model';
import { CartFacade } from '../../_state/cart.facade';
import { environment } from '../../../../../environments/environment.dev';
import { ProductService } from '../../../product/_services/product.service';
import { ICategory } from '../../../product/_models/category-model';
import { debounceTime, Subject } from 'rxjs';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cart-details',
  imports: [
    CommonModule
  ],
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss'],
})
export class CartDetailsComponent implements OnInit, OnDestroy {
  private cartFacade = inject(CartFacade);
  private productService = inject(ProductService);
  private dialogService = inject(ConfirmDialogService);

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
  categories: ICategory[] = [];

  private quantityChangeSubjectMap: { [key: number]: Subject<number> } = {};
  private loadingItems: Set<number> = new Set();

  constructor(private readonly router: Router) { }

  ngOnInit() {
    this.fetchCartList();
    this.fetchCategories();
  }

  fetchCartList() {
    this.cartFacade.loadCart();
  }

  fetchCategories() {
    this.productService.getCategories().subscribe((response: any) => {
      this.categories = response;
    })
  }

  getCategoryNameOfProduct(id: number) {
    const categoryName = this.categories.find(i => i.id === id)?.name;
    return categoryName;
  }

  removeItem(itemId: number): void {
    this.dialogService.confirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from the cart?',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        // this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.cartFacade.removeCartItem(itemId);
      }
    });
  }


  goToCheckoutPage() {
    this.router.navigate(['/checkout']);
  }

  updateQuantity(item: Item, type: 'increment' | 'decrement') {
    const currentQty = item.quantity ?? 1;
    const maxStock = item.product?.maxQuantity ?? 999;

    let updatedQty = currentQty;
    if (type === 'increment' && currentQty < maxStock) updatedQty++;
    else if (type === 'decrement' && currentQty > 1) updatedQty--;
    else return;

    this.debounceCartUpdate(item?.id!, updatedQty);
  }

  onManualQtyInput(item: Item, event: Event) {
    const input = Number((event.target as HTMLInputElement).value);
    const maxStock = item.product?.maxQuantity ?? 999;
    const clampedValue = Math.max(1, Math.min(input, maxStock));
    this.debounceCartUpdate(item?.id!, clampedValue);
  }

  debounceCartUpdate(id: number, quantity: number) {
    if (!this.quantityChangeSubjectMap[id]) {
      this.quantityChangeSubjectMap[id] = new Subject<number>();
      this.quantityChangeSubjectMap[id]
        .pipe(debounceTime(400))
        .subscribe((qty) => {
          this.loadingItems.add(id);
          const payload = [{ id, quantity }];
          this.cartFacade.updateCartItems(payload).subscribe({
            next: () => this.loadingItems.delete(id),
            error: () => this.loadingItems.delete(id)
          });
        });
    }

    this.quantityChangeSubjectMap[id].next(quantity);
  }

  isLoading(id: number): boolean {
    return this.loadingItems.has(id);
  }

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

  removeSelected() { }

  ngOnDestroy() {
    Object.values(this.quantityChangeSubjectMap).forEach((subject) => subject.complete());
  }
}
