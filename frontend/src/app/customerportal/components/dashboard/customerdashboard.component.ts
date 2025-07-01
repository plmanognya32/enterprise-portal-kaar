import { Component, OnInit } from '@angular/core';
import { InquiryService } from '../../services/inquiry.service';
import { SalesService } from '../../services/sales.service';
import { DeliveryService } from '../../services/delivery.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomernavbarComponent } from '../customernavbar/customernavbar.component';
import { Observable } from 'rxjs';
import { Inquiry, Sales, Delivery } from '../../models/customer.models';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Added for PDF download

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customerdashboard.component.html',
  styleUrls: ['./customerdashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CustomernavbarComponent,
    FormsModule
  ]
})
export class CustomerDashboardComponent implements OnInit {
  recentInquiries: Inquiry[] = [];
  salesOrders: Sales[] = [];
  deliveries: Delivery[] = [];
  activeTab: 'inquiries' | 'orders' | 'deliveries' = 'inquiries';
  customerNumber: string = '';
  searchQuery: string = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  filteredInquiries: Inquiry[] = [];
  filteredSales: Sales[] = [];
  filteredDeliveries: Delivery[] = [];
  loading: boolean = false; // Added loading property
  error: string | null = null; // Added error property

  constructor(
    private inquiryService: InquiryService,
    private salesService: SalesService,
    private deliveryService: DeliveryService,
    private http: HttpClient // Added for PDF download
  ) { }

  inquiries$!: Observable<{ data: Inquiry[] }>;

  ngOnInit() {
    this.customerNumber = localStorage.getItem("customer-id") ?? '';
    if (this.customerNumber) {
      this.inquiries$ = this.inquiryService.getInquiries(this.customerNumber);
    }
    this.fetchInquiries();
    this.fetchSales();
    this.fetchDeliveries();
  }

  fetchInquiries() {
    this.loading = true; // Set loading to true
    this.error = null; // Reset error
    this.inquiryService.getInquiries(this.customerNumber).subscribe({
      next: (response) => {
        this.recentInquiries = response.data ?? [];
        this.filteredInquiries = [...this.recentInquiries].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        this.loading = false; // Set loading to false
      },
      error: (err) => {
        this.error = 'Failed to fetch inquiries. Please try again later.';
        console.error('Failed to fetch inquiries', err);
        this.loading = false; // Set loading to false
      }
    });
  }

  fetchSales() {
    this.loading = true;
    this.error = null;
    console.log('Fetching sales for customer:', this.customerNumber);
    this.salesService.getSales(this.customerNumber).subscribe({
      next: (response) => {
        console.log('Raw sales response:', response);
        if ((response as any).success === false) {
          console.error('Sales fetch failed:', response);
          this.salesOrders = [];
          this.filteredSales = [];
          this.error = 'Failed to fetch sales orders.';
          this.loading = false;
          return;
        }
        const salesData = response.data ?? [];
        console.log('Sales data array:', salesData);
        if (salesData.length === 0) {
          console.log('No sales data found');
          this.salesOrders = [];
          this.filteredSales = [];
          this.loading = false;
          return;
        }
        this.salesOrders = salesData.map((item: any, index: number) => ({
          id: item.id || `sales-${index}`,
          documentNumber: item.documentNumber || 'N/A',
          customerNumber: item.customerNumber || this.customerNumber,
          position: item.position || '1',
          date: item.date ? new Date(item.date) : null,
          requestDeliveryDate: item.requestDeliveryDate ? new Date(item.requestDeliveryDate) : null,
          material: item.material || 'N/A',
          description: item.description || 'No description',
          quantity: String(item.quantity || '0'),
          unit: item.unit || 'PC',
          netValue: String(item.netValue || '0'),
          currency: item.currency || 'USD',
          orderType: item.orderType || 'Standard',
          reference: item.reference || '',
          processingStatus: item.processingStatus || 'Open',
          deliveryStatus: item.deliveryStatus || 'Not Delivered',
          storageLocation: item.storageLocation || '',
          division: item.division || '',
          status: item.status || 'Open'
        }));
        this.filteredSales = [...this.salesOrders];
        console.log("Sales orders loaded:", this.salesOrders);
        console.log("Filtered sales:", this.filteredSales);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch sales orders. Please try again later.';
        console.error('Failed to fetch sales orders', err);
        this.salesOrders = [];
        this.filteredSales = [];
        this.loading = false;
      }
    });
  }

