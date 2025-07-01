import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RFQService {
    private apiUrl = 'http://localhost:3000/api/vendor/rfqs';

    constructor(private http: HttpClient) { }

    getRFQs(vendorNumber: string): Observable<{ rfqs: any[] }> {
        return this.http.get<{ rfqs: any[] }>(`${this.apiUrl}/${vendorNumber}`);
    }
}