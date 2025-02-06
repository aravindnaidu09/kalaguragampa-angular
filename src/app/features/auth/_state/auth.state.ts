import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AuthStateModel } from '../_models/auth';

export class SetToken {
  static readonly type = '[Auth] Set Token';
  constructor(public token: string) {}
}

export class ClearToken {
  static readonly type = '[Auth] Clear Token';
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    token: null
  }
})
export class AuthState {
  @Selector()
  static getToken(state: AuthStateModel) {
    return state.token;
  }

  @Action(SetToken)
  setToken(ctx: StateContext<AuthStateModel>, action: SetToken) {
    ctx.patchState({ token: action.token });
  }

  @Action(ClearToken)
  clearToken(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ token: null });
  }
}
