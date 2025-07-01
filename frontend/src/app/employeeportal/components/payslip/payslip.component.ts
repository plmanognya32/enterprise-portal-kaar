import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EmployeeNavbarComponent } from '../navbar/navbar.component';
import { saveAs } from 'file-saver';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    EmployeeNavbarComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
  ],
})
export class PaySlipComponent implements OnInit {
  payslips: any[] = [];
  employeeId = localStorage.getItem('employeeId');
  loading = true;
  downloading = false;
  errorMessage: string | null = null;

  readonly baseUrl = 'http://localhost:3002/api';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (!this.employeeId) {
      this.errorMessage = 'Employee ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    console.log('Fetching payslips for:', this.employeeId);
    this.fetchPayslips();
  }

  fetchPayslips(): void {
    this.loading = true;
    this.errorMessage = null;

    this.http
      .post<{ success: boolean; data?: any[]; error?: string }>(
        `${this.baseUrl}/payslips`,
        { employeeId: this.employeeId }
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success && res.data) {
            this.payslips = res.data.map((slip) => ({
              ...slip,
              lastChangedOn: new Date(slip.lastChangedOn).toISOString(), // Ensure date is in a valid format
            }));
          } else {
            this.errorMessage = res.error || 'No payslips found.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.message || 'Failed to load payslips.';
          console.error('Fetch error:', err);
        },
      });
  }

  downloadPayslip(payslipId: string): void {
    this.downloading = true;

    this.http
      .post<{ pdfBase64: string }>(`${this.baseUrl}/downloadpayslip`, {
        employeeId: this.employeeId,
        payslipId,
      })
      .subscribe({
        next: (res) => {
          this.downloading = false;

          const base64 = res.pdfBase64;
          if (!base64) {
            alert('No PDF received.');
            return;
          }

          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: 'application/pdf' });
          const fileName = `payslip_${this.employeeId}_${payslipId}.pdf`;
          saveAs(blob, fileName);
        },
        error: (err) => {
          this.downloading = false;
          console.error('Download error:', err);
          alert('Download failed.');
        },
      });
  }

  emailPayslip(payslipId: string): void {
    const email = prompt('Enter recipient email:');
    if (!email) return;

    this.http
      .post<{ success: boolean; error?: string }>(`${this.baseUrl}/emailpayslip`, {
        employeeId: this.employeeId,
        payslipId,
        email,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            alert('Payslip emailed successfully!');
          } else {
            alert('Email failed: ' + (res.error || 'Try again later.'));
          }
        },
        error: (err) => {
          console.error('Email error:', err);
          alert('Could not send payslip via email.');
        },
      });
  }
}