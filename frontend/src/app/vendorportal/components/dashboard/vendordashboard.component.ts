import { Component, OnInit } from '@angular/core';
import { RFQService } from '../../services/rfq.service';
import { PurchaseOrderService } from '../../services/purchaseorder.service';
import { GoodsReceiptService } from '../../services/goodsreceipt.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendornavbarComponent } from '../vendornavbar/vendornavbar.component';
import { Observable } from 'rxjs';
import { RFQ, PurchaseOrder, GoodsReceipt } from '../../models/vendor.models';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendordashboard.component.html',
  styleUrls: ['./vendordashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VendornavbarComponent,
    FormsModule
  ]
})
export class VendorDashboardComponent implements OnInit {
  recentRFQs: RFQ[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  goodsReceipts: GoodsReceipt[] = [];
  activeTab: 'rfqs' | 'purchaseOrders' | 'goodsReceipts' = 'rfqs';
  vendorNumber: string = '';
  searchQuery: string = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  filteredRFQs: RFQ[] = [];
  filteredPurchaseOrders: PurchaseOrder[] = [];
  filteredGoodsReceipts: GoodsReceipt[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private rfqService: RFQService,
    private purchaseOrderService: PurchaseOrderService,
    private goodsReceiptService: GoodsReceiptService,
    private http: HttpClient
  ) { }


  ngOnInit() {
    this.vendorNumber = localStorage.getItem("vendorId") ?? '';
    if (this.vendorNumber && this.vendorNumber.length === 10) {
      this.fetchRFQs();
      this.fetchPurchaseOrders();
      this.fetchGoodsReceipts();
    } else {
      this.error = 'Vendor ID not found. Please log in again.';
      console.error('No vendorId found in localStorage');
    }
  }

  fetchRFQs() {
    this.loading = true;
    this.error = null;
    this.rfqService.getRFQs(this.vendorNumber).subscribe({
      next: (response: { rfqs: any[] }) => {
        const rfqData = response.rfqs ?? [];
        this.recentRFQs = rfqData.map((item: any, index: number) => ({
          id: item.id || `rfq-${index}`,
          vendorNumber: item.vendorNumber || this.vendorNumber,
          documentNumber: item.documentNumber || 'N/A',
          documentType: item.documentType || 'N/A',
          date: item.date ? new Date(item.date) : new Date(),
          purchasingOrg: item.purchasingOrg || 'N/A',
          purchasingGroup: item.purchasingGroup || 'N/A',
          itemNumber: item.itemNumber || 'N/A',
          material: item.material || 'N/A',
          storageLocation: item.storageLocation || 'N/A',
          description: item.description || 'No description',
          priceUnit: item.priceUnit || '1',
          quantity: String(item.quantity || '0'),
          unit: item.unit || 'N/A',
          subject: item.subject || 'Request for Quotation',
          status: item.status || 'Open'
        }));
        this.filteredRFQs = [...this.recentRFQs].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch RFQs', err);
        this.loading = false;
      }
    });
  }

  fetchPurchaseOrders() {
    this.loading = true;
    this.error = null;
    this.purchaseOrderService.getPurchaseOrders(this.vendorNumber).subscribe({
      next: (response: { purchaseOrders: any[] }) => {
        const purchaseOrderData = response.purchaseOrders ?? [];
        this.purchaseOrders = purchaseOrderData.map((item: any, index: number) => ({
          id: item.id || `po-${index}`,
          vendorNumber: item.vendorNumber || this.vendorNumber,
          documentNumber: item.documentNumber || 'N/A',
          companyCode: item.companyCode || 'N/A',
          purchasingOrg: item.purchasingOrg || 'N/A',
          purchasingGroup: item.purchasingGroup || 'N/A',
          documentCategory: item.documentCategory || 'N/A',
          documentType: item.documentType || 'N/A',
          itemNumber: item.itemNumber || 'N/A',
          material: item.material || 'N/A',
          quantity: String(item.quantity || '0'),
          unit: item.unit || 'N/A',
          priceUnit: item.priceUnit || 'N/A',
          date: item.date ? new Date(item.date) : new Date(),
          total: item.total || 0,
          status: item.status || 'Open'
        }));

        this.filteredPurchaseOrders = [...this.purchaseOrders].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch purchase orders', err);
        this.loading = false;
      }
    });
  }

  fetchGoodsReceipts() {
    this.loading = true;
    this.error = null;
    this.goodsReceiptService.getGoodsReceipts(this.vendorNumber).subscribe({
      next: (response: { goodsReceipts: any[] }) => {
        const goodsReceiptData = response.goodsReceipts ?? [];
        this.goodsReceipts = goodsReceiptData.map((item: any, index: number) => ({
          id: item.id || `gr-${index}`,
          vendorNumber: item.vendorNumber || this.vendorNumber,
          documentNumber: item.documentNumber || "N/A",
          documentYear: item.documentYear || "N/A",
          postingDate: item.postingDate
            ? new Date(parseInt(item.postingDate.match(/\d+/)[0]))
            : new Date(),
          documentDate: item.documentDate
            ? new Date(parseInt(item.documentDate.match(/\d+/)[0]))
            : new Date(),
          createdBy: item.createdBy || "N/A",
          trackingNumber: item.trackingNumber || "N/A",
          itemNumber: item.itemNumber || "N/A",
          movementType: item.movementType || "N/A",
          purchaseOrderNumber: item.purchaseOrderNumber || "N/A",
          purchaseOrderItem: item.purchaseOrderItem || "N/A",
          storageLocation: item.storageLocation || "N/A",
          batchNumber: item.batchNumber || "N/A",
          quantity: String(item.quantity || "0"),
          unit: item.unit || "N/A",
          status: item.status || 'Open',
        }));
        this.filteredGoodsReceipts = [...this.goodsReceipts].sort((a, b) => {
          const dateA = new Date(a.postingDate).getTime();
          const dateB = new Date(b.postingDate).getTime();
          return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to fetch goods receipts', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    if (this.activeTab === 'rfqs') {
      let results = this.recentRFQs;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(rfq =>
          (rfq.subject?.toLowerCase()?.includes(query) || false) ||
          (rfq.description?.toLowerCase()?.includes(query) || false) ||
          (rfq.documentNumber?.toLowerCase()?.includes(query) || false)
        );
      }
      this.filteredRFQs = [...results].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (this.activeTab === 'purchaseOrders') {
      let results = this.purchaseOrders;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(order =>
          (order.documentCategory?.toLowerCase()?.includes(query) || false) ||
          (order.documentNumber?.toLowerCase()?.includes(query) || false) ||
          (order.material?.toLowerCase()?.includes(query) || false) ||
          (order.itemNumber?.toLowerCase()?.includes(query) || false) ||
          (order.quantity?.toLowerCase()?.includes(query) || false)
        );
      }
      this.filteredPurchaseOrders = [...results].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (this.activeTab === 'goodsReceipts') {
      let results = this.goodsReceipts;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        results = results.filter(receipt =>
          (receipt.purchaseOrderItem?.toLowerCase()?.includes(query) || false) ||
          (receipt.documentNumber?.toLowerCase()?.includes(query) || false) ||
          (receipt.trackingNumber?.toLowerCase()?.includes(query) || false) ||
          (receipt.movementType?.toLowerCase()?.includes(query) || false) ||
          (receipt.batchNumber?.toLowerCase()?.includes(query) || false) ||
          (receipt.purchaseOrderNumber?.toLowerCase()?.includes(query) || false)
        );
      }
      this.filteredGoodsReceipts = [...results].sort((a, b) => {
        const dateA = new Date(a.documentDate).getTime();
        const dateB = new Date(b.documentDate).getTime();
        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
  }

  sortByDate(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.applyFilters();
  }

}