  fetchDeliveries() {
    this.loading = true;
    this.error = null;
    console.log('Fetching deliveries for customer:', this.customerNumber);
    this.deliveryService.getDeliveries(this.customerNumber).subscribe({
      next: (response) => {
        console.log('Raw deliveries response:', response);
        if ((response as any).success === false) {
          console.error('Deliveries fetch failed:', response);
          this.deliveries = [];
          this.filteredDeliveries = [];
          this.error = 'Failed to fetch deliveries.';
          this.loading = false;
          return;
        }
        const deliveryData = response.data ?? [];
        console.log('Delivery data array:', deliveryData);
        if (deliveryData.length === 0) {
          console.log('No delivery data found');
          this.deliveries = [];
          this.filteredDeliveries = [];
          this.loading = false;
          return;
        }
        this.deliveries = deliveryData.map((item: any, index: number) => ({
          id: item.id || `delivery-${index}`,
          documentNumber: item.documentNumber || 'N/A',
          customerNumber: item.customerNumber || this.customerNumber,
          shippingPoint: item.shippingPoint || 'N/A',
          deliveryType: item.deliveryType || 'N/A',
          deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
          goodsIssueDate: item.goodsIssueDate ? new Date(item.goodsIssueDate) : null,
          salesOrganization: item.salesOrganization || 'N/A',
          createdBy: item.createdBy || 'N/A',
          creationDate: item.creationDate ? new Date(item.creationDate) : null,
          position: item.position || '1',
          material: item.material || 'N/A',
          description: item.description || 'No description',
          quantity: String(item.quantity || '0'),
          unit: item.unit || 'EA',
          plant: item.plant || 'N/A',
          storageLocation: item.storageLocation || 'N/A',
          status: item.status || 'Open'
        }));
        this.filteredDeliveries = [...this.deliveries];
        console.log("Deliveries loaded:", this.deliveries);
        console.log("Filtered deliveries:", this.filteredDeliveries);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch deliveries. Please try again later.';
        console.error('Failed to fetch deliveries', err);
        this.deliveries = [];
        this.filteredDeliveries = [];
        this.loading = false;
      }
    });
  }

  applyFilters() {
    if (this.activeTab === 'inquiries') {
      let results = this.recentInquiries;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(inquiry =>
          (inquiry.subject?.toLowerCase()?.includes(query) || false) ||
          (inquiry.description?.toLowerCase()?.includes(query) || false) ||
          (inquiry.documentNumber?.toLowerCase()?.includes(query) || false)
        );
      }
      this.filteredInquiries = [...results].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (this.activeTab === 'orders') {
      let results = this.salesOrders;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(order =>
          (order.description?.toLowerCase()?.includes(query) || false) ||
          (order.documentNumber?.toLowerCase()?.includes(query) || false) ||
          (order.material?.toLowerCase()?.includes(query) || false)
        );
      }
      this.filteredSales = [...results].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (this.activeTab === 'deliveries') {
      let results = this.deliveries;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(delivery =>
          (delivery.description?.toLowerCase()?.includes(query) || false) ||
          (delivery.documentNumber?.toLowerCase()?.includes(query) || false) ||
          (delivery.material?.toLowerCase()?.includes(query) || false)
        );
      }
      this.filteredDeliveries = [...results].sort((a, b) => {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
        const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
  }

  sortByDate(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.applyFilters();
  }

  // Method to download PDF for a sales order
  downloadPDF(order: Sales) {
    this.loading = true;
    this.error = null;
    const vbeln = order.documentNumber; // Assuming documentNumber maps to VBELN
    const url = `/sap/opu/odata/sap/Z_INVOICE_SRV/GenerateInvoicePDF?IV_VBELN='${vbeln}'`; // Adjust the URL based on your OData service

    this.http.get(url, { responseType: 'json' }).subscribe({
      next: (response: any) => {
        if (response.EV_ERROR) {
          this.error = response.EV_ERROR;
          this.loading = false;
          return;
        }

        const pdfBase64 = response.EV_PDF;
        const binaryString = atob(pdfBase64);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `invoice_${vbeln}.pdf`;
        link.click();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to download PDF. Please try again later.';
        console.error('Failed to download PDF', err);
        this.loading = false;
      }
    });
  }
}