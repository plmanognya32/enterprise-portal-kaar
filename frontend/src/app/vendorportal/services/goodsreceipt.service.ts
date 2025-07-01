import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GoodsReceiptService {
    private apiUrl = 'http://localhost:3000/api/vendor/goodsreceipt';

    constructor(private http: HttpClient) { }

    getGoodsReceipts(vendorNumber: string): Observable<{ goodsReceipts: any[] }> {
        return this.http.get<{ goodsReceipts: any[] }>(`${this.apiUrl}/${vendorNumber}`);
    }
}