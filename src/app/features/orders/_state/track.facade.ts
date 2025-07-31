import { Injectable, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { TrackState } from "./track.state";
import { LoadTrackingInfo } from "./track.actions";

@Injectable({ providedIn: 'root' })
export class TrackFacade {
  private store = inject(Store);
  readonly trackingSignal = this.store.selectSignal(TrackState.status);
  readonly loadingSignal = this.store.selectSignal(TrackState.loading);

  loadTracking(deliveryId: number) {
    this.store.dispatch(new LoadTrackingInfo(deliveryId));
  }


}
