import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-hero-section',
  imports: [
    CommonModule
  ],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  currentIndex: number = 0;
  private intervalId: any;
  private sliderSub!: Subscription;
  images: string[] = [
    '../../../../assets/images/banner1.jpg', // Replace with your image paths
    '../../../../assets/images/banner-2.jpg'
  ];

  ngOnInit() {
    this.startImageSlider();
  }

  startImageSlider() {
    this.sliderSub = timer(0, 5000).subscribe(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    });
  }

  ngOnDestroy() {
    this.sliderSub?.unsubscribe();
  }
}
