import { Component, Input, signal } from '@angular/core';
import { IProductReview } from '../../../_models/product-review';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-review-card',
  imports: [
    CommonModule,
    MatIcon
],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss',
  animations: [
    trigger('countChange', [
      transition(':increment', [
        style({ transform: 'scale(1.3)', opacity: 0.7 }),
        animate('150ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('voteClickAnimation', [
      transition(':enter', []), // prevents error
      transition('* => *', [
        style({ transform: 'scale(1)' }),
        animate('100ms ease-in', style({ transform: 'scale(1.05)' })),
        animate('100ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ReviewCardComponent {
  @Input() review: IProductReview = {};

  helpfulCount = signal(0);
  notHelpfulCount = signal(0);
  userVote = signal<'helpful' | 'notHelpful' | null>(null);

  get formattedDate(): string {
    return new Date(this.review.createdAt!).toLocaleDateString();
  }

  getStars(): number[] {
    return Array(this.review.rating).fill(0);
  }

  markHelpful(): void {
    if (this.userVote() === 'helpful') return;

    if (this.userVote() === 'notHelpful') {
      this.notHelpfulCount.update(v => v - 1);
    }

    this.helpfulCount.update(v => v + 1);
    this.userVote.set('helpful');
  }

  markNotHelpful(): void {
    if (this.userVote() === 'notHelpful') return;

    if (this.userVote() === 'helpful') {
      this.helpfulCount.update(v => v - 1);
    }

    this.notHelpfulCount.update(v => v + 1);
    this.userVote.set('notHelpful');
  }
}
