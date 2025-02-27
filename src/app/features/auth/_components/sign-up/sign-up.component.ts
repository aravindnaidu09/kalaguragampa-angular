import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../_services/auth.service';
import { OtpService } from '../../_services/otp.service';
import { Store } from '@ngxs/store';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginComponent
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

  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  canResendMobileOtp = false;
  canResendEmailOtp = false;
  mobileOtpCooldown = 30;
  emailOtpCooldown = 30;

  isLoginPage = signal<boolean>(false);


  constructor(private fb: FormBuilder, private authService: AuthService, private readonly otpService: OtpService,
    private readonly store: Store
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
          [Validators.required, Validators.minLength(8),  Validators.maxLength(16), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)],
        ],
        confirmPassword: ['', [Validators.required]],
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

  // Method to validate mobile number
  validateMobileNumber(): void {
    const mobileControl = this.registerForm.get('mobileNumber');
    const mobileValue = mobileControl?.value || '';

    // ✅ If empty or invalid format, show validation message
    if (!mobileValue || !/^\d{10}$/.test(mobileValue)) {
      this.showMobileError = true;
    } else {
      this.showMobileError = false; // ✅ Hide validation when valid
    }
  }

  // ✅ Restrict input to numbers only
  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow only numeric keys (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  // Method to validate email
  validateEmail(): void {
    const emailControl = this.registerForm.get('email');
    const emailValue = emailControl?.value || '';

    // ✅ Email Regex for Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // ✅ If empty or invalid format, show validation message
    if (!emailValue || !emailRegex.test(emailValue)) {
      this.showEmailError = true;
    } else {
      this.showEmailError = false; // ✅ Hide validation when valid
    }
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.isPasswordVisible = !this.isPasswordVisible;
    } else if (field === 'confirmPassword') {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    }
  }


  // Method to be used to send otp to the mobile number
  sendMobileOtp() {
    if (this.registerForm.get('mobileNumber')?.invalid) {
      this.showMobileError = true;
      return;
    }
    this.isLoadingMobileOtp = true;
    this.otpService.sendOtp(this.registerForm.value.mobileNumber, 'mobile', '91').subscribe(() => {
      this.isMobileOtpSent = true;
      this.isLoadingMobileOtp = false;
      this.startMobileOtpCooldown();
    });
  }

  // Method to be used to send otp again the mobile number
  resendMobileOtp() {
    this.isLoadingMobileOtp = true;
    this.otpService.resendOtp(this.registerForm.value.mobileNumber, 'mobile', '91').subscribe(() => {
      this.isLoadingMobileOtp = false;
      this.startMobileOtpCooldown();
    });
  }

  startMobileOtpCooldown() {
    this.canResendMobileOtp = false;
    this.mobileOtpCooldown = 30;
    const interval = setInterval(() => {
      this.mobileOtpCooldown--;
      if (this.mobileOtpCooldown <= 0) {
        clearInterval(interval);
        this.canResendMobileOtp = true;
      }
    }, 1000);
  }


  /** Verify OTP for Mobile */
  verifyMobileOtp() {
    if (!this.registerForm.get('mobileOtp')?.value) return;

    this.otpService.verifyOtp(this.registerForm.value.mobileNumber, this.registerForm.value.mobileOtp, 'mobile').subscribe({
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

    this.otpService.sendOtp(this.registerForm.value.email, 'email').subscribe({
      next: () => {
        this.isEmailOtpSent = true;
        this.isLoadingEmailOtp = false;

        this.startEmailOtpCooldown();
      },
      error: () => {
        this.isLoadingEmailOtp = false;
      },
    });
  }

  /** Resend OTP for Email */
  resendEmailOtp() {
    if (!this.isEmailOtpSent || this.canResendEmailOtp) return;

    this.isLoadingEmailOtp = true;

    this.otpService.resendOtp(this.registerForm.value.email, 'email').subscribe({
      next: () => {
        this.isLoadingEmailOtp = false;
        this.startEmailOtpCooldown();
      },
      error: () => {
        this.isLoadingEmailOtp = false;
      },
    });
  }


  /** Verify OTP for Email */
  verifyEmailOtp() {
    if (!this.registerForm.get('emailOtp')?.value) return;

    this.otpService.verifyOtp(this.registerForm.value.email, this.registerForm.value.emailOtp, 'email').subscribe({
      next: () => {
        this.isEmailVerified = true;
        this.enableFields();
      },
    });
  }

  startEmailOtpCooldown() {
    this.canResendEmailOtp = false;
    this.emailOtpCooldown = 30;
    const interval = setInterval(() => {
      this.emailOtpCooldown--;
      if (this.emailOtpCooldown <= 0) {
        clearInterval(interval);
        this.canResendEmailOtp = true;
      }
    }, 1000);
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

  goBackToLogin() {
    this.isLoginPage.set(true);
  }
}
