import { Injectable, Signal, signal } from '@angular/core';
import { MenuItem } from '../../shared/components/menu-dropdown/menu-dropdown.component';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ClearCart } from '../../features/cart/_state/cart.state';
import { ClearWishlist } from '../../features/cart/_state/wishlist.state';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSignal = signal<MenuItem[]>([]);
  private loginDialogTrigger: ((method: 'otp' | 'password') => void) | null = null;

  constructor(private router: Router,
    private readonly store: Store
  ) {
    this.updateMenu(); // Initialize menu based on stored login state
  }

  /**
   * ✅ Get menu items as Signal
   */
  get menuItems(): Signal<MenuItem[]> {
    return this.menuItemsSignal;
  }

  /**
   * ✅ Register login dialog trigger function in HeaderComponent
   */
  registerLoginDialogTrigger(triggerFn: (method: 'otp' | 'password') => void): void {
    this.loginDialogTrigger = triggerFn;
  }

  /**
   * ✅ Dynamically update menu based on login state
   */
  updateMenu(username?: string): void {
    if (username) {
      // 🔹 Set menu for logged-in users
      this.menuItemsSignal.set([
        { label: `👤Hi, ${username}`, disabled: true },
        { label: 'Dashboard', action: () => console.log('Navigate to Dashboard') },
        { label: 'Profile', action: () => console.log('Navigate to Profile') },
        { label: 'Settings', action: () => this.router.navigate(['/settings']) },
        { label: 'Logout', action: () => this.logout() }
      ]);
    } else {
      // 🔹 Set default menu (Before login)
      this.menuItemsSignal.set([
        { label: 'Login with OTP', action: () => this.triggerAction('otp') },
        { label: 'Login with Password', action: () => this.triggerAction('password') },
        { label: 'Help', action: () => console.log('Help clicked') }
      ]);
    }

    console.log('🔄 Menu Items Updated:', this.menuItemsSignal());
  }

  /**
   * ✅ Call this method after login success
   */
  setLoggedInMenu(username: string): void {
    this.updateMenu(username);
  }

  /**
   * ✅ Handle login menu actions
   */
  private triggerAction(method: 'otp' | 'password'): void {
    if (this.loginDialogTrigger) {
      this.loginDialogTrigger(method); // Calls registered function in HeaderComponent
    } else {
      console.warn('⚠ Login dialog trigger is not registered.');
    }
  }

  /**
   * ✅ Handle Logout
   */
  private logout(): void {
    localStorage.clear();
    this.updateMenu(); // Reset menu to default
    this.clearCartAndWishlist();
  }

  clearCartAndWishlist(): void {
    // ✅ Clear Cart & Wishlist (reset badges)
    this.store.dispatch(new ClearCart());
    this.store.dispatch(new ClearWishlist());
  }
}
