import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VendorLoginService {
    private apiUrl = 'http://localhost:3000/api/login';

    constructor(private http: HttpClient) { }

    login(credentials: { vendorId: string; password: string }): Observable<{ success: boolean; result: 'Y' | 'N'; message: string }> {
        return this.http.post<{ success: boolean; result: 'Y' | 'N'; message: string }>(this.apiUrl, credentials);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('vendorId');
    }

    logout(): void {
        localStorage.removeItem('vendorId');
    }
}
