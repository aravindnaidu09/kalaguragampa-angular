import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OtpService } from '../../_services/otp.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [OtpService],
})
export class LoginComponent {
  @Input() activeLoginMethod: string = 'otp';
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();

  loginOtpForm: FormGroup;
  loginPasswordForm: FormGroup;
  isOtpSent: boolean = false;
  isMobileValid: boolean = false;

  isLoading: boolean = false;
  isSignInLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private readonly otpService: OtpService,
    private readonly authService: AuthService
  ) {
    // OTP Login Form
    this.loginOtpForm = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    });

    // Password Login Form
    this.loginPasswordForm = this.fb.group({
      emailOrMobile: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  /**
   * Switch login method dynamically
   * Called if the user switches between login methods.
   */
  setLoginMethod(method: 'otp' | 'password'): void {
    this.activeLoginMethod = method;
  }

  /**
   * Validate mobile number input and activate Send OTP link
   */
  onMobileNumberInput(): void {
    const mobileControl = this.loginOtpForm.get('mobileNumber');
    this.isMobileValid = mobileControl?.valid || false;
  }

  /**
   * Handles the "Send OTP" API call.
   */
  sendOtp(event: Event): void {
    event.preventDefault();

    if (this.isMobileValid) {
      this.isLoading = true; // Show loader
      const mobileNumber = this.loginOtpForm.get('mobileNumber')?.value;

      this.otpService.sendOtp(mobileNumber, 'mobile', '91').subscribe(
        (result: any) => {
          console.log('OTP sent:', result);
          this.isOtpSent = true;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error sending OTP:', error);
          this.isLoading = false;
          this.isOtpSent = false;
        }
      );
    }
  }

  /**
   * Handle OTP submission
   */
  onSubmitOtp(): void {
    if (this.loginOtpForm.valid) {

      this.isSignInLoading = true;

      const mobileNumber = this.loginOtpForm.get('mobileNumber')?.value;
      const credential = this.loginOtpForm.get('otp')?.value;
      this.authService.login(this.activeLoginMethod === 'otp' ? true : false, mobileNumber, credential).subscribe((result: any) => {
        this.isSignInLoading = false;
      }, (error) => {
        this.isSignInLoading = false;
      });
    }
  }

  /**
   * Handle password-based login
   */
  onSubmitPassword(): void {
    if (this.loginPasswordForm.valid) {
      console.log('Logging in with Password:', this.loginPasswordForm.value);
      alert('Logged in successfully with Password!');
    }
  }

  /**
   * Trigger Forgot Password action
   */
  onForgotPassword(): void {
    alert('Redirecting to Forgot Password page...');
  }

  /**
   * Close the login dialog
   */
  onRegister(): void {
  }
}
