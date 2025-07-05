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
  verifyEmailOtpLoading = signal(false);

  mobileResendAttempts = 0;
  MAX_RESEND_ATTEMPTS = 3;

  emailResendAttempts = 0;
  MAX_EMAIL_RESEND_ATTEMPTS = 3;

  isMobileEditing = false;

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

        this.registerForm.get('mobileNumber')?.disable();
        this.isMobileEditing = false;
      },
      error: (err: any) => {
        this.isLoadingMobileOtp = false;
        this.toastService.showError(err.error?.message || 'Failed to send mobile OTP. Try again.');
      }
    });
  }

  /** ✅ Resend OTP for Mobile */
  resendMobileOtp() {
    if (this.mobileResendAttempts >= this.MAX_RESEND_ATTEMPTS) {
      this.toastService.showWarning('Maximum resend attempts reached. Please try again later.');
      return;
    }

    this.isLoadingMobileOtp = true;

    this.otpService.resendOtp(this.registerForm.get('mobileNumber')?.getRawValue(), 'mobile', '91').subscribe({
      next: () => {
        this.isLoadingMobileOtp = false;
        this.mobileResendAttempts++;
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


  /** ✅ Verify OTP for Mobile */
  verifyMobileOtp() {
    const otp = this.getFieldValue('mobileOtp');
    if (!otp || !otp.trim()) {
      this.toastService.showError('Please enter the OTP to verify.');
      return;
    }

    this.verifyMobileOtpLoading.set(true);  // ✅ START LOADING

    this.otpService.verifyOtp(
      this.getFieldValue('mobileNumber'),
      this.getFieldValue('mobileOtp'),
      'mobile', '', 'register'
    ).subscribe({
      next: () => {
        this.isMobileVerified = true;
        this.enableFields();
        this.toastService.showSuccess('Mobile OTP verified successfully.');
      },
      error: (err: any) => {
        this.toastService.showError(err.error?.message || 'Invalid mobile OTP. Try again.');
        this.verifyMobileOtpLoading.set(false);
      },
      complete: () => {
        this.verifyMobileOtpLoading.set(false);  // ✅ STOP LOADING
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

        this.registerForm.get('email')?.disable();

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

    if (this.emailResendAttempts >= this.MAX_EMAIL_RESEND_ATTEMPTS) {
      this.toastService.showWarning('Maximum resend attempts reached. Please try again later.');
      return;
    }

    this.isLoadingEmailOtp = true;

    this.otpService.resendOtp(this.registerForm.get('email')?.getRawValue(), 'email').subscribe({
      next: () => {
        this.isLoadingEmailOtp = false;
        this.startCooldown('email');
        this.emailResendAttempts++;
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

  /** ✅ Verify OTP for Email */
  verifyEmailOtp() {
    const otp = this.getFieldValue('emailOtp');
    if (!otp || !otp.trim()) {
      this.toastService.showError('Please enter the OTP to verify.');
      return;
    }
    this.verifyEmailOtpLoading.set(true);

    this.otpService.verifyOtp(this.getFieldValue('email'), this.getFieldValue('emailOtp'), 'email', '', 'register')
      .subscribe({
        next: () => {
          this.isEmailVerified = true;
          this.enableFields();
          this.toastService.showSuccess('Email OTP verified successfully.');
        },
        error: (err: any) => {
          this.toastService.showError(err.error?.message || 'Invalid email OTP. Try again.');
          this.verifyEmailOtpLoading.set(false);
        },
        complete: () => {
          this.verifyEmailOtpLoading.set(false);
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

    const payload = {
      username: this.registerForm.get('username')?.value,
      first_name: this.registerForm.get('firstName')?.value,
      last_name: this.registerForm.get('lastName')?.value,
      password: this.registerForm.get('password')?.value,
      confirm_password: this.registerForm.get('confirmPassword')?.value,
      mobile: this.registerForm.get('mobileNumber')?.getRawValue(),
      email: this.registerForm.get('email')?.getRawValue(),
      country_code: '91', // Assuming country code is fixed for India
    }

    // console.log('checking-payload: ', payload);
    // return;

    this.authService.register(payload).subscribe({
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

  enableMobileEdit() {
    this.registerForm.get('mobileNumber')?.enable();
    this.registerForm.get('mobileNumber')?.reset();
    this.isMobileEditing = true;
    this.isMobileOtpSent = false;
    this.canResendMobileOtp = false;
    this.mobileResendAttempts = 0;
  }

  enableEmailEdit() {
    this.registerForm.get('email')?.enable();
    this.registerForm.get('email')?.reset();
    this.isEmailOtpSent = false;
    this.canResendEmailOtp = false;
    this.emailResendAttempts = 0;
  }
}
