import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

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
   readonly breadcrumbs = this.breadcrumbFacade.breadcrumbs;
  constructor(private breadcrumbFacade: BreadcrumbFacade) {}
}
