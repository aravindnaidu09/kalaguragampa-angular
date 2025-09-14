import { CommonModule, Location } from '@angular/common';
import {
  Component, HostListener, Input, Signal, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { LoginComponent } from '../../../features/auth/_components/login/login.component';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';

import { Store } from '@ngxs/store';
import { debounceTime, distinctUntilChanged, Subject, take, filter } from 'rxjs';

import { SearchProducts, SearchState } from '../../../features/product/_state/search.state';
import { IProduct } from '../../../features/product/_models/product-model';
import { ProductService } from '../../../features/product/_services/product.service';
import { environment } from '../../../../environments/environment.dev';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistFacade } from '../../../features/cart/_state/wishlist.facade';
import { AuthService } from '../../../features/auth/_services/auth.service';
import { CartFacade } from '../../../features/cart/_state/cart.facade';
import { CurrencyService } from '../../../core/services/currency.service';
import { ICategory } from '../../../features/product/_models/category-model';
import { COUNTRY_OPTIONS } from '../../../core/constants/country-codes';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    MenuDropdownComponent,
    DialogComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',

  /** IMPORTANT:
   * Do NOT re-provide AuthService / Facades here — use root singletons.
   * Re-providing creates new instances and breaks login/cart state.
   */
  providers: [Location], // keep Location only (others are providedIn:'root')
})
export class HeaderComponent {
  private store = inject(Store);
  private wishlistFacade = inject(WishlistFacade);
  private authService = inject(AuthService);
  readonly cartFacade = inject(CartFacade);
  private router = inject(Router);
  private location = inject(Location);
  private menuService = inject(MenuService);
  private toastService = inject(ToastService);
  private currencyService = inject(CurrencyService);
  private productService = inject(ProductService);

  @Input() compact = false;

  cartlistCount: Signal<number> = signal<number>(0);
  wCount = computed(() => this.wishlistFacade.wishlistCount());

  isMenuOpen = false;
  loginState = false;
  menuItems!: Signal<MenuItem[]>;

  selectedLanguage: any = 1;
  selectedCountry: string = 'INR';
  isDropdownOpen = false;

  selectedMenuItem: any;
  isAccountDropdownOpen = false;
  dialogVisible = false;
  isLoginDialogVisible = false;
  selectedLoginMethod = '';

  isLoading = signal(false);
  fullPath = '';
  hashRoute = '';

  countryOptions = COUNTRY_OPTIONS;

  // categories
  categories = signal<ICategory[]>([]);
  categoryList: ICategory[] = [];
  showDesktopCategories = false;
  showMobileCategories = false;
  categorySearchText = '';

  // search
  searchQuery = signal<string>('');
  selectedIndex = signal<number>(-1);
  products$ = this.store.select(SearchState.products);
  showSuggestions = signal(false);
  totalCount$ = this.store.selectSignal(SearchState.totalCount);
  private searchSubject = new Subject<string>();

