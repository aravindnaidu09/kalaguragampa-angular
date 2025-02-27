import { State, Action, StateContext, Selector } from '@ngxs/store';

// ✅ Actions for OTP Handling
export class SetOtpRequested {
  static readonly type = '[OTP] Set Requested';
}

export class ResetOtpState {
  static readonly type = '[OTP] Reset State';
}

export class StartOtpCooldown {
  static readonly type = '[OTP] Start Cooldown';
}

export class SetResendAvailable {
  static readonly type = '[OTP] Set Resend Available';
}

// ✅ State Model
export interface OtpStateModel {
  otpRequested: boolean;
  canResendOtp: boolean;
  otpCooldown: number;
  isCooldownRunning: boolean;
}

// ✅ NGXS State
@State<OtpStateModel>({
  name: 'otp',
  defaults: {
    otpRequested: false,
    canResendOtp: false,
    otpCooldown: 30, // Default cooldown in seconds
    isCooldownRunning: false,
  }
})
export class OtpState {
  // ✅ Selectors
  @Selector()
  static isOtpRequested(state: OtpStateModel): boolean {
    return state.otpRequested;
  }

  @Selector()
  static canResendOtp(state: OtpStateModel): boolean {
    return state.canResendOtp;
  }

  @Selector()
  static getOtpCooldown(state: OtpStateModel): number {
    return state.otpCooldown;
  }

  @Selector()
  static isCooldownRunning(state: OtpStateModel): boolean {
    return state.isCooldownRunning;
  }

  // ✅ Set OTP as Requested
  @Action(SetOtpRequested)
  setOtpRequested(ctx: StateContext<OtpStateModel>) {
    ctx.patchState({ otpRequested: true, canResendOtp: false, isCooldownRunning: true });
    ctx.dispatch(new StartOtpCooldown()); // ✅ Start cooldown automatically
  }

  // ✅ Start Cooldown Timer
  @Action(StartOtpCooldown)
  startOtpCooldown(ctx: StateContext<OtpStateModel>) {
    const state = ctx.getState();
    if (state.isCooldownRunning) return; // ✅ Prevent multiple timers

    let countdown = 30;
    ctx.patchState({ otpCooldown: countdown, isCooldownRunning: true });

    const interval = setInterval(() => {
      const currentState = ctx.getState();
      if (!currentState.isCooldownRunning) {
        clearInterval(interval); // ✅ Stop if state is reset
        return;
      }

      if (countdown > 0) {
        ctx.patchState({ otpCooldown: countdown });
        countdown--;
      } else {
        clearInterval(interval);
        ctx.patchState({ canResendOtp: true, otpCooldown: 0, isCooldownRunning: false });
      }
    }, 1000);
  }

  // ✅ Allow Resend OTP
  @Action(SetResendAvailable)
  setResendAvailable(ctx: StateContext<OtpStateModel>) {
    ctx.patchState({ canResendOtp: true, isCooldownRunning: false });
  }

  // ✅ Reset OTP State when user closes dialog or logs out
  @Action(ResetOtpState)
  resetOtpState(ctx: StateContext<OtpStateModel>) {
    ctx.setState({
      otpRequested: false,
      canResendOtp: false,
      otpCooldown: 30,
      isCooldownRunning: false,
    });
  }
}
