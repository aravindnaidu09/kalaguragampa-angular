import { Component, inject, signal } from '@angular/core';
import { NotificationSettings } from '../../_model/notification-settings-model';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../_services/notification.service';

@Component({
  selector: 'app-notification-preferences',
  imports: [],
  templateUrl: './notification-preferences.component.html',
  styleUrl: './notification-preferences.component.scss'
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

  ngOnInit(): void {
    this.fetchNotificationSettings();
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
