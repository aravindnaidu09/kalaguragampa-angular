export class LoadUserProfile {
  static readonly type = '[Profile] Load User Profile';
}

export class UpdateUserProfile {
  static readonly type = '[Profile] Update User Profile';
  constructor(public payload: Partial<any>) {}
}
