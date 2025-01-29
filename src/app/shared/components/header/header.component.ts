import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
import { Router } from '@angular/router';
import { MenuDropdownComponent, MenuItem } from '../menu-dropdown/menu-dropdown.component';
import { DialogComponent } from '../dialog/dialog.component';
import { SelectDropdownComponent } from "../select-dropdown/select-dropdown.component";

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    MenuDropdownComponent,
    DialogComponent,
    SelectDropdownComponent
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  isMenuOpen = false; // Menu visibility state
  loginState = false; // Track login state
  menuItems: MenuItem[] = []; // Dynamic menu items

  selectedLanguage: any = 1;

  selectedCountry: string = 'IN';
  isDropdownOpen = false;

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
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.setMenuItems();
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
}
