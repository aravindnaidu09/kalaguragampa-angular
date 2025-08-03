import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-session-expired',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './session-expired.component.html',
  styleUrl: './session-expired.component.scss'
})
export class SessionExpiredComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private dialogRef: MatDialogRef<SessionExpiredComponent>
  ) { }

  close(action: 'home' | 'retry') {
    this.dialogRef.close(action);
  }
}
