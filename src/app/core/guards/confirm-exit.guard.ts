// confirm-exit.guard.ts
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

export interface ConfirmExit {
  canExit: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class ConfirmExitGuard implements CanDeactivate<ConfirmExit> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(component: ConfirmExit): Observable<boolean> {
    const result = component.canExit();
    return typeof result === 'boolean' ? of(result) : result;
  }
}
