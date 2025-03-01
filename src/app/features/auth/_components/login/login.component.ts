import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtpService } from '../../_services/otp.service';
import { AuthService } from '../../_services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { Store } from '@ngxs/store';
import { SetToken } from '../../_state/auth.state';
import { take } from 'rxjs';
import { MenuService } from '../../../../core/services/menu.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [OtpService, MenuService, AuthService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SignUpComponent
  ],
})
export class LoginComponent implements OnInit {
  @Input() activeLoginMethod: string = 'otp';
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();

  loginOtpForm!: FormGroup;
  loginPasswordForm!: FormGroup;

  isOtpSent = false;
  isMobileValid = false;
  isLoading = false;
  isSignInLoading = false;
  isOtpResendEnabled = false;
  otpCooldown = 30; // Initial cooldown time (in seconds)
  otpInterval: any;

  resendAttempts = 0; // Tracks the number of resend attempts
  maxResendAttempts = 3; // Limit resend to 3 times
  resendCooldown = 300; // 5 minutes (300 seconds) after 3 attempts
  isResendBlocked = false; // Flag to block resending

  isRegistering = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
    private readonly menuService: MenuService,
    private readonly store: Store
  ) {
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

  ngOnInit() { }

  ngOnDestroy() {
    clearInterval(this.otpInterval);
  }

  onMobileNumberInput(event: any): void {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/\D/g, ''); // Remove non-numeric characters

    if (sanitizedValue.length > 10) {
      event.target.value = sanitizedValue.slice(0, 10); // Limit to 10 digits
      this.loginOtpForm.get('mobileNumber')?.setValue(sanitizedValue.slice(0, 10), { emitEvent: false });
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (allowedKeys.includes(event.key)) {
      return true; // Allow navigation and control keys
    }

    const regex = /^[0-9]$/;
    if (!regex.test(event.key)) {
      event.preventDefault(); // Block non-numeric input
      return false;
    }

    return true;
  }

  /**
   * ✅ Handles the "Send OTP" API call.
   */
  sendOtp(event: Event): void {
    event.preventDefault();

    const mobileControl = this.loginOtpForm.get('mobileNumber');
    if (!mobileControl?.value) {
      mobileControl?.markAsTouched(); // Show validation message
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    const mobileNumber = mobileControl.value;

    this.otpService.sendOtp(mobileNumber, 'mobile', '91').subscribe(
      () => {
        this.isOtpSent = true;
        this.isLoading = false;
        this.resendAttempts = 0; // Reset attempts on a fresh OTP send
        this.startOtpCooldown();
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  /**
   * ✅ Handles the "Resend OTP" API call.
   */
  resendOtp(event: Event): void {
    event.preventDefault();

    const mobileControl = this.loginOtpForm.get('mobileNumber');
    if (!mobileControl?.value) {
      mobileControl?.markAsTouched(); // Show validation message
      return;
    }

    if (this.isLoading || !this.isOtpResendEnabled || this.isResendBlocked) return;

    if (this.resendAttempts >= this.maxResendAttempts) {
      this.blockResendFor5Minutes();
      return;
    }

    this.isLoading = true;
    const mobileNumber = mobileControl.value;

    this.otpService.resendOtp(mobileNumber, 'mobile', '91').subscribe(
      () => {
        this.isLoading = false;
        this.resendAttempts++;

        if (this.resendAttempts >= this.maxResendAttempts) {
          this.blockResendFor5Minutes();
        } else {
          this.startOtpCooldown();
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  /**
   * ✅ Start 30s Countdown for Resend OTP
   */
  private startOtpCooldown() {
    if (this.isOtpResendEnabled) return; // ✅ Prevent multiple intervals

    this.isOtpResendEnabled = false;
    this.otpCooldown = 30;

    clearInterval(this.otpInterval); // ✅ Ensures only one interval runs at a time
    this.otpInterval = setInterval(() => {
      this.otpCooldown--;
      if (this.otpCooldown <= 0) {
        clearInterval(this.otpInterval);
        this.isOtpResendEnabled = true;
      }
    }, 1000);
  }

  /**
  * ✅ Block OTP Resend for 5 minutes after 3 attempts
  */
  private blockResendFor5Minutes() {
    this.isResendBlocked = true;
    this.resendCooldown = 300;

    const cooldownInterval = setInterval(() => {
      this.resendCooldown--;

      if (this.resendCooldown <= 0) {
        clearInterval(cooldownInterval);
        this.isResendBlocked = false;
        this.resendAttempts = 0; // Reset attempts after cooldown
      }
    }, 1000);
  }

  /**
   * ✅ Handles OTP Submission
   */
  onSubmitOtp(): void {
    if (this.loginOtpForm.invalid) return;

    this.isSignInLoading = true;

    const mobileNumber = this.loginOtpForm.get('mobileNumber')?.value;
    const otp = this.loginOtpForm.get('otp')?.value;

    this.authService.login(true, mobileNumber, otp).subscribe(
      (response: any) => {
        if (response && response.access && response.refresh) {
          this.store.dispatch(new SetToken(response.access, response.refresh));
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
        }
        this.isSignInLoading = false;
        this.closeLoginDialog.emit(true);
      },
      () => {
        this.isSignInLoading = false;
      }
    );
  }

  /**
  * Handle password-based login
  */
  onSubmitPassword(): void {
    if (this.loginPasswordForm.valid) {
      this.isSignInLoading = true;

      const mobileOrEmail = this.loginPasswordForm.get('emailOrMobile')?.value;
      const password = this.loginPasswordForm.get('password')?.value;

      this.authService
        .login(false, mobileOrEmail, password)
        .pipe(take(1)) // ✅ Ensures one-time execution
        .subscribe(
          (response: any) => {
            if (response?.access && response?.refresh) {
              this.store.dispatch(new SetToken(response.access, response.refresh));

              localStorage.setItem('accessToken', response.access);
              localStorage.setItem('refreshToken', response.refresh);

              const userName = response?.user?.name || 'User'; // Default fallback
              this.menuService.setLoggedInMenu(userName); // ✅ Update menu with user name
            }

            this.isSignInLoading = false;
            this.closeLoginDialog.emit(true);
          },
          (error: any) => { // ✅ Add proper error handling
            console.error('Login Failed:', error);
            this.isSignInLoading = false;
          }
        );
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
    this.isRegistering.set(true)
  }
}
