import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-employee-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class EmployeeNavbarComponent {
  constructor(private location: Location, private router: Router) { }
  goBack() {
    this.location.back();
  }

  logout() {
    // Clear session or authentication data
    sessionStorage.removeItem('employeeId'); // or customerId
    this.router.navigate(['/login']); // Redirect to login page
  }
}