import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [
    CommonModule
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  animations: [
    trigger('dialogAnimation', [
      // When dialog appears (enter)
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      // When dialog disappears (leave)
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }), // Ensure starting state
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20%)' }))
      ]),
    ]),
  ],
})
export class DialogComponent {
  @Input() isVisible: boolean = false; // Control dialog visibility
  @Input() dialogTitle: string = ''; // Title of the dialog
  @Input() contentTemplate?: TemplateRef<any>; // Custom content inside the dialog
  @Output() closeDialog = new EventEmitter<void>(); // Emit event to close the dialog

  dialogClosing: boolean = false;

  close(): void {
    this.dialogClosing = true; // ✅ Start closing animation
    setTimeout(() => {
      this.isVisible = false;
      this.dialogClosing = false; // ✅ Reset after animation
      this.closeDialog.emit();
    }, 300); // Match this with animation duration (300ms)
  }
}
