import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeLeaveData } from '../../models/employee.models';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EmployeeNavbarComponent } from '../navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-leave-data',
  imports: [
    CommonModule,
    HttpClientModule,
    EmployeeNavbarComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
  ],
  templateUrl: './leavedata.component.html',
  styleUrls: ['./leavedata.component.css'],
})
export class LeaveDataComponent implements OnInit {
  leaveHistory: EmployeeLeaveData[] = [];
  loading = true;
  error: string | null = null;

  selectedLeave: EmployeeLeaveData | null = null;
  showModal = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
      this.error = 'Employee ID not found in local storage';
      this.loading = false;
      return;
    }

    this.http
      .post<any>('http://localhost:3002/api/leavedata', { employeeId })
      .subscribe({
        next: (res) => {
          if (res && Array.isArray(res.leaveHistory)) {
            this.leaveHistory = res.leaveHistory;
          } else {
            this.error = 'Invalid response format';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to fetch leave data';
          console.error(err);
          this.loading = false;
        },
      });
  }

  viewLeave(leave: EmployeeLeaveData): void {
    this.selectedLeave = { ...leave };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLeave = null;
  }

  requestLeave(): void {
    // Implement navigation to a leave request form or open a modal
    console.log('Request Leave clicked');
    // Example: this.router.navigate(['/leave-request']);
  }
}