import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastComponent, ToastData } from '../../shared/components/toast/toast.component';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom' | 'left' | 'right' | 'center';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private lastMessage = '';
  private lastToastTime = 0;
  private duplicateTimeout = 1500; // prevent repeat for this duration

  constructor(private snackBar: MatSnackBar) {}

  showToast(
    message: string,
    type: ToastType = 'info',
    actionText?: string,
    actionCallback?: () => void,
    duration: number = 4000,
    position: ToastPosition = 'top-right'
  ) {
    // 🛑 Prevent duplicate messages
    const now = Date.now();
    if (message === this.lastMessage && now - this.lastToastTime < this.duplicateTimeout) return;
    this.lastMessage = message;
    this.lastToastTime = now;

    const data: ToastData = { message, type, actionText, actionCallback };
    const config: MatSnackBarConfig = {
      duration,
      data,
      horizontalPosition: position.includes('right') ? 'right' : 'left',
      verticalPosition: position.includes('top') ? 'top' : 'bottom',
      panelClass: ['custom-toast', 'no-snackbar-bg']
    };

    this.snackBar.openFromComponent(ToastComponent, config);
  }

  // Convenience methods
  showSuccess(message: string, opts?: Partial<{ duration: number; position: ToastPosition }>) {
    this.showToast(message, 'success', undefined, undefined, opts?.duration, opts?.position);
  }

  showError(message: string, opts?: Partial<{ duration: number; position: ToastPosition }>) {
    this.showToast(message, 'error', undefined, undefined, opts?.duration, opts?.position);
  }

  showWarning(message: string, opts?: Partial<{ duration: number; position: ToastPosition }>) {
    this.showToast(message, 'warning', undefined, undefined, opts?.duration, opts?.position);
  }

  showInfo(message: string, opts?: Partial<{ duration: number; position: ToastPosition }>) {
    this.showToast(message, 'info', undefined, undefined, opts?.duration, opts?.position);
  }
}
