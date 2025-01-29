import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-dropdown',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './select-dropdown.component.html',
  styleUrl: './select-dropdown.component.scss'
})
export class SelectDropdownComponent implements OnInit {
  @Input() options: { label: string; value: any }[] = []; // Dropdown options
  @Input() placeholder: string = 'Select an option'; // Placeholder text
  @Input() selectedValue: any; // Pre-selected value
  @Input() disabled: boolean = false; // Disable the dropdown

  @Output() selectionChange = new EventEmitter<any>(); // Emits the selected value

  isOpen: boolean = false; // Dropdown open/close state
  filteredOptions: { label: string; value: any }[] = []; // Options for filtering
  searchQuery: string = ''; // Search input value

  @ViewChild('searchInput') searchInput!: ElementRef;

  ngOnInit(): void {
    this.filteredOptions = this.options; // Initialize options
  }

  get displayValue(): string {
    if (this.selectedValue) {
      const selectedOption = this.options.find(o => o.value === this.selectedValue);
      return selectedOption?.label || this.placeholder;
    }
    return this.placeholder;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        setTimeout(() => this.searchInput?.nativeElement.focus(), 0); // Focus search input when opened
      }
    }
  }

  selectOption(option: { label: string; value: any }): void {
    this.selectedValue = option.value;
    this.isOpen = false;
    this.selectionChange.emit(option.value); // Emit selected value
  }

  filterOptions(): void {
    this.filteredOptions = this.options.filter((option) =>
      option.label.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    if (!this.searchInput?.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
    }
  }
}
