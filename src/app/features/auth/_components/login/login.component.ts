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

  loginOtpForm: FormGroup;
  isOtpSent: boolean = false;

  constructor(private fb: FormBuilder) {
    this.loginOtpForm = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Mobile number validation
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]], // OTP validation
    });
  }

  onSubmit() {
    if (this.loginOtpForm.valid) {
      if (!this.isOtpSent) {
        // Simulate OTP sent logic
        this.isOtpSent = true;
        alert('OTP sent successfully to your mobile number.');
      } else {
        // Simulate successful login
        alert('Logged in successfully.');
      }
    }
  }

  onRegister() {
    alert('Redirect to Registration Page');
  }

}
