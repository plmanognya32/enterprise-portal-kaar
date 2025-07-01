import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Inquiry,
    Order,
    Delivery,
    CustomerProfile
} from '../models/customer.models';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl = '/api/customer'; // Base API URL

    constructor(private http: HttpClient) { }

    // Profile Methods
    getProfile(): Observable<CustomerProfile> {
        return this.http.get<CustomerProfile>(`${this.apiUrl}/profile`);
    }

    updateProfile(profile: CustomerProfile): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/profile`, profile);
    }

    // Dashboard Methods
    getRecentInquiries(): Observable<Inquiry[]> {
        return this.http.get<Inquiry[]>(`${this.apiUrl}/inquiries/recent`);
    }

    getRecentOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/orders/recent`);
    }

    getUpcomingDeliveries(): Observable<Delivery[]> {
        return this.http.get<Delivery[]>(`${this.apiUrl}/deliveries/upcoming`);
    }

    // Inquiry Methods
    getAllInquiries(): Observable<Inquiry[]> {
        return this.http.get<Inquiry[]>(`${this.apiUrl}/inquiries`);
    }

    getInquiryById(id: number): Observable<Inquiry> {
        return this.http.get<Inquiry>(`${this.apiUrl}/inquiries/${id}`);
    }

    createInquiry(inquiry: Omit<Inquiry, 'id'>): Observable<Inquiry> {
        return this.http.post<Inquiry>(`${this.apiUrl}/inquiries`, inquiry);
    }

    // Order Methods
    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/orders`);
    }

    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
    }

    cancelOrder(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/orders/${id}/cancel`, {});
    }

    // Delivery Methods
    getAllDeliveries(): Observable<Delivery[]> {
        return this.http.get<Delivery[]>(`${this.apiUrl}/deliveries`);
    }

    getDeliveryById(id: number): Observable<Delivery> {
        return this.http.get<Delivery>(`${this.apiUrl}/deliveries/${id}`);
    }

    trackDelivery(trackingNumber: string): Observable<Delivery> {
        return this.http.get<Delivery>(`${this.apiUrl}/deliveries/track/${trackingNumber}`);
    }
}