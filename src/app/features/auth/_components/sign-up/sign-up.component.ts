import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  registerForm!: FormGroup;
  isMobileVerified = false;
  isEmailVerified = false;
  isMobileOtpSent = false;
  isEmailOtpSent = false;
  isLoadingMobileOtp = false;
  isLoadingEmailOtp = false;
  isLoadingRegister = false;
  showMobileError = false;
  showEmailError = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group(
      {
        mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        mobileOtp: [''],
        email: ['', [Validators.required, Validators.email]],
        emailOtp: [''],
        username: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
        firstName: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[A-Za-z]+$')]],
        lastName: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[A-Za-z]+$')]],
        password: [
          { value: '', disabled: true },
          [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)],
        ],
        confirmPassword: [{ value: '', disabled: true }, [Validators.required]],
      },
      { validator: this.matchPasswords }
    );
  }

  /** Custom Validator to Match Passwords */
  matchPasswords(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  /** Send OTP for Mobile */
  sendMobileOtp() {
    if (this.registerForm.get('mobileNumber')?.invalid) {
      this.showMobileError = true;
      return;
    }
    this.showMobileError = false;
    this.isLoadingMobileOtp = true;

    this.authService.sendOtp(this.registerForm.value.mobileNumber, 'mobile', '91').subscribe({
      next: () => {
        this.isMobileOtpSent = true;
        this.isLoadingMobileOtp = false;
      },
      error: () => (this.isLoadingMobileOtp = false),
    });
  }

  /** Verify OTP for Mobile */
  verifyMobileOtp() {
    if (!this.registerForm.get('mobileOtp')?.value) return;

    this.authService.verifyOtp(this.registerForm.value.mobileNumber, this.registerForm.value.mobileOtp, 'mobile').subscribe({
      next: () => {
        this.isMobileVerified = true;
        this.enableFields();
      },
    });
  }

  /** Send OTP for Email */
  sendEmailOtp() {
    if (this.registerForm.get('email')?.invalid) {
      this.showEmailError = true;
      return;
    }
    this.showEmailError = false;
    this.isLoadingEmailOtp = true;

    this.authService.sendOtp(this.registerForm.value.email, 'email').subscribe({
      next: () => {
        this.isEmailOtpSent = true;
        this.isLoadingEmailOtp = false;
      },
      error: () => (this.isLoadingEmailOtp = false),
    });
  }

  /** Verify OTP for Email */
  verifyEmailOtp() {
    if (!this.registerForm.get('emailOtp')?.value) return;

    this.authService.verifyOtp(this.registerForm.value.email, this.registerForm.value.emailOtp, 'email').subscribe({
      next: () => {
        this.isEmailVerified = true;
        this.enableFields();
      },
    });
  }

  /** Enable Fields after OTP Verification */
  enableFields() {
    if (this.isMobileVerified && this.isEmailVerified) {
      ['username', 'firstName', 'lastName', 'password', 'confirmPassword'].forEach((field) => {
        this.registerForm.get(field)?.enable();
      });
    }
  }

  /** Submit Registration */
  onRegister() {
    console.log(this.registerForm.value);
    if (this.registerForm.invalid) return;

    this.isLoadingRegister = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        console.log('Registration Successful');
        this.isLoadingRegister = false;
      },
      error: () => (this.isLoadingRegister = false),
    });
  }
}
