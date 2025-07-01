//inquiry.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InquiryService {
    constructor(private http: HttpClient) { }
    getInquiries(kunnr: string): Observable<{ data: any[] }> {
        return this.http.post<{ data: any[] }>('http://localhost:3001/api/sap-inquiries', { kunnr }, { responseType: 'json' })
            .pipe(
                tap(() => console.log("In service")),
                catchError(error => {
                    console.error('Error fetching inquiries:', error);
                    return throwError(() => error);
                })
            );
    }
}