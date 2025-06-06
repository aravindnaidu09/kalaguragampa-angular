import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { take } from 'rxjs';
import { MenuService } from '../../../../core/services/menu.service';
import { AuthService } from '../../_services/auth.service';
import { OtpService } from '../../_services/otp.service';
import { SetToken } from '../../_state/auth.state';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signin',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
  providers: [OtpService, MenuService, AuthService],
})
export class SigninComponent implements OnInit, OnDestroy {

  @Input() activeLoginMethod: string = 'otp';
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();
  @Output() isRegisterClicked = new EventEmitter<boolean>();
  @Output() isLoginSuccess = new EventEmitter<boolean>(false);
  @Output() forgotPassword = new EventEmitter<boolean>(false);



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
  isPhoneEditable = true;

  constructor(
    private fb: FormBuilder,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
    private readonly menuService: MenuService,
    private readonly store: Store,
    private readonly toastService: ToastService
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

    this.otpService.sendOtp(mobileNumber, 'mobile', '91', 'login')
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.toastService.showInfo(response.message);
          this.isOtpSent = true;
          this.isPhoneEditable = false; // 🔒 lock the phone number
          this.resendAttempts = 0;
          this.startOtpCooldown();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.showError(error.error?.message || 'Failed to send OTP. Please try again.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }


  /**
   * ✅ Handles the "Resend OTP" API call.
   */
  resendOtp(event: Event): void {
    event.preventDefault();

    const mobileControl = this.loginOtpForm.get('mobileNumber');
    if (!mobileControl?.value) {
      mobileControl?.markAsTouched();
      return;
    }

    if (this.isLoading || !this.isOtpResendEnabled || this.isResendBlocked) return;

    if (this.resendAttempts >= this.maxResendAttempts) {
      this.blockResendFor5Minutes();
      return;
    }

    this.isLoading = true;
    const mobileNumber = mobileControl.value;

    this.otpService.resendOtp(mobileNumber, 'mobile', '91')
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.toastService.showInfo(response.message);
          this.resendAttempts++;
          if (this.resendAttempts >= this.maxResendAttempts) {
            this.blockResendFor5Minutes();
          } else {
            this.startOtpCooldown();
          }
        },
        error: (error) => {
          console.error('Resend OTP Failed:', error);
          this.toastService.showError(error.error?.message || 'Failed to resend OTP. Please try again.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
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

    const { mobileNumber, otp } = this.loginOtpForm.value;

    this.authService.login(true, mobileNumber, otp)
      .pipe(take(1))
      .subscribe({
        next: (response) => this.handleLoginResponse(response),
        error: (error) => this.handleLoginError(error),
        complete: () => this.isSignInLoading = false
      });
  }


  /**
  * Handle password-based login
  */
  onSubmitPassword(): void {
    if (this.loginPasswordForm.invalid) return;

    this.isSignInLoading = true;

    const { emailOrMobile, password } = this.loginPasswordForm.value;

    this.authService.login(false, emailOrMobile, password)
      .pipe(take(1))
      .subscribe({
        next: (response) => this.handleLoginResponse(response),
        error: (error) => this.handleLoginError(error),
        complete: () => this.isSignInLoading = false
      });
  }


  /**
   * Trigger Forgot Password action
   */
  onForgotPassword(): void {
    // alert('Redirecting to Forgot Password page...');
    this.forgotPassword.emit(true);
  }

  /**
  * Close the login dialog
  */
  onRegister(): void {
    this.isRegistering.set(true);
    this.isRegisterClicked.emit(this.isRegistering());
  }

  // 🔽 Place this at the bottom of the class
  private handleLoginSuccess(response: any): void {
    this.store.dispatch(new SetToken(response.access, response.refresh));

    localStorage.setItem('accessToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);

    const userName = response?.user?.name || 'User';
    localStorage.setItem('userName', userName);

    this.menuService.updateMenu(userName);

    window.location.reload(); // Reload the page to reflect changes
  }

  private handleLoginResponse(response: any): void {
    if (response?.access && response?.refresh) {
      this.handleLoginSuccess(response);
      this.closeLoginDialog.emit(true);
      this.isLoginSuccess.emit(true);
    }
  }

  private handleLoginError(error: any): void {
    console.error('Login Failed:', error);
    this.toastService.showError(error.error?.message || 'Login failed. Please try again.');
    this.isSignInLoading = false;
    this.isLoginSuccess.emit(false);
  }

  changePhoneNumber(): void {
    this.isOtpSent = false;
    this.isOtpResendEnabled = false;
    this.isResendBlocked = false;
    this.resendAttempts = 0;
    this.otpCooldown = 30;
    this.resendCooldown = 300;
    this.isPhoneEditable = true;
    this.loginOtpForm.reset(); // optionally retain phone if needed
    clearInterval(this.otpInterval);
  }


  ngOnDestroy() {
    if (this.otpInterval) {
      clearInterval(this.otpInterval);
    }
  }
}
