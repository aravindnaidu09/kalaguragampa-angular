import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, HostListener, Input, OnChanges, OnInit, Signal, SimpleChanges, ViewChild, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';
import { MenuService } from '../../../core/services/menu.service';
import { debounceTime, distinctUntilChanged, Observable, Subject, take } from 'rxjs';
import { Store } from '@ngxs/store';
import { SearchProducts, SearchState } from '../../../features/product/_state/search.state';
import { IProduct } from '../../../features/product/_models/product-model';
import { ProductService } from '../../../features/product/_services/product.service';
import { environment } from '../../../../environments/environment.dev';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistState } from '../../../features/cart/_state/wishlist.state';
import { WishlistFacade } from '../../../features/cart/_state/wishlist.facade';
import { AuthService } from '../../../features/auth/_services/auth.service';
import { CartFacade } from '../../../features/cart/_state/cart.facade';
import { CurrencyService } from '../../../core/services/currency.service';
import { ICategory } from '../../../features/product/_models/category-model';
import { ProductListComponent } from '../../../features/product/_components/product-list/product-list.component';
import { COUNTRY_OPTIONS } from '../../../core/constants/country-codes';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    MenuDropdownComponent,
    DialogComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [
    AuthService,
    ToastService,
    MenuService,
    ProductService,
    WishlistFacade,
    CartFacade,
    Location
  ],
})
export class HeaderComponent implements OnInit {

  private store = inject(Store);
  private wishlistFacade = inject(WishlistFacade);

  @Input() compact = false;

  cartlistCount: Signal<number> = signal<number>(0);
  wCount = computed(() => this.wishlistFacade.wishlistCount());

  isMenuOpen = false; // Menu visibility state
  loginState = false; // Track login state
  menuItems!: Signal<MenuItem[]>;

  selectedLanguage: any = 1;
  selectedCountry: string = 'INR';
  isDropdownOpen = false;

  selectedMenuItem: any;
  isAccountDropdownOpen: boolean = false;
  dialogVisible: boolean = false;
  isLoginDialogVisible = false;
  selectedLoginMethod: string = '';

  isLoading = signal(false);
  fullPath: string = '';
  hashRoute: string = '';

