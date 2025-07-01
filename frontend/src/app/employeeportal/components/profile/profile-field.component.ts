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

    // Updated icon color mapping with #9A5FC0 theme for Employee context
    iconColorMap: { [key: string]: string } = {
        mail: 'text-blue-500',
        phone: 'text-[#9A5FC0]',
        event: 'text-pink-500',
        person: 'text-[#9A5FC0]',
        workspace_premium: 'text-yellow-500',
        access_time: 'text-red-500',
        location_on: 'text-[#9A5FC0]',
        fax: 'text-[#9A5FC0]',
        flag: 'text-[#9A5FC0]',
        markunread_mailbox: 'text-[#9A5FC0]',
        search: 'text-[#9A5FC0]',
        business: 'text-[#9A5FC0]',
        location_city: 'text-[#9A5FC0]',
        group: 'text-[#9A5FC0]',
        group_add: 'text-[#9A5FC0]',
        key: 'text-[#9A5FC0]',
        account_balance: 'text-[#9A5FC0]',
        supervisor_account: 'text-[#9A5FC0]',
        update: 'text-[#9A5FC0]' // Added for lastUpdated field
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