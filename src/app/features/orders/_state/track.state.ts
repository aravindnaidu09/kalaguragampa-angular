import { Injectable } from "@angular/core";
import { State, Action, StateContext, Selector } from "@ngxs/store";
import { tap, catchError, of } from "rxjs";
import { DeliveryService } from "../../../core/services/delivery.service";
import { LoadTrackingInfo } from "./track.actions";

export interface TrackStateModel {
  status: any | null;
  loading: boolean;
  error: string | null;
}

@State<TrackStateModel>({
  name: 'track',
  defaults: {
    status: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class TrackState {
  constructor(private trackService: DeliveryService) { }

  @Selector()
  static status(state: TrackStateModel): any | null {
    return state.status;
  }

  @Selector()
  static loading(state: TrackStateModel): boolean {
    return state.loading;
  }

  @Action(LoadTrackingInfo)
  loadTrackingInfo(ctx: StateContext<TrackStateModel>, action: LoadTrackingInfo) {
    ctx.patchState({ loading: true });

    return this.trackService.trackDelivery(action.deliveryId).pipe(
      tap((res) => {
        ctx.patchState({
          status: res,
          loading: false,
          error: null
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error?.message || 'Failed to load tracking info'
        });
        return of(error);
      })
    );
  }



}
