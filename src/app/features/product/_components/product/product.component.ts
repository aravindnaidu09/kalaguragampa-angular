import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  OnChanges,
  signal,
  computed,
} from '@angular/core';
import { IProduct } from '../../_models/product-model';
import { WishlistStore } from '../../_services/wishliststore';
import { environment } from '../../../../../environments/environment.dev';
import { CartService } from '../../../cart/_services/cart.service';
import { AuthService } from '../../../auth/_services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Signal } from '@angular/core';
import { IWishlist } from '../../_models/wishlist-model';
import { Router } from '@angular/router';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
  providers: [
    WishlistStore,
    AuthService,
    CartService,
    ToastService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  currencyService = inject(CurrencyService);

  @Input() product!: IProduct;
  @Input() wishlistItems!: Signal<IWishlist[]>;

  @Output() wishlistToggle = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<number>();

  readonly isWishlistedSignal = computed(() =>
    this.wishlistItems()?.some(
      item => item.productDetails?.id === this.product.id
    )
  );


  onWishlistClick(): void {
    this.wishlistToggle.emit(this.product.id!);
    this.cdr.markForCheck();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  getImagePath(imagePath?: string): string {
    return imagePath?.trim()
      ? `${environment.apiBaseUrl}${imagePath}`
      : `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  navigateViewProduct(name: string, id: number) {
    this.router.navigate([`product/${name}/${id}`])
  }
}
