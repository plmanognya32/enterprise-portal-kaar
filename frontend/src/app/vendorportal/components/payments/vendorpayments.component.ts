import { Component, OnInit } from '@angular/core';
import { VendorPaymentService } from '../../services/vendor-payment.service';
import { CommonModule } from '@angular/common';
import { VendornavbarComponent } from '../vendornavbar/vendornavbar.component';

@Component({
  imports: [CommonModule, VendornavbarComponent],
  selector: 'app-vendorpayments',
  templateUrl: './vendorpayments.component.html',
  styleUrls: ['./vendorpayments.component.css']
})
export class VendorPaymentsComponent implements OnInit {
  payments: any[] = [];
  loading = false;
  error: string | null = null;
  vendorNumber = localStorage.getItem('vendorId') || '';

  constructor(private paymentService: VendorPaymentService) { }

  ngOnInit(): void {
    this.fetchPayments();
  }

  fetchPayments() {
    this.loading = true;
    this.paymentService.getVendorPayments(this.vendorNumber).subscribe({
      next: (response) => {
        this.payments = response.payments;
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Error fetching payments:", err);
        this.error = "Failed to fetch payments.";
        this.loading = false;
      },
    });
  }
}
