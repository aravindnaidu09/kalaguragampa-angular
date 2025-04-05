import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ProfileService } from '../_services/profile.service';
import { LoadUserProfile, UpdateUserProfile } from './profile.actions';
import { tap } from 'rxjs/operators';
import { ProfileModel } from '../_model/profile.model';

export interface ProfileStateModel {
  user: ProfileModel | null;
  loading: boolean;
}

@State<ProfileStateModel>({
  name: 'profile',
  defaults: {
    user: null,
    loading: false
  }
})
@Injectable()
export class ProfileState {
  constructor(private profileService: ProfileService) {}

  @Selector()
  static user(state: ProfileStateModel) {
    return state.user;
  }

  @Selector()
  static isLoading(state: ProfileStateModel) {
    return state.loading;
  }

  @Action(LoadUserProfile)
  loadUserProfile(ctx: StateContext<ProfileStateModel>) {
    ctx.patchState({ loading: true });
    return this.profileService.getUserProfile().pipe(
      tap((user) => {
        ctx.patchState({ user, loading: false });
      })
    );
  }

  @Action(UpdateUserProfile)
  updateUserProfile(ctx: StateContext<ProfileStateModel>, action: UpdateUserProfile) {
    return this.profileService.updateUserProfile(action.payload).pipe(
      tap(() => {
        const state = ctx.getState();
        ctx.patchState({ user: { ...state.user, ...action.payload } });
      })
    );
  }
}
