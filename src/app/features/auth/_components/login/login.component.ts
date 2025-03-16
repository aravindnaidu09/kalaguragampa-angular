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
    SigninComponent
],
})
export class LoginComponent {
  @Input() activeLoginMethod: string = 'otp';
  @Input() isVisible: boolean = false;
  @Output() closeLoginDialog = new EventEmitter<boolean>();

  isRegistering = signal<boolean>(false);

  closeDialog(event: boolean) {
    this.closeLoginDialog.emit(event);
  }

  showRegisterPage(event: boolean): void {
    this.isRegistering.set(event)
  }

  showLoginPage(event: boolean) {
    this.isRegistering.set(!event);
  }
}
