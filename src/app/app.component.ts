import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from "./shared/components/footer/footer.component";
import { DashboardComponent } from "./shared/components/dashboard/dashboard.component";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LayoutService } from './core/services/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'kalaguragampa-angular';

  showHeader$: Observable<boolean>;

  constructor(private layoutService: LayoutService) {
    this.showHeader$ = this.layoutService.showHeader$;
  }
}
