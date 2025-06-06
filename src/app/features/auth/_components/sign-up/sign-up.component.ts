import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../_services/auth.service';
import { OtpService } from '../../_services/otp.service';
import { Store } from '@ngxs/store';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  @Output() showLoginPage = new EventEmitter<boolean>(false);

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

  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  canResendMobileOtp = false;
  canResendEmailOtp = false;
  mobileOtpCooldown = 30;
  emailOtpCooldown = 30;
  isLoginPage = signal<boolean>(false);
  verifyMobileOtpLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private readonly otpService: OtpService,
    private readonly store: Store,
    private readonly toastService: ToastService
  ) {
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
          '',
          [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.matchPasswords }
    );
  }

  /** ✅ Custom Validator to Match Passwords */
  matchPasswords(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  /** ✅ Retrieve Form Field Value */
  private getFieldValue(field: string): any {
    return this.registerForm.get(field)?.value;
  }

  /** ✅ Validate Mobile Number */
  validateMobileNumber(): void {
    const mobileValue = this.getFieldValue('mobileNumber');
    this.showMobileError = !mobileValue || !/^\d{10}$/.test(mobileValue);
  }

  /** ✅ Restrict input to numbers only */
  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /** ✅ Validate Email */
  validateEmail(): void {
    const emailValue = this.getFieldValue('email');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.showEmailError = !emailValue || !emailRegex.test(emailValue);
  }

  /** ✅ Toggle Password Visibility */
  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.isPasswordVisible = !this.isPasswordVisible;
    } else if (field === 'confirmPassword') {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    }
  }

  /** ✅ Resend OTP for Mobile */
  resendMobileOtp() {
    if (!this.registerForm.get('mobileNumber')?.valid) {
      this.toastService.showError('Please enter a valid mobile number before resending OTP.');
      return;
    }

    this.isLoadingMobileOtp = true;

    this.otpService.resendOtp(this.registerForm.value.mobileNumber, 'mobile', '91').subscribe({
      next: () => {
        this.isLoadingMobileOtp = false;
        this.startCooldown('mobile');
        this.toastService.showSuccess('OTP has been resent successfully. Check your messages.');
      },
      error: (err) => {
        this.isLoadingMobileOtp = false;
        console.error('OTP Resend Error:', err);

        // ✅ Provide a user-friendly error message
        const errorMessage = err.error?.message || 'Failed to resend OTP. Please try again later.';
        this.toastService.showError(errorMessage);
      }
    });
  }


  /** ✅ Send OTP for Mobile */
  sendMobileOtp() {
    if (this.registerForm.get('mobileNumber')?.invalid) {
      this.showMobileError = true;
      return;
    }
    this.isLoadingMobileOtp = true;
    this.otpService.sendOtp(this.getFieldValue('mobileNumber'), 'mobile', '91', 'register').subscribe({
      next: () => {
        this.isMobileOtpSent = true;
        this.isLoadingMobileOtp = false;
        this.startCooldown('mobile');
        this.toastService.showSuccess('OTP sent to mobile successfully.');
      },
      error: (err: any) => {
        this.isLoadingMobileOtp = false;
        this.toastService.showError(err.error?.message || 'Failed to send mobile OTP. Try again.');
      }
    });
  }

  /** ✅ Send OTP for Email */
  sendEmailOtp() {
    if (this.registerForm.get('email')?.invalid) {
      this.showEmailError = true;
      return;
    }
    this.isLoadingEmailOtp = true;
    this.otpService.sendOtp(this.getFieldValue('email'), 'email', '', 'register').subscribe({
      next: () => {
        this.isEmailOtpSent = true;
        this.isLoadingEmailOtp = false;
        this.startCooldown('email');
        this.toastService.showSuccess('OTP sent to email successfully.');
      },
      error: (err: any) => {
        this.isLoadingEmailOtp = false;
        this.toastService.showError(err.error?.message || 'Failed to send email OTP. Try again.');
      }
    });
  }

  /** ✅ Resend OTP for Email */
  resendEmailOtp() {
    if (!this.isEmailOtpSent) {
      this.toastService.showError('OTP has not been sent yet. Please request an OTP first.');
      return;
    }

    if (!this.canResendEmailOtp) {
      this.toastService.showWarning(`Please wait ${this.emailOtpCooldown} seconds before resending OTP.`);
      return;
    }

    this.isLoadingEmailOtp = true;

    this.otpService.resendOtp(this.registerForm.value.email, 'email').subscribe({
      next: () => {
        this.isLoadingEmailOtp = false;
        this.startCooldown('email');
        this.toastService.showSuccess('Email OTP has been resent successfully. Check your inbox.');
      },
      error: (err) => {
        this.isLoadingEmailOtp = false;
        console.error('Email OTP Resend Error:', err);

        // ✅ Provide a user-friendly error message
        const errorMessage = err.error?.message || 'Failed to resend Email OTP. Please try again later.';
        this.toastService.showError(errorMessage);
      }
    });
  }


  /** ✅ Verify OTP for Mobile */
  verifyMobileOtp() {
    if (!this.getFieldValue('mobileOtp')) return;
    this.verifyMobileOtpLoading.set(true);
    this.otpService.verifyOtp(this.getFieldValue('mobileNumber'), this.getFieldValue('mobileOtp'), 'mobile', '', 'register').subscribe({
      next: () => {
        this.isMobileVerified = true;
        this.enableFields();
        this.toastService.showSuccess('Mobile OTP verified successfully.');
      },
      error: (err: any) => {
        this.toastService.showError(err.error?.message || 'Invalid mobile OTP. Try again.');
      },
      complete: () => {
        this.verifyMobileOtpLoading.set(false);
      }
    });
  }

  /** ✅ Verify OTP for Email */
  verifyEmailOtp() {
    if (!this.getFieldValue('emailOtp')) return;
    this.otpService.verifyOtp(this.getFieldValue('email'), this.getFieldValue('emailOtp'), 'email', '', 'register').subscribe({
      next: () => {
        this.isEmailVerified = true;
        this.enableFields();
        this.toastService.showSuccess('Email OTP verified successfully.');
      },
      error: (err: any) => {
        this.toastService.showError(err.error?.message || 'Invalid email OTP. Try again.');
      }
    });
  }

  /** ✅ Cooldown Timer for OTP */
  startCooldown(type: 'mobile' | 'email') {
    if (type === 'mobile') {
      this.canResendMobileOtp = false;
      this.mobileOtpCooldown = 30;
    } else {
      this.canResendEmailOtp = false;
      this.emailOtpCooldown = 30;
    }

    const interval = setInterval(() => {
      if (type === 'mobile') {
        this.mobileOtpCooldown--;
        if (this.mobileOtpCooldown <= 0) {
          clearInterval(interval);
          this.canResendMobileOtp = true;
        }
      } else {
        this.emailOtpCooldown--;
        if (this.emailOtpCooldown <= 0) {
          clearInterval(interval);
          this.canResendEmailOtp = true;
        }
      }
    }, 1000);
  }

  /** ✅ Enable Fields After OTP Verification */
  enableFields() {
    if (this.isMobileVerified && this.isEmailVerified) {
      ['username', 'firstName', 'lastName', 'password', 'confirmPassword'].forEach((field) =>
        this.registerForm.get(field)?.enable()
      );
    }
  }

  goBackToLogin() {
    this.isLoginPage.set(true);
    this.showLoginPage.emit(this.isLoginPage());
  }

  /** ✅ Submit Registration */
  onRegister() {
    if (this.registerForm.invalid) {
      this.toastService.showError('Please fill in all required fields correctly.');
      return;
    }

    this.isLoadingRegister = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoadingRegister = false;
        this.toastService.showSuccess('Registration successful! You can now log in.');
        console.log('Registration Successful');

        // ✅ Optionally, redirect to login page
        this.goBackToLogin();
      },
      error: (err: any) => {
        this.isLoadingRegister = false;
        console.error('Registration Error:', err.error?.message);

        // ✅ Provide user-friendly error messages
        const errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.toastService.showError(errorMessage);
      }
    });
  }

}
