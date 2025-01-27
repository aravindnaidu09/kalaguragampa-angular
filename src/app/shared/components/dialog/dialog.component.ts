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
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20%)' })),
      ]),
    ]),
  ],
})
export class DialogComponent {
  @Input() isVisible: boolean = false; // Control dialog visibility
  @Input() dialogTitle: string = ''; // Title of the dialog
  @Input() contentTemplate?: TemplateRef<any>; // Custom content inside the dialog
  @Output() closeDialog = new EventEmitter<void>(); // Emit event to close the dialog

  close(): void {
    this.isVisible = false;
    this.closeDialog.emit();
  }
}
