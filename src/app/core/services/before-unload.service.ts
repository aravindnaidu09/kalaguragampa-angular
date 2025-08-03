// before-unload.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BeforeUnloadService {
  enable(): void {
    window.addEventListener('beforeunload', this.confirmUnload);
  }

  disable(): void {
    window.removeEventListener('beforeunload', this.confirmUnload);
  }

  private confirmUnload(event: BeforeUnloadEvent): void {
    event.preventDefault();
    event.returnValue = '';
  }
}
