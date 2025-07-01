import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import axios from "axios";

@Injectable({ providedIn: 'root' })
export class LoginService {
    private proxyUrl = environment.proxyUrl + '/api/sap-login';
    isAuthenticated = false;

    constructor(private http: HttpClient) { }

    async login(credentials: { customerId: string; password: string }) {
        try {
            const response = await axios.post(this.proxyUrl, credentials, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }


    isLoggedIn(): boolean {
        return this.isAuthenticated || !!localStorage.getItem('sap_session');
    }

    logout(): void {
        this.isAuthenticated = false;
        localStorage.removeItem('sap_session');
    }
}