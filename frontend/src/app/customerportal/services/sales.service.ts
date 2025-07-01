//sales.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SalesService {
    constructor(private http: HttpClient) { }

    getSales(kunnr: string): Observable<{ data: any[] }> {
        return this.http.post<{ data: any[] }>('http://localhost:3001/api/sap-sales', { kunnr }, { responseType: 'json' })
            .pipe(
                tap(() => console.log("Sales data fetched")),
                catchError(error => {
                    console.error('Error fetching sales:', error);
                    return throwError(() => error);
                })
            );
    }
}