import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProfileComponent } from "../profile/profile.component";
import { OrderHistoryComponent } from "../order-history/order-history.component";
import { NotificationPreferencesComponent } from "../notification-preferences/notification-preferences.component";
import { PaymentsComponent } from "../payments/payments.component";
import { AddressManagementComponent } from "../address-management/address-management.component";
import { SecuritySettingsComponent } from "../security-settings/security-settings.component";
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { ProfileFacade } from '../../_state/profile.facade';
import { AddressFormComponent } from "../../../checkout/_components/address-form/address-form.component";
import { ChangePasswordComponent } from "../../../auth/_components/change-password/change-password.component";

@Component({
  selector: 'app-user-settings',
  imports: [
    CommonModule,
    RouterModule,
    ProfileComponent,
    AddressFormComponent,
    AddressManagementComponent,
    OrderHistoryComponent,
    ChangePasswordComponent,
    NotificationPreferencesComponent
],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
  animations: [
    trigger('routeAnimation', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
          })
        ], { optional: true }),

        group([
          query(':leave', [
            animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-15px)' }))
          ], { optional: true }),

          query(':enter', [
            style({ opacity: 0, transform: 'translateX(15px)' }),
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class UserSettingsComponent implements OnInit {
  selectedSection: string|null = null; // ✅ Sidebar State
  hover: boolean = false;
  private userFacade = inject(ProfileFacade)
  private router = inject(Router);
  selectedTab: string = 'profile'; // ✅ Default Tab
  user = this.userFacade.userSignal;

  ngOnInit(): void {
    this.userFacade.loadUser(); // Load user data on initialization
  }

  // ✅ Update Active Tab
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
selectSection(section: string): void {
    this.selectedSection = section;
    // this.router.navigate(['/settings/profile'], { relativeTo: this.router.routerState.root, queryParams: { section } });
}

  getAnimationState(outlet: RouterOutlet): string {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
goBackFromMobileSection(){
    // Navigate back to the main user settings page
    this.router.navigate(['/settings']);
    this.selectedSection = null; // Reset the selected section
}
  navigateToMobileOutlet(section: string) {
    // Example navigation logic, adjust as needed for your routing setup
    this.router.navigate(['/settings/profile'], { relativeTo: this.router.routerState.root });
  }
}
