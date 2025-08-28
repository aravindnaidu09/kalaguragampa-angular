import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private router = inject(Router);
  private facade = inject(TrackFacade);

  trackingSignal = this.facade.trackingSignal;
  loadingSignal = this.facade.loadingSignal;
  errorSignal = this.facade.errorSignal;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('delivery_id') ?? this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!raw || Number.isNaN(id) || id <= 0) {
      this.router.navigate(['/orders']);
      return;
    }
    this.facade.loadTracking(id);
  }

  // "YYYY-MM-DD HH:mm:ss" -> Date for Angular date pipe
  toDate(val?: string | null): Date | null {
    if (!val) return null;
    const d = new Date(val.replace(' ', 'T')); // keep local TZ behavior
    return isNaN(d.getTime()) ? null : d;
  }

  retry() {
    const t = this.trackingSignal();
    if (t?.deliveryId) this.facade.loadTracking(t.deliveryId);
  }
}
