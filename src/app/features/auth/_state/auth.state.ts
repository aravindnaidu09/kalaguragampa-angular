import { State, Action, StateContext, Selector } from '@ngxs/store';

export interface AuthStateModel {
  accessToken: string | null;
  refreshToken: string | null;
}

export class SetToken {
  static readonly type = '[Auth] Set Token';
  constructor(public accessToken: string, public refreshToken: string) {}
}

export class ClearToken {
  static readonly type = '[Auth] Clear Token';
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null
  }
})
export class AuthState {
  @Selector()
  static getAccessToken(state: AuthStateModel): string | null {
    return state.accessToken;
  }

  @Selector()
  static getRefreshToken(state: AuthStateModel): string | null {
    return state.refreshToken;
  }

  @Action(SetToken)
  setToken(ctx: StateContext<AuthStateModel>, action: SetToken) {
    ctx.patchState({
      accessToken: action.accessToken,
      refreshToken: action.refreshToken
    });
  }

  @Action(ClearToken)
  clearToken(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      accessToken: null,
      refreshToken: null
    });
  }
}
