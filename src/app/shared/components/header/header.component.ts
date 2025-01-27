import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { Router } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    MenuDropdownComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  isMenuOpen = false; // Menu visibility state
  loginState = false; // Track login state
  menuItems: MenuItem[] = []; // Dynamic menu items

  selectedLanguage: any = 1;

  selectedCountry: string = 'India';
  isDropdownOpen = false;

  isAccountDropdownOpen: boolean = false;

  dialogVisible: boolean = false;

  isLoginDialogVisible = false;


  countryOptions: any = [
    { id: 'in', name: 'India' },
    { id: 'aus', name: 'Australia' },
    { id: 'eur', name: 'Europe' },
    { id: 'sing', name: 'Singapore' },
    { id: 'uk', name: 'UK' },
    { id: 'us', name: 'USA' },
    { id: 'can', name: 'Canada' },
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
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.setMenuItems();
  }

  setMenuItems(): void {
    this.menuItems = [
      { label: 'Login with OTP', action: () => this.loginWithOtp() },
      { label: 'Login with Password', action: () => this.loginWithPassword() },
      { label: 'Help', action: () => console.log('Help clicked') },
    ];
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onMenuAction(item: MenuItem): void {
    console.log('Menu item selected:', item.label);
  }

  loginWithOtp(): void {
    console.log('Redirect to OTP Login');
    // Implement OTP login logic
  }

  loginWithPassword(): void {
    console.log('Redirect to Password Login');
    // Implement Password login logic
  }

  toggleLoginDialog() {
    this.isLoginDialogVisible = !this.isLoginDialogVisible;
  }

  closeLoginDialog() {
    this.isLoginDialogVisible = false;
  }
}
