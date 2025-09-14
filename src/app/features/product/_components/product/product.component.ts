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
  effect,
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
import { slugify } from '../../../../core/utils/slugify.utils';
import { AppCurrencyPipe } from "../../../../core/pipes/app-currency.pipe";
import { MatIconModule } from '@angular/material/icon';

type Particle = { angle: string; dist: string; delay: number; hue: number };

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
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
  @ViewChild('wishIcon', { static: false }) wishIcon!: ElementRef<HTMLDivElement>;

  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  currencyService = inject(CurrencyService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  @Input() product!: IProduct;
  @Input() wishlistItems!: Signal<IWishlist[]>;
  @Input() isUpdatingWishlist = false;

  /** NEW: controlled by parent (per-item) */
  @Input() isUpdatingCart = false;


  @Output() wishlistToggle = new EventEmitter<number>();
  @Output() addToCartEvent = new EventEmitter<IProduct>();

  isWishlistUpdating = false;
  private prevWishlisted = false;

  showBurst = false;
  particles: Particle[] = [];

  constructor() {
    // Auto-burst when becomes wishlisted (and not updating)
    effect(() => {
      const now = this.isWishlistedSignal();
      if (now && !this.prevWishlisted) {
        this.triggerFirecracker();
      }
      this.prevWishlisted = now;
    });
  }

  /** Call this after successful wishlist add */
  triggerFirecracker(): void {
    const N = 16; // number of particles
    const particles: Particle[] = [];
    for (let i = 0; i < N; i++) {
      const base = (360 / N) * i;
      const angle = base + (Math.random() * 14 - 7); // ±7°
      const dist = 36 + Math.random() * 22; // 36–58px
      const delay = Math.random() * 40; // 0–40ms
      const hue = 18 + Math.floor(Math.random() * 24); // warm 18–42
      particles.push({
        angle: `${angle}deg`,
        dist: `${dist}px`,
        delay,
        hue,
      });
    }
    this.particles = particles;
    this.showBurst = true;

    // remove DOM after anim finishes so it doesn't stack
    window.setTimeout(() => {
      this.showBurst = false;
      this.particles = [];
    }, 650);
  }

  readonly isWishlistedSignal = computed(() =>
    this.wishlistItems()?.some(
      item => item.productDetails?.id === this.product.id
    )
  );

  onWishlistClick(): void {
    if (this.isWishlistUpdating) return;

    this.isWishlistUpdating = true;
    const wishlistId = this.getWishlistId();
    const emittedId = wishlistId || this.product.id!;
    this.wishlistToggle.emit(emittedId);

    setTimeout(() => {
      this.resetWishlistLoader();
      this.cdr.markForCheck();
    });
  }

  public resetWishlistLoader(): void {
    this.isWishlistUpdating = false;
    // this.cdr.markForCheck();
  }

  private getWishlistId(): number | undefined {
    const existedWishlistProduct = this.wishlistItems()
      ?.find(item => item.productDetails?.id === this.product.id);
    return existedWishlistProduct?.id;
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
    const slug = slugify(name);
    this.router.navigate([`product/${slug}/${id}`])
  }

  addToCart(product: IProduct) {
    if (!this.authService.isAuthenticated()) {
      this.toastService.showWarning('Please log in to add items to your cart!');
      return;
    }

    if (this.isUpdatingCart) return;
    this.addToCartEvent.emit(product);
  }
}
