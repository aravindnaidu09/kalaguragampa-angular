import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ProfileService } from '../_services/profile.service';
import { LoadUserProfile, UpdateUserProfile } from './profile.actions';
import { catchError, tap } from 'rxjs/operators';
import { ProfileModel } from '../_model/profile.model';
import { of } from 'rxjs';

export interface ProfileStateModel {
  user: ProfileModel | null;
  loading: boolean;
  error: string | null;
}

@State<ProfileStateModel>({
  name: 'profile',
  defaults: {
    user: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class ProfileState {
  constructor(private profileService: ProfileService) { }

  @Selector()
  static user(state: ProfileStateModel) {
    return state.user;
  }

  @Selector()
  static isLoading(state: ProfileStateModel) {
    return state.loading;
  }


  @Selector()
  static error(state: ProfileStateModel) {
    return state.error;
  }

  @Action(LoadUserProfile)
  loadUserProfile(ctx: StateContext<ProfileStateModel>) {
    ctx.patchState({ loading: true, error: null });

    return this.profileService.getUserProfile().pipe(
      tap((res) => {
        ctx.patchState({ user: res, loading: false });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: 'Failed to load profile' });
        return of(err);
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