  constructor() {
    // debounce search input
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(query => {
        if (query.length >= 2) this.store.dispatch(new SearchProducts(query));
      });
  }

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!(event.target as HTMLElement).closest('app-header')) {
      this.isMenuOpen = false;
      this.showSuggestions.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.isMenuOpen = false;
    if (event.key === 'Enter' && !this.isMenuOpen) this.toggleMenu();
  }

  // ------------------- lifecycle -------------------

  ngOnInit() {
    this.preloadCategories();
    this.setMenuItems();
    this.fetchWishlistCount();
    this.getCurrentUrlPath();

    // Restore currency
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      this.selectedCountry = savedCurrency;
      this.currencyService.setCurrency(savedCurrency);
    }

    // 🔐 Fetch cart count AFTER auth is ready (root AuthService instance)
    this.fetchCartCount();
  }

  // ------------------- helpers -------------------

  private isAuthenticated(): boolean {
    // prefer service; fall back to token in storage
    try { return this.authService.isAuthenticated(); }
    catch { return !!localStorage.getItem('access_token'); }
  }

  getCurrentUrlPath() {
    this.fullPath = this.location.path();
    this.hashRoute = this.fullPath.startsWith('/') ? this.fullPath.substring(1) : this.fullPath;
  }

  fetchWishlistCount() {
    if (this.isAuthenticated()) this.wishlistFacade.fetch();
  }

  fetchCartCount() {
    if (!this.isAuthenticated()) return;

    // NGXS dispatches immediately; subscribe not required, but harmless
    // Use whichever method your CartFacade exposes:
    this.cartFacade.loadCart({ silent: true, captureError: false, ignoreAddress: true }).pipe(take(1)).subscribe() ??
      (this.cartFacade as any).load?.() ??
      (this.cartFacade as any).refresh?.();
  }

  checkMenuDropdownIsOpen(): void {
    this.isMenuOpen = false;
  }

  // ------------------- search -------------------

  onSearchChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    if (inputValue.length > 0) {
      this.isLoading.set(true);
      this.showSuggestions.set(true);
    } else {
      this.showSuggestions.set(false);
    }

    this.searchQuery.set(inputValue);
    this.searchSubject.next(inputValue);
    this.isLoading.set(false);

    if (this.showMobileCategories || this.showDesktopCategories) {
      this.showMobileCategories = false;
      this.showDesktopCategories = false;
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    let productList: IProduct[] = [];
    this.products$.pipe(take(1)).subscribe(products => (productList = products || []));
    if (!productList.length) return;

    switch (event.key) {
      case 'ArrowDown':
        this.selectedIndex.set((this.selectedIndex() + 1) % productList.length);
        this.scrollToSelectedItem();
        break;
      case 'ArrowUp':
        this.selectedIndex.set(this.selectedIndex() > 0 ? this.selectedIndex() - 1 : productList.length - 1);
        this.scrollToSelectedItem();
        break;
      case 'Enter':
        if (this.selectedIndex() !== -1) this.goToProductDetails(productList[this.selectedIndex()]);
        break;
    }
  }

  scrollToSelectedItem(): void {
    setTimeout(() => {
      const productElements = document.querySelectorAll('.product-info');
      const selectedElement = productElements[this.selectedIndex()] as HTMLElement;
      selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  goToProductDetails(product: IProduct): void {
    this.showSuggestions.set(false);
    this.router.navigate([`/product/${product.name}/${product.id}`]);
  }

  goToSearchResults(): void {
    this.router.navigate(['/search-results'], { queryParams: { query: this.searchQuery() } });
  }

  // ------------------- images -------------------

  getImagePath(imagePath?: string): string {
    if (!imagePath || imagePath.trim() === '' || imagePath === 'null' || imagePath === 'undefined') {
      return `${environment.apiBaseUrl}/media/KG_LOGO.png`;
    }
    return `${environment.apiBaseUrl}${imagePath}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  // ------------------- menu -------------------

  setMenuItems(): void {
    this.menuItems = computed(() => this.menuService.menuItems());

    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) this.refreshMenu(storedUserName);

    this.menuService.registerLoginDialogTrigger(this.openDialog.bind(this));
  }

  refreshMenu(username: string): void {
    this.menuService.updateMenu(username);
  }

  toggleMenu(): void {
    const userName = localStorage.getItem('userName');
    if (userName) this.refreshMenu(userName);
    this.isMenuOpen = !this.isMenuOpen;
  }

  onMenuAction(item: MenuItem): void {
    console.log('Menu item selected:', item.label, item.action);
  }

  openDialog(method: 'otp' | 'password'): void {
    this.selectedLoginMethod = method;
    this.isLoginDialogVisible = true;
  }

  refreshHeaderState(event: any) {
    if (event) {
      // add logic if needed
    }
  }

  toggleLoginDialog() {
    this.isLoginDialogVisible = !this.isLoginDialogVisible;
  }

  closeLoginDialog(event: any) {
    this.isLoginDialogVisible = !event;
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) this.menuService.updateMenu('');
  }

  // ------------------- currency -------------------

  onSelectionChange(value: any): void {
    this.selectedCountry = value;
  }

  onCurrencyChange(code: string) {
    localStorage.setItem('currency', code);
    this.currencyService.setCurrency(code);
  }

  getCountryLabel(code: string): string {
    return this.countryOptions.find(c => c.value === code)?.label || '';
  }

  // ------------------- categories -------------------

  preloadCategories(): void {
    this.productService.getCategories().pipe(take(1)).subscribe({
      next: (categories) => {
        this.categories.set(categories);     // ✅ set the signal
        this.categoryList = categories;
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  filteredCategories() {
    return this.categoryList.filter(cat =>
      cat.name.toLowerCase().includes(this.categorySearchText.toLowerCase())
    );
  }

  toggleDesktopCategories() {
    if (this.searchQuery()) {
      this.searchQuery.set('');
      this.showSuggestions.set(false);
    }
    this.showDesktopCategories = !this.showDesktopCategories;
  }

  toggleMobileCategories() {
    if (this.searchQuery()) {
      this.searchQuery.set('');
      this.showSuggestions.set(false);
    }
    this.showMobileCategories = !this.showMobileCategories;
  }

  onCategoryClick(cat: ICategory) {
    this.showDesktopCategories = false;
    if (this.showMobileCategories) this.showMobileCategories = false;

    this.router.navigate(['/detail-view'], { queryParams: { category_id: cat.id, page: 0 } });
  }

  // ------------------- navigation shortcuts -------------------

  goToHomePage() {
    this.router.navigate(['/']);
  }

  goToCartPage() {
    this.isMenuOpen = false;
    if (!(this.cartFacade.countSignal() > 0)) {
      this.toastService.showWarning('Add products to your cart to view them.');
      return;
    }
    this.router.navigate(['/cart']);
  }

  goToWishlistPage() {
    this.isMenuOpen = false;
    if (!(this.wCount() > 0)) {
      this.toastService.showWarning('Add products to your wishlist to view them.');
      return;
    }
    this.router.navigate(['/wishlist']);
  }
}
