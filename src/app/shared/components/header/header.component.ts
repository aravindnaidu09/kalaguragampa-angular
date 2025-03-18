import { CommonModule } from '@angular/common';
import { Component, DoCheck, ElementRef, HostListener, OnInit, Signal, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { Router } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';
import { CartWishlistService } from '../../../features/cart/_services/cart-wishlist.service';
import { MenuService } from '../../../core/services/menu.service';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { SearchProducts, SearchState } from '../../../features/product/_state/search.state';
import { IProduct } from '../../../features/product/_models/product-model';
import { ProductService } from '../../../features/product/_services/product.service';
import { environment } from '../../../../environments/environment.dev';
import { ToastService } from '../../../core/services/toast.service';

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
    ProductService,
    CartWishlistService
  ]
})
export class HeaderComponent implements OnInit, DoCheck {

  private store = inject(Store);
  private cartWishlistService = inject(CartWishlistService);

  wishlistCount = 0;
  cartlistCount: Signal<number> = signal(0);

  isMenuOpen = false; // Menu visibility state
  loginState = false; // Track login state
  menuItems!: Signal<MenuItem[]>;

  selectedLanguage: any = 1;
  selectedCountry: string = 'IN';
  isDropdownOpen = false;

  selectedMenuItem: any;
  isAccountDropdownOpen: boolean = false;
  dialogVisible: boolean = false;
  isLoginDialogVisible = false;
  selectedLoginMethod: string = '';

  countryOptions = [
    { label: 'Australia', value: 'AUS' },
    { label: 'Canada', value: 'CAN' },
    { label: 'Europe', value: 'EUR' },
    { label: 'India', value: 'IN' },
    { label: 'UK', value: 'UK' },
    { label: 'USA', value: 'US' },
    { label: 'Singapore', value: 'sing' }
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
    private readonly toastService: ToastService
  ) {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(query => {
      if (query.length >= 2) {
        this.store.dispatch(new SearchProducts(query));
      }
    });
  }

  ngOnInit() {
    this.setMenuItems();
    this.cartWishlistService.fetchWishlistCount();

    // this.cartlistCount = this.cartWishlistService.cartCount; // Signal for cart
  }

  ngDoCheck() {
    this.cartWishlistService.wishlistCount$.subscribe(count => {
      console.log('checking-count: ', count);
      this.wishlistCount = count;
    });
  }

  // ✅ Handle user input changes
  onSearchChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    if (inputValue.length > 0) {
      this.showSuggestions.set(true); // ✅ Show suggestions when input has value
    } else {
      this.showSuggestions.set(false); // ✅ Hide suggestions when input is empty
    }

    this.searchQuery.set(inputValue);
    this.searchSubject.next(inputValue);
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
    this.router.navigate(['/product', product.id]);
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
  }

  /**
  * ✅ Refresh Menu After Login (Called after successful login)
  */
  refreshMenu(username: string): void {
    this.menuService.updateMenu(username);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onMenuAction(item: MenuItem): void {
    console.log('Menu item selected:', item.label, item.action);

    // if (item.action() === 'logout') {
    //   this.menuService.updateMenu('');
    //   this.store.dispatch(new SetToken('', ''));
    //   localStorage.removeItem('accessToken');
    //   localStorage.removeItem('refreshToken');
    //   localStorage.removeItem('userName');
    // }
  }

  openDialog(method: 'otp' | 'password'): void {
    this.selectedLoginMethod = method;
    this.isLoginDialogVisible = true;
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
    if (!(this.cartlistCount() > 0)) {
      this.toastService.showError('Add products to your cart to view them.');
      return;
    }
    this.router.navigate(['/cart']);
  }

  goToWishlistPage() {
    this.checkMenuDropdownIsOpen();
    if (!(this.wishlistCount > 0)) {
      this.toastService.showError('Add products to your wishlist to view them.');
      return;
    }
    this.router.navigate(['/wishlist']);
  }

  checkMenuDropdownIsOpen() {
    this.isMenuOpen = false;
  }
}
