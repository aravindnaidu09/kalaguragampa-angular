import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Address } from '../../../settings/_model/address-model';
import { AddressService } from '../../../settings/_services/address.service';

@Component({
  selector: 'app-selected-address-card',
  imports: [
    CommonModule
  ],
  templateUrl: './selected-address-card.component.html',
  styleUrl: './selected-address-card.component.scss'
})
export class SelectedAddressCardComponent {
  @Input() selectedAddress: Address | null = null;
  @Output() openChangeDialog = new EventEmitter<void>();
  @Output() openAddDialog = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onChangeAddress(): void {
    this.openChangeDialog.emit();
  }

  onAddAddress(): void {
    this.openAddDialog.emit();
  }
}
