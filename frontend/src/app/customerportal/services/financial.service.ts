import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Payment, Memo } from '../models/customer.models';

@Injectable({
    providedIn: 'root'
})
export class FinancialService {
    private apiUrl = 'http://localhost:3001/api/sap-financial';

    constructor(private http: HttpClient) { }

    getPayments(kunnr: string): Observable<{ data: Payment[] }> {
        console.log('Sending kunnr to backend:', kunnr);
        return this.http.post<{ data: Payment[] }>(
            `${this.apiUrl}/payments`,
            { kunnr },
            { responseType: 'json' }
        ).pipe(
            tap(() => console.log('Fetching payments for customer:', kunnr)),
            catchError(error => {
                console.error('Error fetching payments:', {
                    url: error.url,
                    status: error.status,
                    message: error.message,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }

    getMemos(kunnr: string): Observable<{ data: Memo[] }> {
        console.log('Sending kunnr to backend for memos:', kunnr);
        return this.http.post<{ data: Memo[] }>(
            `${this.apiUrl}/memos`,
            { kunnr },
            { responseType: 'json' }
        ).pipe(
            tap(() => console.log('Fetching memos for customer:', kunnr)),
            catchError(error => {
                console.error('Error fetching memos:', {
                    url: error.url,
                    status: error.status,
                    message: error.message,
                    error: error.error
                });
                return throwError(() => error);
            })
        );
    }
}