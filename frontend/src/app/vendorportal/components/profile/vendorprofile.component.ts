import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VendornavbarComponent } from "../vendornavbar/vendornavbar.component";

@Component({
  imports: [CommonModule, MatIconModule, VendornavbarComponent],
  selector: 'app-vendorprofile',
  templateUrl: './vendorprofile.component.html',
  styleUrls: ['./vendorprofile.component.css'],
  standalone: true
})
export class VendorProfileComponent implements OnInit {
  profile: any = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const vendorId = localStorage.getItem("vendorId") ?? '';
    if (!vendorId) {
      this.error = 'Vendor ID not found. Please log in again.';
      console.error('No vendorId found in localStorage');
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.get(`http://localhost:3000/api/vendor/profile/${vendorId}`).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (data && data.NAME1) {
          this.profile = data;
        } else if (data && data.error) {
          this.error = data.error;
        } else {
          this.error = 'Invalid profile data received.';
          console.error('Unexpected profile data:', data);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load vendor profile. Please try again later.';
        console.error('Failed to load vendor profile', err);
      }
    });
  }
}