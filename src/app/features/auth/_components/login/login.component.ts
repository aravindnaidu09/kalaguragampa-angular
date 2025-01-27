import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtpService } from '../../_services/otp.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [OtpService]
})
export class LoginComponent {
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();

  isRegistering: boolean = false;
  activeOption: string = 'otp';

  loginForm: FormGroup;
  loginPasswordForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    this.loginPasswordForm = this.fb.group({
      emailOrMobile: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    });
  }

  setActiveOption(option: string) {
    this.activeOption = option;
  }

  onSendOtp() {
    if (this.loginForm.valid) {
      alert('OTP Sent');
    }
  }

  onPasswordLogin() {
    if (this.loginPasswordForm.valid) {
      alert('Login Successful');
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      alert('Registration Successful');
    }
  }

  switchToRegister(event: Event) {
    event.preventDefault();
    this.isRegistering = true;
  }

  switchToLogin(event: Event) {
    event.preventDefault();
    this.isRegistering = false;
  }

  closeDialog() {
    this.closeLoginDialog.emit(true);
  }

}
