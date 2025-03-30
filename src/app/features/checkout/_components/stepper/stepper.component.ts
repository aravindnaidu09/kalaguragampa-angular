import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';

@Component({
  selector: 'app-stepper',
  imports: [
    CommonModule,
    MatStepperModule
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {
  @Input() steps: string[] = [];
  @Input() currentStep = 0;

  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  goToNextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.next.emit();
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 0) {
      this.prev.emit();
    }
  }
}
