import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BreadcrumbFacade } from '../../../core/state/breadcrumb.facade';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string; // Optional Material icon name
}

@Component({
  selector: 'app-breadcrumb',
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  private breadCrumbFacade = inject(BreadcrumbFacade);
  readonly breadcrumbs = this.breadCrumbFacade.breadcrumbs;
}
