import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfileComponent } from "../profile/profile.component";
import { OrderHistoryComponent } from "../order-history/order-history.component";
import { NotificationPreferencesComponent } from "../notification-preferences/notification-preferences.component";
import { PaymentsComponent } from "../payments/payments.component";
import { AddressManagementComponent } from "../address-management/address-management.component";
import { SecuritySettingsComponent } from "../security-settings/security-settings.component";

@Component({
  selector: 'app-user-settings',
  imports: [
    CommonModule,
    ProfileComponent,
    OrderHistoryComponent,
    NotificationPreferencesComponent,
    PaymentsComponent,
    AddressManagementComponent,
    SecuritySettingsComponent
],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss'
})
export class UserSettingsComponent {
  selectedTab: string = 'profile'; // ✅ Default Tab

  // ✅ Update Active Tab
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
