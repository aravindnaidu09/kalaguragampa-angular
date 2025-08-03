import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-us',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  paragraphs = [
    `Some say Live by choice, not by chance and others say Flow the flow. Aren’t they paradoxical?
     Well, in the initial days of our life we survived by accepting all the chances and doing our best.
     It is a flow. A couple of decades later we decided to live by our own terms and conditions, not by
     external influences. It is by choice.`,

    `Welcome to Kalagura Gampa. The life of timelessness, the life of purity, life with bliss and joy,
     and of course the life by choice.`,

    `A beautiful childhood in the countryside, innocence at play, vibrant mornings, glorious sunsets,
     and starry nights seem like a memory of past life. The gorgeous Brindavan was made into reality
     with endless struggle, persistent focus, and great support from my family. I was able to create
     my little Brindavan on the outskirts of Hyderabad just as I dreamt. The YouTube channel
     “Kalagura Gampa” was created to share my dreams, thoughts, tips for health & garden, and of course
     to share my Grandma’s recipes.`,

    `We won you and your hearts. Thank you for the unconditional love and trust we received.`,

    `We are now committed to help and support all who share common dreams and aspirations. The website
     offers various products that will elevate the appearance, improve health, add aesthetics, and most
     importantly make life simple and effortless.`,

    `A warm welcome to you. Choose the products from our catalog and we assure you the quality and purity.`
  ];
}
