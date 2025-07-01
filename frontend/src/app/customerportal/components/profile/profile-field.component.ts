import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-field',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div>
      <label class="block text-gray-600 font-medium text-sm mb-1.5">{{ label }}</label>
      <div class="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <mat-icon [ngClass]="iconColorMap[icon] || 'text-gray-400'" class="text-base mr-2.5 flex-shrink-0">
          {{ icon }}
        </mat-icon>
        <span
          [ngClass]="{
            'text-gray-700': displayValue !== defaultValue,
            'text-gray-400 italic': displayValue === defaultValue
          }"
          class="text-sm"
        >
          {{ displayValue }}
        </span>
      </div>
    </div>
  `,
})
export class ProfileFieldComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() value: string | undefined | null = '';
  @Input() defaultValue = 'Not available'; // Custom default value

  // Getter to handle undefined/null values
  get displayValue(): string {
    return this.value ?? this.defaultValue;
  }

  // Updated icon color mapping for consistency with the overall UI
  iconColorMap: { [key: string]: string } = {
    mail: 'text-blue-500',
    phone: 'text-teal-500',
    event: 'text-pink-500',
    person: 'text-teal-500',
    workspace_premium: 'text-yellow-500',
    access_time: 'text-red-500',
    location_on: 'text-teal-500',
    fax: 'text-teal-500', // Updated to match the teal theme
    flag: 'text-teal-500', // Added for country field
    markunread_mailbox: 'text-teal-500', // Added for postal code field
    search: 'text-teal-500' // Added for search term field
  };

  // Deprecated - can be removed if not used elsewhere
  get iconClass() {
    switch (this.icon) {
      case 'mail': return 'fas fa-envelope';
      case 'phone': return 'fas fa-phone';
      case 'calendar': return 'fas fa-calendar-alt';
      case 'user': return 'fas fa-user';
      case 'star': return 'fas fa-star';
      case 'clock': return 'fas fa-clock';
      default: return '';
    }
  }
}