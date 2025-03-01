import { Injectable, Signal, signal } from '@angular/core';
import { MenuItem } from '../../shared/components/menu-dropdown/menu-dropdown.component';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSignal = signal<MenuItem[]>([]);
  private loginDialogTrigger: ((method: 'otp' | 'password') => void) | null = null;

  constructor() {
    this.setDefaultMenu();
  }

  /**
   * Get menu items as Signal
   */
  get menuItems(): Signal<MenuItem[]> {
    return this.menuItemsSignal;
  }

  /**
   * Register login dialog trigger function in HeaderComponent
   */
  registerLoginDialogTrigger(triggerFn: (method: 'otp' | 'password') => void): void {
    this.loginDialogTrigger = triggerFn;
  }

  /**
   * Set default menu items (Before Login)
   */
  private setDefaultMenu(): void {
    this.menuItemsSignal.set([
      { label: 'Login with OTP', action: () => this.triggerAction('otp') },
      { label: 'Login with Password', action: () => this.triggerAction('password') },
      { label: 'Help', action: () => console.log('Help clicked') }
    ]);
  }

  /**
   * Set menu items after successful login
   */
  setLoggedInMenu(username: string): void {
    this.menuItemsSignal.set([
      { label: `👤 ${username}`, disabled: true },
      { label: 'Dashboard', action: () => console.log('Navigate to Dashboard') },
      { label: 'Profile', action: () => console.log('Navigate to Profile') },
      { label: 'Settings', action: () => console.log('Navigate to Settings') },
      { label: 'Logout', action: () => this.logout() }
    ]);

    console.log('Menu Items Updated:', this.menuItemsSignal());
  }

  /**
   * Handle login menu actions
   */
  private triggerAction(method: 'otp' | 'password'): void {
    if (this.loginDialogTrigger) {
      this.loginDialogTrigger(method); // ✅ Calls the registered function in HeaderComponent
    } else {
      console.warn('Login dialog trigger is not registered.');
    }
  }

  /**
   * Handle Logout
   */
  private logout(): void {
    console.log('Logging out...');
    this.setDefaultMenu();
  }
}
