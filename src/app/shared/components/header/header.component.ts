import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faShoppingCart, faUser,  } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  faSearch = faSearch;
  faUser = faUser;
  faShoppingCart = faShoppingCart
}
