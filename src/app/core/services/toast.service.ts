import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private readonly snackBar: MatSnackBar) {}

  /**
   * Show a toast message
   * @param message The message to display
   * @param action Optional action text (e.g., "Close")
   * @param config Optional configuration for snackbar
   */
  private showToast(message: string, action: string = 'Close', config?: MatSnackBarConfig) {
    this.snackBar.open(message, action, {
      duration: config?.duration || 3000, // Default to 3 seconds
      verticalPosition: config?.verticalPosition || 'bottom',
      horizontalPosition: config?.horizontalPosition || 'center',
      panelClass: config?.panelClass || '',
    });
  }

  /**
   * Show success message
   * @param message The success message to display
   */
  showSuccess(message: string) {
    this.showToast(message, 'Close', { panelClass: 'toast-success' });
  }

  /**
   * Show error message
   * @param message The error message to display
   */
  showError(message: string) {
    this.showToast(message, 'Close', { panelClass: 'toast-error' });
  }

  /**
   * Show warning message
   * @param message The warning message to display
   */
  showWarning(message: string) {
    this.showToast(message, 'Close', { panelClass: 'toast-warning' });
  }

  /**
   * Show info message
   * @param message The info message to display
   */
  showInfo(message: string) {
    this.showToast(message, 'Close', { panelClass: 'toast-info' });
  }

}
