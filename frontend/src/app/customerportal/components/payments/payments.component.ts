import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomernavbarComponent } from '../customernavbar/customernavbar.component';
import { FinancialService } from '../../services/financial.service';
import { Payment } from '../../models/customer.models';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  standalone: true,
  imports: [CommonModule, CustomernavbarComponent]
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  customerNumber: string = localStorage.getItem("customer-id") || '';
  loading = true;
  error: string | null = null;

  constructor(private financialService: FinancialService) { }

  ngOnInit() {
    console.log('Customer Number from localStorage:', this.customerNumber);
    if (this.customerNumber) {
      this.financialService.getPayments(this.customerNumber).subscribe({
        next: (response) => {
          this.payments = response.data || [];
          this.loading = false;
          if (!response.data || response.data.length === 0) {
            this.error = 'No payments found for this customer.';
          }
        },
        error: (err) => {
          this.error = 'Error fetching payments: ' + (err.error?.details || err.message || 'Unknown error');
          this.loading = false;
          console.error('Payments error:', err);
        }
      });
    } else {
      this.error = 'Customer ID not found in local storage. Please log in.';
      this.loading = false;
    }
  }
}