  countryOptions = COUNTRY_OPTIONS;
  categoryProducts: any;
  categories = signal<ICategory[]>([]);
  CategorySelection$ = new Subject<number>();
  categoryList: ICategory[] = [];
  showDesktopCategories = false;
  showMobileCategories = false;
  categorySearchText = '';

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
      this.showSuggestions.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isMenuOpen = false;
    }
    if (event.key === 'Enter' && !this.isMenuOpen) {
      this.toggleMenu();
    }
  }

  // ✅ Signals for state management
  searchQuery = signal<string>('');
  selectedIndex = signal<number>(-1);
  products$: Observable<IProduct[]> = this.store.select(SearchState.products);
  showSuggestions = signal(false); // ✅ Controls visibility of suggestions

  totalCount$ = this.store.selectSignal(SearchState.totalCount);


  // ✅ Debounce user input
  private searchSubject = new Subject<string>();

  constructor(private readonly router: Router,
    private elementRef: ElementRef,
    private readonly menuService: MenuService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    readonly cartFacade: CartFacade,
    private location: Location,
    private readonly currencyService: CurrencyService,
    private readonly productService: ProductService
  ) {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(query => {
      if (query.length >= 2) {
        this.store.dispatch(new SearchProducts(query));
      }
    });

  }

  ngOnInit() {
    this.preloadCategories();        // Fetch all categories at component init
    this.setMenuItems();             // Initialize user menu based on login state
    this.fetchWishlistCount();       // Load wishlist count if authenticated
    this.fetchCartCount();           // Load cart count if authenticated
    this.getCurrentUrlPath();        // Extract current route path (e.g., 'checkout')

    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      this.selectedCountry = savedCurrency;
      this.currencyService.setCurrency(savedCurrency);  // Restore saved currency
    }
  }

  /**
   * Extracts current route path from browser and sets `hashRoute`.
   */
  getCurrentUrlPath() {
    this.fullPath = this.location.path();
    this.hashRoute = this.fullPath.startsWith('/') ? this.fullPath.substring(1) : this.fullPath;
  }

  /**
   * Fetch wishlist count if user is authenticated.
   */
  fetchWishlistCount() {
    if (this.authService.isAuthenticated()) {
      this.wishlistFacade.fetch();
    }
  }

  /**
   * Fetch cart count if user is authenticated.
   */
  fetchCartCount() {
    if (this.authService.isAuthenticated()) {
      this.cartFacade.loadCart();
    }
  }

  /**
   * Called on search input change. Updates suggestions & triggers debounced search.
   */
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

  /**
   * Handles keyboard navigation (ArrowUp, ArrowDown, Enter) on search suggestions.
   */
  onSearchKeyDown(event: KeyboardEvent): void {
    let productList: any[] = [];

    this.products$.subscribe((products) => {
      productList = products;
    });

    if (!productList || productList.length === 0) return;

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
        if (this.selectedIndex() !== -1) {
          this.goToProductDetails(productList[this.selectedIndex()]);
        }
        break;
    }
  }

  /**
   * Scrolls the currently highlighted search suggestion into view.
   */
  scrollToSelectedItem(): void {
    setTimeout(() => {
      const productElements = document.querySelectorAll('.product-info');
      const selectedElement = productElements[this.selectedIndex()] as HTMLElement;

      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  /**
   * Navigate to selected product detail page.
   */
  goToProductDetails(product: IProduct): void {
    this.showSuggestions.set(false);
    this.router.navigate([`/product/${product.name}/${product.id}`]);
  }

  /**
   * Navigates to global search results page with search query as parameter.
   */
  goToSearchResults(): void {
    this.router.navigate(['/search-results'], { queryParams: { query: this.searchQuery() } });
  }

  /**
   * Returns safe image path for product thumbnail (fallback to default).
   */
  getImagePath(imagePath?: string): string {
    if (!imagePath || imagePath.trim() === '' || imagePath === 'null' || imagePath === 'undefined') {
      return `${environment.apiBaseUrl}/media/KG_LOGO.png`;
    }
    return `${environment.apiBaseUrl}${imagePath}`;
  }

  /**
   * Handles image loading error by replacing with fallback image.
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  /**
   * Initializes menu items based on user login state and registers login trigger.
   */
  setMenuItems(): void {
    this.menuItems = computed(() => this.menuService.menuItems());

    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.refreshMenu(storedUserName);
    }

    this.menuService.registerLoginDialogTrigger(this.openDialog.bind(this));
  }

  /**
   * Refreshes the menu with latest items after login.
   */
  refreshMenu(username: string): void {
    this.menuService.updateMenu(username);
  }

  /**
   * Toggle the account dropdown menu visibility.
   */
  toggleMenu(): void {
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.refreshMenu(userName);
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Logs selected menu item action.
   */
  onMenuAction(item: MenuItem): void {
    console.log('Menu item selected:', item.label, item.action);
  }

  /**
   * Opens login dialog with selected method (OTP or password).
   */
  openDialog(method: 'otp' | 'password'): void {
    this.selectedLoginMethod = method;
    this.isLoginDialogVisible = true;
  }

  /**
   * Refresh state after login success.
   */
  refreshHeaderState(event: any) {
    if (event) {
      // Placeholder: add logic if needed
    }
  }

  /**
   * Toggles visibility of login dialog.
   */
  toggleLoginDialog() {
    this.isLoginDialogVisible = !this.isLoginDialogVisible;
  }

  /**
   * Handles closing of login dialog and resets user menu.
   */
  closeLoginDialog(event: any) {
    this.isLoginDialogVisible = !event;
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.menuService.updateMenu('');
    }
  }

  /**
   * Updates selected country value from dropdown.
   */
  onSelectionChange(value: any): void {
    this.selectedCountry = value;
  }

  /**
   * Navigates to home page.
   */
  goToHomePage() {
    this.router.navigate(['/']);
  }

  /**
   * Navigates to cart page or shows warning if cart is empty.
   */
  goToCartPage() {
    this.checkMenuDropdownIsOpen();
    if (!(this.cartFacade.countSignal() > 0)) {
      this.toastService.showWarning('Add products to your cart to view them.');
      return;
    }
    this.router.navigate(['/cart']);
  }

  /**
   * Toggles the desktop category dropdown visibility.
   */
  toggleDesktopCategories() {
    if (this.searchQuery()) {
      this.searchQuery.set('');
      this.showSuggestions.set(false);
    }
    this.showDesktopCategories = !this.showDesktopCategories;
  }

  /**
   * Toggles the mobile category dropdown visibility.
   */
  toggleMobileCategories() {
    if (this.searchQuery()) {
      this.searchQuery.set('');
      this.showSuggestions.set(false);
    }
    this.showMobileCategories = !this.showMobileCategories;
  }

  /**
   * Returns list of categories filtered by user search input.
   */
  filteredCategories() {
    return this.categoryList.filter(cat =>
      cat.name.toLowerCase().includes(this.categorySearchText.toLowerCase())
    );
  }

  /**
   * Loads category list from backend and sets it in signal and local list.
   */
  preloadCategories(): void {
    this.productService.getCategories().pipe(take(1)).subscribe({
      next: (categories) => {
        this.categories = this.categoryList = categories;
        this.isLoading.set(false);
        this.filteredCategories();
      },
      error: () => this.isLoading.set(false),
    });
  }

  /**
   * Navigates to product listing by selected category.
   */
  onCategoryClick(cat: any) {
    this.showDesktopCategories = false;
    if (this.showMobileCategories) {
      this.showMobileCategories = false;
    }

    this.router.navigate([`/detail-view`], { queryParams: { category_id: cat.id, page: 0 } });
  }

  /**
   * Document click handler: closes dropdowns if clicked outside.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('.desktop-category-dropdown')) {
      this.showDesktopCategories = false;
    }
  }

  /**
   * Navigates to wishlist page or shows warning if empty.
   */
  goToWishlistPage() {
    this.checkMenuDropdownIsOpen();
    if (!(this.wCount() > 0)) {
      this.toastService.showWarning('Add products to your wishlist to view them.');
      return;
    }
    this.router.navigate(['/wishlist']);
  }

  /**
   * Closes account menu dropdown.
   */
  checkMenuDropdownIsOpen() {
    this.isMenuOpen = false;
  }

  /**
   * Returns country label based on its currency code.
   */
  getCountryLabel(code: string): string {
    return this.countryOptions.find(c => c.value === code)?.label || '';
  }

  /**
   * Updates selected currency in localStorage and CurrencyService.
   */
  onCurrencyChange(code: string) {
    localStorage.setItem('currency', code);
    this.currencyService.setCurrency(code);
  }
}
