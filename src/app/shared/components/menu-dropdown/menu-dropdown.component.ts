import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface MenuItem {
  label: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-menu-dropdown',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './menu-dropdown.component.html',
  styleUrl: './menu-dropdown.component.scss',
})
export class MenuDropdownComponent {
  @Input() menuItems: MenuItem[] = []; // List of menu items to display
  @Output() menuAction = new EventEmitter<MenuItem>(); // Emit selected menu item

  selectMenuItem(item: MenuItem, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Prevent event propagation for nested menus
    }
    if (!item.disabled) {
      item.action?.(); // Execute the menu item's action
      this.menuAction.emit(item); // Emit the selected menu item
    }
  }
}
