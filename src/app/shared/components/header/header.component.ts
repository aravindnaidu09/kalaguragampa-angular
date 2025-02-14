import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, Signal, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { Router } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';
import { CartWishlistService } from '../../../core/services/cart-wishlist.service';

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
  menuItems: MenuItem[] = []; // Dynamic menu items

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
    private readonly cartWishlistService: CartWishlistService
  ) { }

  ngOnInit() {
    this.setMenuItems();

    this.wishlistCount = this.cartWishlistService.wishlistCount; // Signal for wishlist
    this.cartlistCount = this.cartWishlistService.cartCount; // Signal for cart
  }

  setMenuItems(): void {
    this.menuItems = [
      { label: 'Login with OTP', action: () => this.openDialog('otp') },
      { label: 'Login with Password', action: () => this.openDialog('password') },
      { label: 'Help', action: () => console.log('Help clicked') },
    ];
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onMenuAction(item: MenuItem): void {
    console.log('Menu item selected:', item.label);
  }

  openDialog(method: 'otp' | 'password'): void {
    this.selectedLoginMethod = method;
    this.isLoginDialogVisible = true;
  }

  toggleLoginDialog() {
    this.isLoginDialogVisible = !this.isLoginDialogVisible;
  }

  closeLoginDialog() {
    this.isLoginDialogVisible = false;
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
}
