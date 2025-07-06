import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
isScreenBetween996And400: boolean = false;
  currentYear = new Date().getFullYear();

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.checkScreenWidth();
    window.addEventListener('resize', () => {
      this.checkScreenWidth();
    });
  }
 @HostListener('window:resize', [])
  onResize() {
    this.checkScreenWidth();
  }

  private checkScreenWidth() {
    const width = window.innerWidth;
    this.isScreenBetween996And400 = width <= 724 && width >= 400;
  }
  goToPolicyPage(route: string) {
    this.router.navigate([route])
  }
}
