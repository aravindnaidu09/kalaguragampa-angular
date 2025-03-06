import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, Signal, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { Router } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';
import { CartWishlistService } from '../../../core/services/cart-wishlist.service';
import { MenuService } from '../../../core/services/menu.service';

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
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  wishlistCount: Signal<number> = signal(0);
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
    { label: 'Singapore', value: 'SN' },
    { label: 'UK', value: 'UK' },
    { label: 'USA', value: 'US' },
    { label: 'Singapore', value: 'sing' }
  ];

  // Close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
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

  constructor(private readonly router: Router,
    private elementRef: ElementRef,
    private readonly cartWishlistService: CartWishlistService,
    private readonly menuService: MenuService
  ) { }

  ngOnInit() {
    this.setMenuItems();

    this.wishlistCount = this.cartWishlistService.wishlistCount; // Signal for wishlist
    this.cartlistCount = this.cartWishlistService.cartCount; // Signal for cart
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
  }

  onSelectionChange(value: any): void {
    this.selectedCountry = value;
  }

  goToHomePage() {
    this.router.navigate(['/'])
  }

  goToCartPage() {
    if (!(this.cartlistCount() > 0)) {
      alert('Add products to your cart to view them.');
      return;
    }
    this.router.navigate(['/cart']);
  }

  goToWishlistPage() {
    if (!(this.wishlistCount() > 0)) {
      alert('Add products to your wishlist to view them.');
      return;
    }
    this.router.navigate(['/wishlist']);
  }
}
