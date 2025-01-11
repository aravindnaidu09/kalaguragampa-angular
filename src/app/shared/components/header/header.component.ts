import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faShoppingCart, faUser,  } from '@fortawesome/free-solid-svg-icons';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { LoginComponent } from "../../../features/auth/_components/login/login.component";
@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    SelectModule,
    MenuModule,
    DialogModule,
    LoginComponent
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  faSearch = faSearch;
  faUser = faUser;
  faShoppingCart = faShoppingCart;

  selectedLanguage: any = 1;

  selectedCountry: string = 'India';
  isDropdownOpen = false;

  isAccountDropdownOpen: boolean = false;
  menuItems: MenuItem[] = [];

  showLoginDialog: boolean = false;

  countryOptions: any = [
    { id: 'in', name: 'India' },
    { id: 'aus', name: 'Australia' },
    { id: 'eur', name: 'Europe' },
    { id: 'sing', name: 'Singapore' },
    { id: 'uk', name: 'UK' },
    { id: 'us', name: 'USA' },
    { id: 'can', name: 'Canada' },
  ];

  ngOnInit() {
    this.menuItems = [
      {label: 'Login/Signup', command: () => this.showLoginDialog = true}
    ];
  }

  onSelect(country: string) {
    this.selectedCountry = country;
    this.isDropdownOpen = false;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleAccountDropdown() {
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  showLogin() {

  }
}
