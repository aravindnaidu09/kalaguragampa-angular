import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrackFacade } from '../../_state/track.facade';

@Component({
  selector: 'app-track-order',
  imports: [
    CommonModule
  ],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.scss'
})
export class TrackOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private facade = inject(TrackFacade);

  trackingSignal = this.facade.trackingSignal;
  loadingSignal = this.facade.loadingSignal;

  ngOnInit(): void {
    const deliveryId = Number(this.route.snapshot.paramMap.get('delivery_id'));
    if (isNaN(deliveryId) || deliveryId <= 0) {
      console.warn('Invalid delivery ID');
      return;
    }
    this.facade.loadTracking(deliveryId);
  }
}
