// breadcrumb.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, Input, computed, inject, signal
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbItem } from './../../_models/breadcrumb.model';
import { BreadcrumbFacade } from '../../../core/state/breadcrumb.facade';

type CollapseMode = 'none' | 'middle';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  private readonly facade = inject(BreadcrumbFacade);

  /**
   * Optional override from parent. If not provided, we read from facade.
   * Keep as a signal for easy computed transforms.
   */
  private _inputCrumbs = signal<BreadcrumbItem[] | null>(null);
  @Input() set items(v: BreadcrumbItem[] | null | undefined) {
    this._inputCrumbs.set(v ?? null);
  }

  /** Collapsing long trails, default ‘middle’ (Home › … › Category › Product) */
  @Input() collapse: CollapseMode = 'middle';
  /** Keep at most this many items when collapsing (min 3) */
  @Input() maxItems = 4;

  /** Source of truth: either input or facade */
  readonly crumbs = computed(() => this._inputCrumbs() ?? this.facade.breadcrumbs());

  /** Collapsed view for rendering */
  readonly viewCrumbs = computed<BreadcrumbItem[]>(() => {
    const list = this.crumbs() ?? [];
    if (this.collapse === 'none' || list.length <= this.maxItems || this.maxItems < 3) {
      return list;
    }
    // collapse 'middle': keep first, last (maxItems - 2) tail items with an ellipsis marker in between
    const head = list[0];
    const tailCount = this.maxItems - 2;
    const tail = list.slice(-tailCount);
    return [
      head,
      { label: '…' }, // ellipsis marker (non-clickable)
      ...tail
    ];
  });

  /** For schema.org microdata position */
  positionAt = (index: number) => index + 1;

  /** Whether crumb is interactive (has a URL) */
  isLink = (c: BreadcrumbItem) => !!c.url && c.label !== '…';
}
