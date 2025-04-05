import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
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
export class ProfileComponent {
  private authFacade = inject(ProfileFacade);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  profileImageUrl: string = '/assets/default-avatar.png';

  isEditing = {
    personal: false,
    email: false,
    phone: false
  };

  ngOnInit(): void {
    this.initForm();
    this.authFacade.loadUser();

    effect(() => {
      const user = this.authFacade.userSignal();
      if (user) this.patchForm(user);
    });
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      gender: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      profileImage: [null]
    });
  }

  private patchForm(user: ProfileModel): void {
    const [firstName, ...rest] = user.full_name?.split(' ') ?? [''];
    const lastName = rest.join(' ');

    this.profileForm.patchValue({
      firstName,
      lastName,
      gender: user.gender,
      email: user.email,
      phone: user.phone
    });

    this.profileImageUrl = user.profileImage || this.profileImageUrl;
  }

  toggleEdit(section: keyof typeof this.isEditing): void {
    this.isEditing[section] = !this.isEditing[section];
  }

  submitSection(section: 'personal' | 'email' | 'phone'): void {
    let payload: Partial<ProfileModel> = {};

    if (section === 'personal') {
      const fullName = `${this.profileForm.get('firstName')?.value} ${this.profileForm.get('lastName')?.value}`;
      payload = {
        full_name: fullName,
        gender: this.profileForm.get('gender')?.value
      };
    } else if (section === 'email') {
      payload = { email: this.profileForm.get('email')?.value };
    } else if (section === 'phone') {
      payload = { phone: this.profileForm.get('phone')?.value };
    }

    this.authFacade.updateUser(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Profile updated successfully');
        this.toggleEdit(section);
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
