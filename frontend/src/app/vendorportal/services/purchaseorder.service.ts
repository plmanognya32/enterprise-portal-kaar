import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {
    private apiUrl = 'http://localhost:3000/api/vendor/purchase-orders';

    constructor(private http: HttpClient) { }

    getPurchaseOrders(vendorNumber: string): Observable<{ purchaseOrders: any[] }> {
        return this.http.get<{ purchaseOrders: any[] }>(`${this.apiUrl}/${vendorNumber}`);
    }
}