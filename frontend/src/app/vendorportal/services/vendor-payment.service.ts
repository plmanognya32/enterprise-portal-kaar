import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VendorPaymentService {
    private apiUrl = 'http://localhost:3000/api/vendor/financials/payments';

    constructor(private http: HttpClient) { }

    getVendorPayments(vendorNumber: string): Observable<{ payments: any[] }> {
        return this.http.get<{ payments: any[] }>(`${this.apiUrl}/${vendorNumber}`);
    }
}
