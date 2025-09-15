import { Component, effect, EventEmitter, input, Output, signal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

type Particle = { angle: string; dist: string; delay: number; hue: number };

@Component({
  selector: 'app-wishlist-button',
  imports: [MatIcon],
  templateUrl: './wishlist-button.component.html',
  styleUrl: './wishlist-button.component.scss'
})
export class WishlistButtonComponent {
  /** controlled from parent */
  active = input(false, { transform: (v: any) => !!v });
  busy = input(false, { transform: (v: any) => !!v });
  disabled = input(false, { transform: (v: any) => !!v });

  /** fire confetti when active becomes true */
  showBurst = signal(false);
  particles = signal<Particle[]>([]);

  @Output() toggle = new EventEmitter<void>();

  private makeParticles(count = 10): Particle[] {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.floor(Math.random() * 360);
      const dist = 32 + Math.floor(Math.random() * 18);
      const delay = Math.floor(Math.random() * 140);
      const hue = 14 + Math.floor(Math.random() * 28); // warm palette
      arr.push({ angle: `${angle}deg`, dist: `${dist}px`, delay, hue });
    }
    return arr;
  }

  // react to active() flipping to true
  _burstFx = effect(() => {
    if (this.active() && !this.busy()) {
      this.particles.set(this.makeParticles());
      this.showBurst.set(true);
      // hide after animation (~700ms)
      setTimeout(() => this.showBurst.set(false), 720);
    }
  });

  onClick(ev: MouseEvent) {
    ev.stopPropagation(); // don’t trigger parent row/item click
    if (this.disabled() || this.busy()) return;
    this.toggle.emit();
  }
}
