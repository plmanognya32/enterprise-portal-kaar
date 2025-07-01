import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CreditDebitService {
    private apiUrl = 'http://localhost:3000/api/vendor/financials/memos';

    constructor(private http: HttpClient) { }

    getVendorCreditDebitMemos(vendorNumber: string): Observable<{ cdmemos: any[] }> {
        return this.http.get<{ cdmemos: any[] }>(`${this.apiUrl}/${vendorNumber}`);
    }
}