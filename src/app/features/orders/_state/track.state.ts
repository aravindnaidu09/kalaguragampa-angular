import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DeliveryService } from '../../../core/services/delivery.service';
import { catchError, of, tap } from 'rxjs';
import { ClearTrackingInfo, LoadTrackingInfo } from './track.actions';
import { TrackingVM, ShiprocketTrackApi, toTrackingVM } from '../_models/tracking.model';

export interface TrackStateModel {
  /** per deliveryId cache */
  entries: Record<number, TrackingVM | null>;
  loading: Record<number, boolean>;
  error: Record<number, string | null>;
}

@State<TrackStateModel>({
  name: 'track',
  defaults: {
    entries: {},
    loading: {},
    error: {}
  }
})
@Injectable()
export class TrackState {
  constructor(private deliveryService: DeliveryService) { }

  /** Selectors */

  @Selector()
  static byId(state: TrackStateModel) {
    return (deliveryId: number): TrackingVM | null | undefined => {
      return state.entries[deliveryId];
    };
  }

  @Selector()
  static loading(state: TrackStateModel) {
    return (deliveryId: number): boolean => !!state.loading[deliveryId];
  }

  @Selector()
  static error(state: TrackStateModel) {
    return (deliveryId: number): string | null | undefined => state.error[deliveryId];
  }

  @Selector()
  static entriesMap(state: TrackStateModel) {
    return state.entries;
  }

  @Selector()
  static loadingMap(state: TrackStateModel) {
    return state.loading;
  }

  @Selector()
  static errorMap(state: TrackStateModel) {
    return state.error;
  }


  /** Actions */

  @Action(LoadTrackingInfo)
  loadTracking(ctx: StateContext<TrackStateModel>, { deliveryId }: LoadTrackingInfo) {
    const s = ctx.getState();
    ctx.patchState({
      loading: { ...s.loading, [deliveryId]: true },
      error: { ...s.error, [deliveryId]: null }
    });

    return this.deliveryService.trackDelivery(deliveryId).pipe(
      tap((res: ShiprocketTrackApi) => {
        // Handle non-200 or missing data as a negative case
        const vm = toTrackingVM(res);
        const msg =
          (!res || res.statusCode !== 200) ? (res?.message || 'Failed to fetch tracking') :
            (!res.data) ? 'No tracking data found' :
              null;

        const current = ctx.getState();
        ctx.patchState({
          entries: { ...current.entries, [deliveryId]: vm },
          loading: { ...current.loading, [deliveryId]: false },
          error: { ...current.error, [deliveryId]: msg }
        });
      }),
      catchError((err) => {
        const current = ctx.getState();
        ctx.patchState({
          loading: { ...current.loading, [deliveryId]: false },
          error: { ...current.error, [deliveryId]: err?.message || 'Network error. Please try again.' }
        });
        return of(err);
      })
    );
  }

  @Action(ClearTrackingInfo)
  clearTracking(ctx: StateContext<TrackStateModel>, { deliveryId }: ClearTrackingInfo) {
    const s = ctx.getState();
    if (deliveryId != null) {
      const { [deliveryId]: _, ...restEntries } = s.entries;
      const { [deliveryId]: __, ...restLoading } = s.loading;
      const { [deliveryId]: ___, ...restError } = s.error;
      ctx.patchState({ entries: restEntries, loading: restLoading, error: restError });
    } else {
      ctx.setState({ entries: {}, loading: {}, error: {} });
    }
  }
}
