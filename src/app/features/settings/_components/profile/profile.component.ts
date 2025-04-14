import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { ProfileService } from '../../_services/profile.service';
import { ProfileModel } from '../../_model/profile.model';
import { ProfileFacade } from '../../_state/profile.facade';

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
export class ProfileComponent implements OnInit{
  private authFacade = inject(ProfileFacade);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  profileImageUrl: string = '/assets/default-avatar.png';

  isEditing = false;



  ngOnInit(): void {
    this.initForm();
    this.authFacade.loadUser();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: [this.authFacade.userSignal()?.full_name?.split(' ')[0] || '', [Validators.required]],
      lastName: [this.authFacade.userSignal()?.full_name?.split(' ').slice(1).join(' ') || '', [Validators.required]],
      gender: [this.authFacade.userSignal()?.gender || '', [Validators.required]],
      email: [this.authFacade.userSignal()?.email, [Validators.required, Validators.email]],
      phone: [this.authFacade.userSignal()?.mobile, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      profileImage: [null]
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  // toggleEdit(section: keyof typeof this.isEditing): void {
  //   this.isEditing[section] = !this.isEditing[section];
  // }

  submitSection(): void {
    const fullName = `${this.profileForm.get('firstName')?.value} ${this.profileForm.get('lastName')?.value}`;
    const payload: Partial<ProfileModel> = {
      full_name: fullName,
      gender: this.profileForm.get('gender')?.value,
      email: this.profileForm.get('email')?.value,
      mobile: this.profileForm.get('phone')?.value
    };

    this.authFacade.updateUser(payload).subscribe({
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
}
