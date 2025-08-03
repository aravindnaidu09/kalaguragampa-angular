import { Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { ToastService } from "./toast.service";

@Injectable({ providedIn: 'root' })
export class CheckoutFlowService {
  private redirectTimer: any;
  public countdown = signal(0);

  constructor(private router: Router, private toast: ToastService) {}

  startDisruptionHandler(redirectTo = '/'): void {
    this.countdown.set(5);
    this.toast.showError('Checkout flow interrupted. Redirecting to home...');

    this.redirectTimer = setInterval(() => {
      this.countdown.update(v => v - 1);
      if (this.countdown() <= 0) {
        clearInterval(this.redirectTimer);
        this.router.navigate([redirectTo]);
      }
    }, 1000);
  }

  cleanup(): void {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
  }
}
