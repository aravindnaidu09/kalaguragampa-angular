import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from "./shared/components/footer/footer.component";
import { DashboardComponent } from "./shared/components/dashboard/dashboard.component";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LayoutService } from './core/services/layout.service';
import { CommonModule } from '@angular/common';
import { NetworkService } from './core/services/network.service';
import { NetworkBannerComponent } from './shared/components/network-banner/network-banner.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NetworkBannerComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'kalaguragampa-angular';

  showHeader$: Observable<boolean>;
  isOffline = false;
  showBanner = false;

  constructor(private layoutService: LayoutService,
    private readonly networkService: NetworkService
  ) {
    this.showHeader$ = this.layoutService.showHeader$;

    this.networkService.isOnline().subscribe((online) => {
      if (!online) {
        this.isOffline = true;
        this.showBanner = true;
      } else {
        this.isOffline = false;
        // 👇 Auto-hide banner after 3 seconds
        setTimeout(() => {
          this.showBanner = false;
        }, 3000);
      }
    });
  }

  onRetryNetwork() {
    window.location.reload(); // or trigger any fallback logic
  }
}
