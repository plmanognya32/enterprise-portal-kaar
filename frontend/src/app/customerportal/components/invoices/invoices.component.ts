import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CustomernavbarComponent } from '../customernavbar/customernavbar.component';
import { InvoicePage, ApiResponse, Invoice } from '../../models/customer.models';
import { saveAs } from "file-saver";


@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
  standalone: true,
  imports: [CommonModule, CustomernavbarComponent]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  customerNumber: string = localStorage.getItem("customer-id") || '';
  loading = true;
  downloading = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    console.log('Customer Number from localStorage:', this.customerNumber);
    if (this.customerNumber) {
      this.fetchInvoices();
    } else {
      this.errorMessage = 'Customer ID not found in local storage. Please log in.';
      this.loading = false;
    }
  }

  fetchInvoices(): void {
    this.loading = true;
    this.errorMessage = null;
    console.log('Fetching invoices for kunnr:', this.customerNumber);
    this.http.post<ApiResponse>('http://localhost:3001/api/sap-invoices', { kunnr: this.customerNumber })
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.loading = false;
          if (response.success && response.data.length > 0) {
            this.invoices = response.data;
            console.log('Invoices:', this.invoices);
          } else {
            this.errorMessage = response.error || 'No invoices found for this customer.';
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.sapFault || error.message || 'Failed to load invoices. Please try again later.';
          console.error('Error fetching invoices:', error);
        }
      });
  }

  downloadInvoicePDF(invoice: Invoice): void {
    this.downloading = true;
    const payload = {
      vbeln: invoice.invoiceNumber,
      posnr: invoice.itemNumber
    };

    this.http.post<{ pdfBase64: string }>('http://localhost:3001/api/get-invoice-pdf', payload)
      .subscribe({
        next: (response) => {
          const base64 = response.pdfBase64;

          if (!base64) {
            throw new Error('No PDF data received.');
          }

          const binary = atob(base64);
          const byteArray = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            byteArray[i] = binary.charCodeAt(i);
          }

          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const fileName = `invoice_${payload.vbeln}_${payload.posnr}.pdf`;
          saveAs(blob, fileName);
          this.downloading = false;
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.downloading = false;
          alert('Failed to download invoice PDF.');
        }
      });
  }


}
