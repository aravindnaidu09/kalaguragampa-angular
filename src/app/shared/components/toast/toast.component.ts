import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';


export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  actionText?: string;
  actionCallback?: () => void;
}


@Component({
  selector: 'app-toast',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastData,
    private snackRef: MatSnackBarRef<ToastComponent>
  ) { }

  handleAction(): void {
    if (this.data.actionCallback) this.data.actionCallback();
    this.snackRef.dismiss();
  }

  close(): void {
    this.snackRef.dismiss();
  }
}
