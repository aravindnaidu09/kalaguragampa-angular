import { Injectable, computed, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadUserProfile, UpdateUserProfile } from './profile.actions';
import { ProfileState } from './profile.state';

@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  private store = inject(Store);

  readonly userSignal = this.store.selectSignal(ProfileState.user);
  readonly loadingSignal = this.store.selectSignal(ProfileState.isLoading);

  loadUser() {
    this.store.dispatch(new LoadUserProfile());
  }

  updateUser(payload: Partial<any>) {
    return this.store.dispatch(new UpdateUserProfile(payload));
  }
}
