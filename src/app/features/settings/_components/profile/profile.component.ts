import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { ProfileService } from '../../_services/profile.service';
import { ProfileModel } from '../../_model/profile.model';
import { ProfileFacade } from '../../_state/profile.facade';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [ProfileService, ToastService]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private profileFacade = inject(ProfileFacade);

  userSignal = this.profileFacade.userSignal;
  loadingSignal = this.profileFacade.loadingSignal;
  errorSignal = this.profileFacade.errorSignal;

  profileForm!: FormGroup;
  formReady = signal(false);
  isEditing = false;
  profileImageUrl: string = '/assets/default-avatar.png';

  constructor() {
    // ✅ Effect to initialize form when user is loaded
    effect(() => {
      const user = this.userSignal();
      if (user && !this.profileForm) {
        this.initForm(user);
        this.formReady.set(true);
      }
    });

    // ✅ Effect to handle error toast
    effect(() => {
      const error = this.errorSignal();
      if (error) {
        this.toastService.showError(error);
      }
    });
  }

  ngOnInit(): void {
    this.loadUserWithRetry(); // ✅ Kick off load
  }

  loadUserWithRetry(): void {
    this.formReady.set(false);
    this.profileFacade.loadUser().subscribe();
  }

  private initForm(user: any): void {
    const [firstName, ...lastParts] = user.full_name?.split(' ') || [];
    const lastName = lastParts.join(' ');

    this.profileForm = this.fb.group({
      firstName: [firstName || '', Validators.required],
      lastName: [lastName || '', Validators.required],
      gender: [user.gender || '', Validators.required],
      email: [user.email || '', [Validators.required, Validators.email]],
      phone: [user.mobile || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      profileImage: [null]
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  submitSection(): void {
    const fullName = `${this.profileForm.get('firstName')?.value} ${this.profileForm.get('lastName')?.value}`;
    const payload: Partial<ProfileModel> = {
      full_name: fullName,
      gender: this.profileForm.get('gender')?.value,
      email: this.profileForm.get('email')?.value,
      mobile: this.profileForm.get('phone')?.value
    };

    this.profileFacade.updateUser(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Profile updated successfully');
        this.isEditing = false;
      },
      error: () => {
        this.toastService.showError('Failed to update profile');
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.profileImageUrl = e.target.result);
      reader.readAsDataURL(file);
      this.profileForm.patchValue({ profileImage: file });
    }
  }

  retryLoad(): void {
    this.loadUserWithRetry();
  }
}

