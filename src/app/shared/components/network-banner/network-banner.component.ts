import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-network-banner',
  imports: [
    CommonModule
  ],
  templateUrl: './network-banner.component.html',
  styleUrl: './network-banner.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class NetworkBannerComponent {
  @Output() retry = new EventEmitter<void>();

  onRetry() {
    this.retry.emit();
  }
}
