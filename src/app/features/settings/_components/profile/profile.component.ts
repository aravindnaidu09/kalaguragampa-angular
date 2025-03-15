import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { ProfileService } from '../../_services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [ProfileService, ToastService]
})
export class ProfileComponent {
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  profileImageUrl: string = '/assets/default-avatar.png'; // Default image

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
  }

  // ✅ Initialize Form
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      profileImage: [null]
    });
  }

  // ✅ Load User Profile Data
  private loadUserProfile(): void {
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          name: data.name,
          email: data.email,
          phone: data.phone
        });
        this.profileImageUrl = data.profileImage || this.profileImageUrl;
      },
      error: () => this.toastService.showError('Failed to load profile')
    });
  }

  // ✅ Handle Profile Image Upload
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.profileImageUrl = e.target.result);
      reader.readAsDataURL(file);
      this.profileForm.patchValue({ profileImage: file });
    }
  }

  // ✅ Save Profile Changes
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.toastService.showError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.profileForm.get('name')!.value);
    formData.append('email', this.profileForm.get('email')!.value);
    formData.append('phone', this.profileForm.get('phone')!.value);

    if (this.profileForm.get('profileImage')!.value) {
      formData.append('profileImage', this.profileForm.get('profileImage')!.value);
    }

    this.profileService.updateUserProfile(formData).subscribe({
      next: () => this.toastService.showSuccess('Profile updated successfully'),
      error: () => this.toastService.showError('Failed to update profile')
    });
  }
}
