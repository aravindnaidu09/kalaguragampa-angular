import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { OtpService } from '../../_services/otp.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',

})
export class ForgotPasswordComponent {
  step = signal<'otp' | 'reset'>('otp');
  loading = signal(false);
  cooldown = signal(0);
  hidePassword = signal(true);
  hideConfirm = signal(true);

  form!: FormGroup;

  isRegisterPage = signal<boolean>(false);
  @Output() showRegisterPage = new EventEmitter<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private cdRef: ChangeDetectorRef,
    private otpService: OtpService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      otp_type: ['email', Validators.required],
      email: ['', [Validators.email]],
      mobile: [''],
      otp: ['', []],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    }, { validators: this.passwordsMatchValidator });


    this.form.get('otp_type')?.valueChanges.subscribe(() => {
      this.form.get('email')?.reset();
      this.form.get('mobile')?.reset();
    });
  }

  passwordsMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  sendOtp() {
    const { otp_type, email, mobile } = this.form.value;

    if (otp_type === 'email' && !email) {
      this.toast.showWarning('Please enter a valid email');
      return;
    }

    if (otp_type === 'mobile' && !mobile) {
      this.toast.showWarning('Please enter a valid mobile number');
      return;
    }

    this.loading.set(true);

    const identifier = otp_type === 'email' ? email : mobile;

    this.otpService.sendOtp(identifier, otp_type, '91').subscribe({
      next: () => {
        this.toast.showSuccess('OTP sent successfully');
        this.step.set('reset');
        this.startCooldown();
      },
      error: (err: any) => {
        this.toast.showError(err?.error?.message || 'Failed to send OTP');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  resetPassword() {
    if (this.form.invalid) {
      this.toast.showWarning('Please fill all fields correctly');
      return;
    }

    const { otp_type, email, mobile, otp, password, confirm_password } = this.form.value;

    // Construct payload based on selected OTP type
    const payload: any = {
      otp_type,
      otp,
      password,
      confirm_password
    };

    if (otp_type === 'email') {
      payload.email = email;
    } else if (otp_type === 'mobile') {
      payload.mobile = mobile;
    }

    this.loading.set(true);
    this.authService.forgotPassword(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Password reset successful!');
        this.resetForm();
        // this.router.navigate(['/login']); // optionally redirect
      },
      error: (err: any) => {
        this.toast.showError(err?.error?.message || 'Reset failed');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  resetForm() {
    this.form.reset();
  }

  startCooldown() {
    this.cooldown.set(30);
    const interval = setInterval(() => {
      this.cooldown.update(v => {
        if (v <= 1) {
          clearInterval(interval);
          return 0;
        }
        this.cdRef.detectChanges();
        return v - 1;
      });
    }, 1000);
  }

  toggleHidePassword() {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleHideConfirm() {
    this.hideConfirm.set(!this.hideConfirm());
  }

  goBackToLogin() {
    this.isRegisterPage.set(true);
    this.showRegisterPage.emit(this.isRegisterPage());
  }

}
