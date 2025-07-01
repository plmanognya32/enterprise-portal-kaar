// profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private apiUrl = 'http://localhost:3001/api/sap-profile';

    constructor(private http: HttpClient) { }

    getProfile(customerId: string): Observable<any> {
        return this.http.post(this.apiUrl, { customerId }).pipe(
            catchError(error => {
                console.error('Profile Service Error:', error);
                let errorMessage = 'Unknown error occurred';

                if (error.error?.sapError) {
                    // Try to parse SAP SOAP fault
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(error.error.sapError, "text/xml");
                    const faultString = xmlDoc.getElementsByTagName("faultstring")[0]?.textContent;
                    errorMessage = faultString || 'SAP system error';
                } else if (error.error?.message) {
                    errorMessage = error.error.message;
                }

                return throwError(() => new Error(errorMessage));
            })
        );
    }
}