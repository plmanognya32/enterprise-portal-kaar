import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-customernavbar',
  imports: [RouterLink],
  templateUrl: './customernavbar.component.html',
  styleUrl: './customernavbar.component.css'
})
export class CustomernavbarComponent {

  constructor(private location: Location, private router: Router) { }

  goBack() {
    this.location.back();
  }

  logout() {
    // Clear session or authentication data
    sessionStorage.removeItem('customerId'); // or customerId
    this.router.navigate(['/login']); // Redirect to login page
  }
}
