import { Component, OnInit } from '@angular/core';
import { CreditDebitService } from '../../services/memos.service';
import { CommonModule } from '@angular/common';
import { VendornavbarComponent } from '../vendornavbar/vendornavbar.component';

@Component({
  imports: [CommonModule, VendornavbarComponent],
  selector: 'app-vendorcreditdebit',
  templateUrl: './vendormemos.component.html',
})
export class VendorCreditDebitComponent implements OnInit {
  memos: any[] = [];
  loading = true;
  error: string | null = null;
  vendorNumber = localStorage.getItem('vendorId') || '';

  constructor(private creditDebitService: CreditDebitService) { }

  ngOnInit(): void {
    this.fetchCreditDebitMemos();
  }

  fetchCreditDebitMemos() {
    this.loading = true;
    this.creditDebitService.getVendorCreditDebitMemos(this.vendorNumber).subscribe({
      next: (response) => {
        console.log('Fetched memos response:', response);
        this.memos = response.cdmemos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching memos:', err);
        this.error = 'Failed to fetch memos. Please try again later.';
        this.loading = false;
      },
    });
  }
}