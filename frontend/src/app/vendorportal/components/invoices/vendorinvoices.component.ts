import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👉 Import this
import { VendornavbarComponent } from '../vendornavbar/vendornavbar.component';

@Component({
  selector: 'app-vendorinvoices',
  standalone: true,
  imports: [CommonModule, FormsModule, VendornavbarComponent], // ✅ Add FormsModule here
  templateUrl: './vendorinvoices.component.html',
  styleUrls: ['./vendorinvoices.component.css']
})
export class VendorInvoicesComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  searchTerm: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const vendorId = localStorage.getItem('vendorId') || '1000000000';
    this.http.get<any[]>(`http://localhost:3000/api/invoices?vendorId=${vendorId}`)
      .subscribe(data => {
        this.invoices = data;
        this.filteredInvoices = data;
      });
  }

  filterInvoices() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredInvoices = this.invoices.filter(invoice =>
      invoice.Belnr.toLowerCase().includes(term)
    );
  }

  downloadPDF(belnr: string) {
    window.open(`http://localhost:3000/api/invoice/${belnr}/pdf`, '_blank');
  }
}
