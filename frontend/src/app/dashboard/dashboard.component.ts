import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router) { }

  goToPortal(portal: string): void {
    if (portal === 'customer') {
      this.router.navigate(['/customer/login']);
    } else if (portal === 'vendor') {
      this.router.navigate(['/vendor/login']);
    } else if (portal === 'employee') {
      this.router.navigate(['/employee/login']);
    }
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning!';
    } else if (hour < 17) {
      return 'Good Afternoon!';
    } else {
      return 'Good Evening!';
    }
  }
}