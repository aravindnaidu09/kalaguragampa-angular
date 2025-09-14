import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartResponseItem, Item } from '../../_models/cart-item-model';
import { CartFacade } from '../../_state/cart.facade';
import { environment } from '../../../../../environments/environment.dev';
import { ProductService } from '../../../product/_services/product.service';
import { ICategory } from '../../../product/_models/category-model';
import { debounceTime, Subject } from 'rxjs';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { PriceSummaryComponent } from '../price-summary/price-summary.component';
import { IProduct } from '../../../product/_models/product-model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { EstimateDeliveryDialogComponent } from '../estimate-delivery-dialog/estimate-delivery-dialog.component';
import { AddressFacade } from '../../../settings/_state/address.facade';
import { Address } from '../../../settings/_model/address-model';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbFacade } from '../../../../core/state/breadcrumb.facade';
import { AppCurrencyPipe } from "../../../../core/pipes/app-currency.pipe";
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-cart-details',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PriceSummaryComponent,
    BreadcrumbComponent,
    AppCurrencyPipe
  ],
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss'],
})
export class CartDetailsComponent implements OnInit, OnDestroy {
  private cartFacade = inject(CartFacade);
  private productService = inject(ProductService);
  private addressFacade = inject(AddressFacade);
  private dialogService = inject(ConfirmDialogService);
  currencyService = inject(CurrencyService);


  @Input() showCartTitle: boolean = true;
  @Input() showPriceSummaryBlock: boolean = true; // Flag to show/hide the button

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

  @Input() showNavigationButtons: boolean = false;

  @Output() continue = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  pincode: string = '';
  country: string = 'India';
  state: string = '';
  city: string = '';
  countries = ['India', 'USA', 'Australia', 'UK', 'Canada', 'Singapore', 'Europe'];

  defaultAddress: Address = {};

  isCartLoading = true;
  deletingItemIds = new Set<number>();
  isDeletingAll = false;

  private quantityChangeSubjectMap: { [key: number]: Subject<number> } = {};
  private loadingItems: Set<number> = new Set();

  currencyCode = this.currencyService.currency; // signal<string>
  isINR = computed(() => (this.currencyService.currency() ?? 'INR').toUpperCase() === 'INR');

  constructor(private readonly router: Router,
    private readonly toastService: ToastService,
    private dialog: MatDialog,
    private breadcrumbFacade: BreadcrumbFacade
  ) { }

  ngOnInit() {
    this.fetchCartList();
    this.fetchCategories();

    this.breadcrumbFacade.setBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Cart', url: '/cart' }
    ]);
  }

  fetchCartList() {
    this.isCartLoading = true;
    this.cartFacade.loadCart({ silent: true, captureError: true }).subscribe({
      next: () => {
        this.isCartLoading = false
        if (this.cartItemsSignal()?.length > 0) {
          this.loadAddressAndEstimateShipping();
        }
      },
      error: () => this.isCartLoading = false
    });
  }

  private loadAddressAndEstimateShipping(): void {
    this.addressFacade.loadAddresses().subscribe(() => {
      const all = this.addressFacade.addresses();
      this.defaultAddress = all.find(a => a.isDefault)! ?? null;
      this.onEstimateShipping();
    });
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
      if (!confirmed) return;
      this.deletingItemIds.add(itemId);
      this.cartFacade.removeCartItems([itemId]).subscribe({
        next: () => this.deletingItemIds.delete(itemId),
        error: () => this.deletingItemIds.delete(itemId)
      });;
    });
  }

  deleteAllItems() {
    this.dialogService.confirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from the cart?',
      confirmText: 'Remove',
      cancelText: 'Cancel'
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isDeletingAll = true;
        this.cartFacade.removeCartItems([]).subscribe({
          next: () => this.isDeletingAll = false,
          error: () => this.isDeletingAll = false
        });
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
        .pipe(debounceTime(300))
        .subscribe((qty) => {
          this.loadingItems.add(id);
          const payload = [{ id, quantity: qty }];
          this.cartFacade.updateCartItems(payload).subscribe({
            next: () => this.loadingItems.delete(id),
            error: () => this.loadingItems.delete(id)
          });
        });
    }

    this.quantityChangeSubjectMap[id].next(quantity); // ✅ triggers latest qty
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

  navigateToProductPage(pItem: IProduct) {
    this.router.navigate([`/product/${pItem.name}/${pItem.id}`]);

  }

  onEstimateShipping(): void {
    const payload = this.getShippingEstimatePayload();

    if (!payload) {
      this.toastService.showError('Please select an address or fill in all required fields');
      return;
    }

    this.cartFacade.loadShippingEstimate(payload);
  }

  private getShippingEstimatePayload():
    | { address_id: string }
    | { pincode: string; city: string; state: string; country: string }
    | null {

    if (this.defaultAddress.id) {
      return { address_id: this.defaultAddress.id.toString() };
    }

    if (this.pincode && this.city && this.state && this.country) {
      return {
        pincode: this.pincode,
        city: this.city,
        state: this.state,
        country: this.country
      };
    }

    return null;
  }

  openEstimateDialog() {
    this.dialog.open(EstimateDeliveryDialogComponent, {
      width: '500px'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.cartFacade.loadShippingEstimate(result);

        // If user selected a saved address, update UI
        if (result.address_id) {
          const all = this.addressFacade.addresses();
          this.defaultAddress = all.find(a => a.id === result.address_id)!;
        }
      }
    });
  }

  onContinue() {
    this.continue.emit();
  }

  onBack() {
    this.back.emit();
  }

  ngOnDestroy() {
    Object.values(this.quantityChangeSubjectMap).forEach((subject) => subject.complete());
  }
}
