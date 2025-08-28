// track.facade.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadTrackingInfo, ClearTrackingInfo } from './track.actions';
import { TrackState } from './track.state';
import { TrackingVM } from '../_models/tracking.model';

@Injectable({ providedIn: 'root' })
export class TrackFacade {
  private store = inject(Store);

  private currentDeliveryId = signal<number | null>(null);

  // reactive signals from store (no snapshots)
  private entriesSig     = this.store.selectSignal(TrackState.entriesMap);
  private loadingMapSig  = this.store.selectSignal(TrackState.loadingMap);
  private errorMapSig    = this.store.selectSignal(TrackState.errorMap);

  readonly trackingSignal = computed<TrackingVM | null | undefined>(() => {
    const id = this.currentDeliveryId();
    if (id == null) return null;
    return this.entriesSig()?.[id];
  });

  readonly loadingSignal = computed<boolean>(() => {
    const id = this.currentDeliveryId();
    if (id == null) return false;
    return !!this.loadingMapSig()?.[id];
  });

  readonly errorSignal = computed<string | null | undefined>(() => {
    const id = this.currentDeliveryId();
    if (id == null) return null;
    return this.errorMapSig()?.[id] ?? null;
  });

  setDeliveryId(deliveryId: number) {
    this.currentDeliveryId.set(deliveryId);
  }

  loadTracking(deliveryId: number) {
    this.setDeliveryId(deliveryId);
    return this.store.dispatch(new LoadTrackingInfo(deliveryId));
  }

  clear(deliveryId?: number) {
    return this.store.dispatch(new ClearTrackingInfo(deliveryId));
  }
}
