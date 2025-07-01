import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { EMPLOYEE_ROUTES } from './employee.routes';
import { EmployeeDashboardComponent } from './components/dashboard/employeedashboard.component';
import { EmployeeLoginComponent } from './components/login/employeelogin.component';
import { EmployeeProfileComponent } from './components/profile/employeeprofile.component';
import { LeaveDataComponent } from './components/leavedata/leavedata.component';
import { PaySlipComponent } from './components/payslip/payslip.component';
import { EmployeeNavbarComponent } from './components/navbar/navbar.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        RouterModule.forChild(EMPLOYEE_ROUTES),
        // Import standalone components
        EmployeeDashboardComponent,
        EmployeeLoginComponent,
        EmployeeProfileComponent,
        LeaveDataComponent,
        PaySlipComponent,
        EmployeeNavbarComponent
    ]
})
export class EmployeeModule { }