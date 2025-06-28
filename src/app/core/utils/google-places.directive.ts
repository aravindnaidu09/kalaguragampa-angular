import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[appGooglePlaces]',
})
export class GooglePlacesDirective implements AfterViewInit {
  @Output() placeChanged = new EventEmitter<google.maps.places.PlaceResult>();

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    const options = {
      types: ['geocode'],
      componentRestrictions: { country: 'IN' }
    };

    const autocomplete = new google.maps.places.Autocomplete(
      this.el.nativeElement,
      options
    );

    autocomplete.addListener('place_changed', () => {
      const place: google.maps.places.PlaceResult = autocomplete.getPlace();
      this.placeChanged.emit(place);
    });
  }
}
