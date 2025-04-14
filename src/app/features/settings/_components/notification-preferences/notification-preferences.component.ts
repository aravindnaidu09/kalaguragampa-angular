import { Component, inject, signal } from '@angular/core';
import { NotificationSettings } from '../../_model/notification-settings-model';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

@Component({
  selector: 'app-notification-preferences',
  imports: [
    CommonModule
  ],
  templateUrl: './notification-preferences.component.html',
  styleUrl: './notification-preferences.component.scss',
  animations: [
    trigger('fadeStagger', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(100, animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class NotificationPreferencesComponent {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);

  settings = signal<NotificationSettings>({
    email: false,
    sms: false,
    push: false,
    orderUpdates: false,
    promotional: false
  });

  notificationOptions: { key: keyof NotificationSettings; label: string }[] = [
    { key: 'email', label: 'Receive Email Notifications' },
    { key: 'sms', label: 'Receive SMS Notifications' },
    { key: 'push', label: 'Receive Push Notifications' },
    { key: 'orderUpdates', label: 'Order Updates' },
    { key: 'promotional', label: 'Promotional Offers' }
  ];


  ngOnInit(): void {
    // this.fetchNotificationSettings();
  }

  // ✅ Fetch Notification Preferences
  private fetchNotificationSettings(): void {
    this.notificationService.getNotificationSettings().subscribe({
      next: (data) => this.settings.set(data),
      error: () => this.toastService.showError('Failed to load notification settings')
    });
  }

  // ✅ Toggle Notification
  toggleSetting(key: keyof NotificationSettings): void {
    this.settings.update(settings => ({ ...settings, [key]: !settings[key] }));
  }

  // ✅ Save Notification Preferences
  saveSettings(): void {
    this.notificationService.updateNotificationSettings(this.settings()).subscribe({
      next: () => this.toastService.showSuccess('Notification settings updated'),
      error: () => this.toastService.showError('Failed to update settings')
    });
  }
}
