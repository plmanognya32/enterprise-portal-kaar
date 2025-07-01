import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileFieldComponent } from './profile-field.component';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeNavbarComponent } from '../navbar/navbar.component';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileFieldComponent,
    MatIconModule,
    EmployeeNavbarComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './employeeprofile.component.html',
  styleUrls: ['./employeeprofile.component.css'],
})
export class EmployeeProfileComponent implements OnInit {
  employeeProfile: {
    employeeId: string;
    name: string;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
    address?: string;
    joiningDate?: string;
    position?: string;
    companyCode?: string;
    personnelArea?: string;
    personnelSubarea?: string;
    employeeGroup?: string;
    employeeSubGroup?: string;
    organizationalKey?: string;
    payrollArea?: string;
    adminGroup?: string;
    lastUpdated?: string;
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

    const employeeId = localStorage.getItem('employee-id') || '';
    //const employeeId = '00000001'; // For testing

    this.profileService.getProfile(employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.employeeProfile = response.profile;
        } else {
          this.error = 'Failed to fetch profile';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error connecting to server';
        this.loading = false;
        console.error('Profile load error:', err);
      },
    });
  }
}