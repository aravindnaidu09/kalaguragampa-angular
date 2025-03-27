import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService
  ) {}

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



  // 🔐 Submit password change
  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.changePasswordForm.value;

    // this.authService.changePassword(currentPassword, newPassword).subscribe({
    //   next: () => {
    //     this.toast.showSuccess('Password changed successfully');
    //     this.changePasswordForm.reset();
    //     this.passwordStrength.set('weak');
    //   },
    //   error: () => {
    //     this.toast.showError('Password change failed. Please try again.');
    //   }
    // });
  }
}
