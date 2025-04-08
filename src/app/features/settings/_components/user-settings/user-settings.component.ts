import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProfileComponent } from "../profile/profile.component";
import { OrderHistoryComponent } from "../order-history/order-history.component";
import { NotificationPreferencesComponent } from "../notification-preferences/notification-preferences.component";
import { PaymentsComponent } from "../payments/payments.component";
import { AddressManagementComponent } from "../address-management/address-management.component";
import { SecuritySettingsComponent } from "../security-settings/security-settings.component";
import { RouterModule, RouterOutlet } from '@angular/router';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { ProfileFacade } from '../../_state/profile.facade';

@Component({
  selector: 'app-user-settings',
  imports: [
    CommonModule,
    RouterModule
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
  private userFacade = inject(ProfileFacade)
  selectedTab: string = 'profile'; // ✅ Default Tab
  user = this.userFacade.userSignal;

  ngOnInit(): void {
    this.userFacade.loadUser(); // Load user data on initialization
  }

  // ✅ Update Active Tab
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  getAnimationState(outlet: RouterOutlet): string {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
