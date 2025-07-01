import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule, RouterOutlet],
  selector: 'app-employee-dashboard',
  templateUrl: './employeedashboard.component.html',
  styleUrls: ['./employeedashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employeeName = 'John Doe';
  department = 'Engineering';
  managerName = 'Jane Smith';

  projects = [
    { name: 'ERP Implementation', progress: 75 },
    { name: 'Mobile App Development', progress: 40 },
    { name: 'Website Redesign', progress: 90 }
  ];

  recentActivities = [
    { icon: 'assignment', title: 'Submitted timesheet for week 45', date: new Date() },
    { icon: 'flight_takeoff', title: 'Leave request approved', date: new Date(Date.now() - 86400000) },
    { icon: 'payments', title: 'Payslip for October generated', date: new Date(Date.now() - 172800000) }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}