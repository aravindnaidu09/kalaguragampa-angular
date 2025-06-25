// src/app/shared/directives/google-places.directive.ts
import {
  Directive,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output
} from '@angular/core';

declare const google: any;

@Directive({
  selector: '[appGooglePlaces]'
})
export class GooglePlacesDirective implements OnInit {
  @Output() placeChanged = new EventEmitter<google.maps.places.PlaceResult>();

  private autocomplete!: google.maps.places.Autocomplete;

  constructor(private elRef: ElementRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.autocomplete = new google.maps.places.Autocomplete(this.elRef.nativeElement, {
      types: ['geocode'] // or 'address' or ['establishment']
    });

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
        this.placeChanged.emit(place);
      });
    });
  }
}
