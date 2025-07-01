import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vendornavbar',
  imports: [RouterLink],
  templateUrl: './vendornavbar.component.html',
  styleUrl: './vendornavbar.component.css'
})
export class VendornavbarComponent {
  constructor(private router: Router) { }
  goBack(): void {
    this.router.navigate(['/vendor/vendordashboard']); // Adjust based on your back navigation logic
  }

  logout(): void {
    // Implement logout logic (e.g., clear localStorage, navigate to login)
    localStorage.removeItem('vendorId'); // Adjust key if different for Vendor
    this.router.navigate(['/dashboard']); // Adjust to your login route
  }
}
