import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile-field',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="flex flex-col">
      <label class="block text-gray-700 font-medium text-sm mb-2">{{ label }}</label>
      <div class="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <mat-icon class="text-teal-500 text-lg mr-3 flex-shrink-0">{{ icon }}</mat-icon>
        <p class="text-gray-700 text-sm">{{ value }}</p>
      </div>
    </div>
  `
})
export class ProfileFieldComponent {
    @Input() label: string = '';
    @Input() icon: string = '';
    @Input() value: string = '';
}