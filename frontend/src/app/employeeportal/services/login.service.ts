import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { employeeenvironment } from "../../../environments/environment";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EmployeeLoginService {
    private proxyUrl = employeeenvironment.proxyUrl + '/api/login';
    isAuthenticated = false;

    constructor(private http: HttpClient) { }

    login(credentials: { employeeId: string; password: string }): Observable<any> {
        return this.http.post<{
            success: boolean;
            message: string;
            sapError?: any;
        }>(this.proxyUrl, credentials, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        });
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated || !!localStorage.getItem('sap_session');
    }

    logout(): void {
        this.isAuthenticated = false;
        localStorage.removeItem('sap_session');
    }
}