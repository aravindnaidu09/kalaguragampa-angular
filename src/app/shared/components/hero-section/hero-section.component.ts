import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [
    CommonModule
  ],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent {
  currentIndex: number = 0;
  images: string[] = [
    '../../../../assets/images/banner1.jpg', // Replace with your image paths
    '../../../../assets/images/banner-2.jpg'
  ];

  ngOnInit() {
    this.startImageSlider();
  }

  startImageSlider() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 5000); // Change image every 5 seconds
  }
}
