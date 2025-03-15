import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SecurityService } from '../../_services/security.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-settings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss'
})
export class SecuritySettingsComponent {
  private securityService = inject(SecurityService);
  private fb = inject(FormBuilder);

  changePasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  enable2FA = signal<boolean>(false);
  recentLogins = signal<any[]>([]);

  ngOnInit(): void {
    this.initializeForms();
    this.fetchSecuritySettings();
  }

  // ✅ Initialize Forms
  private initializeForms(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // ✅ Fetch Security Settings
  private fetchSecuritySettings(): void {
    this.securityService.getSecuritySettings().subscribe({
      next: (data) => {
        this.enable2FA.set(data.enable2FA);
        this.recentLogins.set(data.recentLogins);
      },
      // error: () => this.toastService.showError('Failed to load security settings')
    });
  }

  // ✅ Change Password
  changePassword(): void {
    if (this.changePasswordForm.invalid) {
      // this.toastService.showError('Please fill all fields correctly');
      return;
    }

    if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
      // this.toastService.showError('New password and confirm password do not match');
      return;
    }

    this.securityService.changePassword(this.changePasswordForm.value).subscribe({
      // next: () => this.toastService.showSuccess('Password changed successfully'),
      // error: () => this.toastService.showError('Failed to change password')
    });
  }

  // ✅ Reset Password
  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      // this.toastService.showError('Enter a valid email');
      return;
    }

    this.securityService.resetPassword(this.resetPasswordForm.value).subscribe({
      // next: () => this.toastService.showSuccess('Password reset link sent to your email'),
      // error: () => this.toastService.showError('Failed to send reset link')
    });
  }

  // ✅ Enable/Disable 2FA
  toggle2FA(): void {
    this.enable2FA.update((current) => !current);
    this.securityService.update2FA({ enable2FA: this.enable2FA() }).subscribe({
      // next: () => this.toastService.showSuccess('Two-Factor Authentication updated'),
      // error: () => this.toastService.showError('Failed to update 2FA')
    });
  }
}
