import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../_services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  changePasswordForm!: FormGroup;

  // 👁️ Toggle flags
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  // 💪 Password Strength
  passwordStrength = signal<'weak' | 'medium' | 'strong'>('weak');

  strengthClass = computed(() => {
    const value = this.passwordStrength();
    return {
      'text-danger': value === 'weak',
      'text-warning': value === 'medium',
      'text-success': value === 'strong'
    };
  });

  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // ✅ Validate if passwords match
  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  // 💪 Check password strength
  checkPasswordStrength(): void {
    const password = this.changePasswordForm.get('newPassword')?.value;
    if (!password) {
      this.passwordStrength.set('weak');
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[\W_]/.test(password);

    const strengthPoints = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    if (password.length >= 10 && strengthPoints >= 3) {
      this.passwordStrength.set('strong');
    } else if (password.length >= 6 && strengthPoints >= 2) {
      this.passwordStrength.set('medium');
    } else {
      this.passwordStrength.set('weak');
    }
  }

  // 🔁 Helper for validation errors
  isInvalid(controlName: string): boolean {
    const control = this.changePasswordForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }



  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = this.changePasswordForm.value;

    this.loading = true;

    this.authService.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    }).subscribe({
      next: () => {
        this.toast.showSuccess('Password changed successfully');
        this.changePasswordForm.reset();
        this.passwordStrength.set('weak');

        this.loading = false;
      },
      error: (err) => {
        console.error('Change password error:', err);
        this.toast.showError(err || 'Failed to change password');
        this.loading = false;
      }
    });
  }

}
