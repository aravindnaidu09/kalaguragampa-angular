import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, HostListener, Input, OnChanges, OnInit, Signal, SimpleChanges, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';
import { MenuService } from '../../../core/services/menu.service';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
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

  countryOptions = [
    { label: 'Australia', value: 'AUD' },
    { label: 'Canada', value: 'CAD' },
    { label: 'Europe', value: 'EUR' },
    { label: 'India', value: 'INR' },
    { label: 'UK', value: 'GBP' },
    { label: 'USA', value: 'USD' },
    { label: 'Singapore', value: 'SGD' }
  ];

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
  ) {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(query => {
      if (query.length >= 2) {
        this.store.dispatch(new SearchProducts(query));
      }
    });

  }

  ngOnInit() {
    this.setMenuItems();
    this.fetchWishlistCount();
    this.fetchCartCount();

    this.getCurrentUrlPath();

    console.log('Current Route:', this.hashRoute); // 'checkout'

    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      this.selectedCountry = savedCurrency;
      this.currencyService.setCurrency(savedCurrency);
    }
  }

  getCurrentUrlPath() {
    this.fullPath = this.location.path(); // returns '/checkout'
    this.hashRoute = this.fullPath.startsWith('/') ? this.fullPath.substring(1) : this.fullPath;

  }

  fetchWishlistCount() {
    if (this.authService.isAuthenticated()) {
      this.wishlistFacade.fetch();
    }
  }

  fetchCartCount() {
    if (this.authService.isAuthenticated()) {
      this.cartFacade.loadCart();
    }
  }

  // ✅ Handle user input changes
  onSearchChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    if (inputValue.length > 0) {
      this.isLoading.set(true); // show loader
      this.showSuggestions.set(true); // ✅ Show suggestions when input has value
    } else {
      this.showSuggestions.set(false); // ✅ Hide suggestions when input is empty
    }

    this.searchQuery.set(inputValue);
    this.searchSubject.next(inputValue);
    this.isLoading.set(false);
  }

  // ✅ Keyboard Navigation with Scrolling
  onSearchKeyDown(event: KeyboardEvent): void {
    let productList: any[] = [];

    this.products$.subscribe((products) => {
      productList = products; // ✅ Assign products to a local variable
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

  // ✅ Scroll the selected item into view
  scrollToSelectedItem(): void {
    setTimeout(() => {
      const productElements = document.querySelectorAll('.product-info');
      const selectedElement = productElements[this.selectedIndex()] as HTMLElement;

      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  // ✅ Navigate to product details
  goToProductDetails(product: IProduct): void {
    this.showSuggestions.set(false);
    this.router.navigate([`/product/${product.name}/${product.id}`]);
  }

  // ✅ Navigate to search results page
  goToSearchResults(): void {
    this.router.navigate(['/search-results'], { queryParams: { query: this.searchQuery() } });
  }

  getImagePath(imagePath?: string): string {
    if (!imagePath || imagePath.trim() === '' || imagePath === 'null' || imagePath === 'undefined') {
      return `${environment.apiBaseUrl}/media/KG_LOGO.png`;
    }
    return `${environment.apiBaseUrl}${imagePath}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = `${environment.apiBaseUrl}/media/KG_LOGO.png`;
  }

  setMenuItems(): void {
    this.menuItems = computed(() => this.menuService.menuItems());

    // ✅ Fetch stored username (if user refreshes)
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.refreshMenu(storedUserName);
    }

    this.menuService.registerLoginDialogTrigger(this.openDialog.bind(this));

    // this.menuService.
  }

  /**
  * ✅ Refresh Menu After Login (Called after successful login)
  */
  refreshMenu(username: string): void {
    this.menuService.updateMenu(username);
  }

  toggleMenu(): void {
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.refreshMenu(userName);
    }
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
      // this.get
    }
  }

  toggleLoginDialog() {
    this.isLoginDialogVisible = !this.isLoginDialogVisible;
  }

  closeLoginDialog(event: any) {
    this.isLoginDialogVisible = !event;
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.menuService.updateMenu('');
    }
  }

  onSelectionChange(value: any): void {
    this.selectedCountry = value;
  }

  goToHomePage() {
    this.router.navigate(['/'])
  }

  goToCartPage() {
    this.checkMenuDropdownIsOpen();
    if (!(this.cartFacade.countSignal() > 0)) {
      this.toastService.showWarning('Add products to your cart to view them.');
      return;
    }
    this.router.navigate(['/cart']);
  }

  goToWishlistPage() {
    this.checkMenuDropdownIsOpen();
    if (!(this.wCount() > 0)) {
      this.toastService.showWarning('Add products to your wishlist to view them.');
      return;
    }
    this.router.navigate(['/wishlist']);
  }

  checkMenuDropdownIsOpen() {
    this.isMenuOpen = false;
  }

  onCurrencyChange(code: string) {
    localStorage.setItem('currency', code);
    this.currencyService.setCurrency(code);
  }
}
