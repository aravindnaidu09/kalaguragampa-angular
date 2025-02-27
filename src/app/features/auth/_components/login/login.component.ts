import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
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
import { SignUpComponent } from "../sign-up/sign-up.component";
import { jwtDecode } from 'jwt-decode';
import { Select, Store } from '@ngxs/store';
import { OtpState, SetOtpRequested, StartOtpCooldown } from '../../_state/otp.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SignUpComponent
  ],
  providers: [OtpService],
})
export class LoginComponent implements OnInit {
  @Input() activeLoginMethod: string = 'otp';
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();

  loginPasswordForm: FormGroup;
  loginOtpForm!: FormGroup;
  isOtpSent = false;
  isLoginBlocked = false;
  loginAttempts = 0;
  loginCooldown = 30;
  otpCooldown = 30;
  isOtpCooldownActive = false;
  isMobileValid: boolean = false;
  isResendAvailable: boolean = false;

  isLoading: boolean = false;
  isSignInLoading: boolean = false;

  isRegistering = signal<boolean>(false);

  otpCooldown$!: Observable<number>
  isOtpRequested$!: Observable<boolean>
  isResendAvailable$!: Observable<boolean>


  constructor(
    private fb: FormBuilder,
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
    private readonly store: Store
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

    this.checkTokenExpiration();

    this.isOtpRequested$ = this.store.select(OtpState.isOtpRequested);
    this.otpCooldown$ = this.store.select(OtpState.getOtpCooldown);
    this.isResendAvailable$ = this.store.select(OtpState.canResendOtp);
  }

  ngOnInit() {
    this.isOtpSent = this.store.selectSnapshot(OtpState.isOtpRequested);
    if (this.isOtpSent) {
      this.store.dispatch(new StartOtpCooldown());
    }
  }

  // ✅ Check if JWT Token is Expired
  checkTokenExpiration() {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000;
      if (expiryTime < Date.now()) {
        this.authService.logout();
      }
    }
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
    if (this.isLoading) return;

    this.isLoading = true;
    const mobileNumber = this.loginOtpForm.get('mobileNumber')?.value;

    this.otpService.sendOtp(mobileNumber, 'mobile', '91').subscribe(
      () => {
        this.isOtpSent = true;
        this.isLoading = false;
        this.store.dispatch(new SetOtpRequested());
        this.store.dispatch(new StartOtpCooldown());
      },
      () => {
        this.isLoading = false;
      }
    );
  }


  /**
   * Handles the "Resend OTP" API call.
   */
  resendOtp(event: Event): void {
    event.preventDefault();
    if (this.isLoading) return;

    this.isLoading = true;
    const mobileNumber = this.loginOtpForm.get('mobileNumber')?.value;

    this.otpService.resendOtp(mobileNumber, 'mobile', '91').subscribe(
      () => {
        this.isLoading = false;
        this.store.dispatch(new StartOtpCooldown());
      },
      () => {
        this.isLoading = false;
      }
    );
  }


  /**
   * Handle OTP submission
   */
  onSubmitOtp(): void {
    if (this.isLoginBlocked) return;

    if (this.loginOtpForm.valid) {



      this.isSignInLoading = true;

      const mobileNumber = this.loginOtpForm.get('mobileNumber')?.value;
      const credential = this.loginOtpForm.get('otp')?.value;
      this.authService.login(this.activeLoginMethod === 'otp' ? true : false, mobileNumber, credential).subscribe((result: any) => {
        this.isSignInLoading = false;
        this.loginAttempts = 0;
      }, (error) => {
        this.isSignInLoading = false;
        this.handleFailedLogin();
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
    this.isRegistering.set(true)
  }

  startOtpCooldown() {
    const interval = setInterval(() => {
      this.otpCooldown--;
      if (this.otpCooldown <= 0) {
        clearInterval(interval);
        this.isOtpCooldownActive = false;
        this.otpCooldown = 30;
      }
    }, 1000);
  }

  handleFailedLogin() {
    this.loginAttempts++;
    if (this.loginAttempts >= 5) {
      this.isLoginBlocked = true;
      this.startLoginCooldown();
    }
  }

  startLoginCooldown() {
    const interval = setInterval(() => {
      this.loginCooldown--;
      if (this.loginCooldown <= 0) {
        clearInterval(interval);
        this.isLoginBlocked = false;
        this.loginCooldown = 30;
      }
    }, 1000);
  }
}
