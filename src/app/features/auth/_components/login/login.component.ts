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
import { SigninComponent } from "../signin/signin.component";
import { ChangePasswordComponent } from "../change-password/change-password.component";
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [OtpService, MenuService, AuthService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SignUpComponent,
    SigninComponent,
    ForgotPasswordComponent
],
})
export class LoginComponent {
  @Input() activeLoginMethod: string = 'otp';
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();

  isRegistering = signal<boolean>(false);
  isForgotPassword = signal<boolean>(false);

  closeDialog(event: boolean) {
    this.closeLoginDialog.emit(event);
  }

  showRegisterPage(event: boolean): void {
    this.isRegistering.set(event)
  }

  showLoginPage(event: boolean) {
    this.isRegistering.set(!event);
  }

  showForgotPassword(event: boolean) {
    this.isRegistering.set(false);
    this.isForgotPassword.set(event);
  }

  showPasswordLoginMethod() {
    this.activeLoginMethod = 'password';
    this.isRegistering.set(false);
    this.isForgotPassword.set(false);
  }
}
