import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeliveryService {
    constructor(private http: HttpClient) { }

    getDeliveries(kunnr: string): Observable<{ data: any[] }> {
        return this.http.post<{ data: any[] }>('http://localhost:3001/api/sap-deliveries', { kunnr }, { responseType: 'json' })
            .pipe(
                tap(() => console.log("Fetching deliveries")),
                catchError(error => {
                    console.error('Error fetching deliveries:', error);
                    return throwError(() => error);
                })
            );
    }
}