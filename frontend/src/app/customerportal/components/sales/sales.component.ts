import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomernavbarComponent } from '../customernavbar/customernavbar.component';
import { SalesService } from '../../services/sales.service';
import { Sales } from '../../models/customer.models';

@Component({
  selector: 'app-overall-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  standalone: true,
  imports: [CommonModule, CustomernavbarComponent]
})
export class SalesComponent implements OnInit {
  salesOrders: Sales[] = [];
  filteredSales: Sales[] = [];
  customerNumber: string = localStorage.getItem("customer-id") || '';
  loading = true;
  error: string | null = null;

  constructor(private salesService: SalesService) { }

  ngOnInit() {
    console.log('Customer Number from localStorage:', this.customerNumber);
    if (this.customerNumber) {
      this.fetchSales();
    } else {
      this.error = 'Customer ID not found in local storage. Please log in.';
      this.loading = false;
    }
  }

  fetchSales() {
    console.log('Fetching sales for customer:', this.customerNumber);
    this.salesService.getSales(this.customerNumber).subscribe({
      next: (response) => {
        console.log('Raw sales response:', response);
        if ((response as any).success === false) {
          console.error('Sales fetch failed:', response);
          this.salesOrders = [];
          this.filteredSales = [];
          this.error = 'Failed to fetch sales data.';
          this.loading = false;
          return;
        }
        const salesData = response.data ?? [];
        console.log('Sales data array:', salesData);
        if (salesData.length === 0) {
          console.log('No sales data found');
          this.salesOrders = [];
          this.filteredSales = [];
          this.error = 'No sales orders found.';
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
        console.error('Failed to fetch sales orders', err);
        this.salesOrders = [];
        this.filteredSales = [];
        this.error = 'Error fetching sales: ' + (err.error?.details || err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }
}