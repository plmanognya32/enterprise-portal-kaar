import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileFieldComponent } from './profile-field.component';
import { MatIconModule } from '@angular/material/icon';
import { CustomernavbarComponent } from '../customernavbar/customernavbar.component';
import { ProfileService } from './profile.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ProfileFieldComponent, MatIconModule, CustomernavbarComponent, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  customerProfile: {
    customerId: string;
    name: string;
    phone?: string;
    fax?: string;
    address?: string;
    user_type?: string;
    country?: string;
    postalCode?: string;
    searchTerm?: string;
  } | null = null;

  loading = true;
  error: string | null = null;

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.error = null;

    const customerId = localStorage.getItem("customer-id") || '';
    //const customerId = '0000000008';

    this.profileService.getProfile(customerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.customerProfile = response.profile;
        }
        else {
          this.error = "Failed to fetch profile";
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = "Error connecting to server";
        this.loading = false;
        console.error("Profile load error:", err);
      }
    });
  }
}
