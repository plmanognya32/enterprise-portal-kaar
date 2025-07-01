import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomernavbarComponent } from '../customernavbar/customernavbar.component';
import { FinancialService } from '../../services/financial.service';
import { Memo } from '../../models/customer.models';

@Component({
  selector: 'app-memos',
  templateUrl: './memos.component.html',
  styleUrls: ['./memos.component.css'],
  standalone: true,
  imports: [CommonModule, CustomernavbarComponent]
})
export class MemosComponent implements OnInit {
  memos: Memo[] = [];
  customerNumber: string = localStorage.getItem("customer-id") || '';
  loading = true;
  error: string | null = null;

  constructor(private financialService: FinancialService) { }

  ngOnInit() {
    console.log('Customer Number from localStorage:', this.customerNumber);
    if (this.customerNumber) {
      this.financialService.getMemos(this.customerNumber).subscribe({
        next: (response) => {
          this.memos = response.data || [];
          this.loading = false;
          if (!response.data || response.data.length === 0) {
            this.error = 'No memos found for this customer.';
          }
        },
        error: (err) => {
          this.error = 'Error fetching memos: ' + (err.error?.details || err.message || 'Unknown error');
          this.loading = false;
          console.error('Memos error:', err);
        }
      });
    } else {
      this.error = 'Customer ID not found in local storage. Please log in.';
      this.loading = false;
    }
  }
}